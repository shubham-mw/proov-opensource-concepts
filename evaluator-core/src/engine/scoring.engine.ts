import {
  AgentEvaluationOutput,
  PassThresholds,
  DEFAULT_THRESHOLDS,
} from '../schemas/agent-evaluation.schema';

export interface ScorecardResult {
  finalScore: number;
  pass: boolean;
  flags: string[];
  needsHumanReview: boolean;
  humanReviewReason: string | null;
  detailedFeedback: {
    thinkingSkills: string[];
    plusPoints: string[];
    areasForImprovement: string[];
  } | null;
  agentSummaries: {
    agentType: string;
    score: number;
    pass: boolean;
    confidence: number;
    reasoning: string;
    topFlags: string[];
  }[];
  engineVersion: string;
}

/**
 * ScoringEngine — Deterministic evaluator aggregator.
 * Computes scores, evaluates confidence metrics, maps integrity alerts,
 * and determines if a human review guardrail is required.
 */
export class ScoringEngine {
  private readonly ENGINE_VERSION = '1.0.0';

  computeScorecard(
    evaluations: AgentEvaluationOutput[],
    thresholds?: Partial<PassThresholds>,
  ): ScorecardResult {
    const t: PassThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

    // 1. Extract Expert Evaluation
    const expertEval = evaluations.find((e) => e.agentType === 'EXPERT');
    const finalScore = expertEval ? expertEval.score : 0;
    
    const agentSummaries = evaluations.map((evaluation) => ({
      agentType: evaluation.agentType,
      score: evaluation.score,
      pass: evaluation.pass,
      confidence: evaluation.confidence,
      reasoning: evaluation.reasoning,
      topFlags: evaluation.flags.slice(0, 5),
    }));

    // 2. Determine pass/fail
    const meetsOverallThreshold = finalScore >= t.overall;
    const pass = expertEval ? (expertEval.pass && meetsOverallThreshold) : false;

    // 3. Extract Detailed Feedback
    const detailedFeedback = expertEval ? {
      thinkingSkills: expertEval.thinkingSkills || [],
      plusPoints: expertEval.plusPoints || [],
      areasForImprovement: expertEval.areasForImprovement || [],
    } : null;

    // 4. Collect all integrity flags
    const flags = [
      ...new Set(evaluations.flatMap((e) => e.flags)),
    ];

    // 5. Apply Human Review Guardrails
    const lowConfidence = evaluations.some((e) => e.confidence < 0.6);
    const hasIntegrityFlag = flags.some(
      (f) =>
        f.includes('PLAGIARISM') ||
        f.includes('AI_GENERATED') ||
        f.includes('CROSS_SUBMISSION'),
    );
    const agentFailed = !expertEval || (expertEval.score === 0 && expertEval.confidence === 0);

    const needsHumanReview = lowConfidence || hasIntegrityFlag || agentFailed;

    let humanReviewReason: string | null = null;
    if (agentFailed) {
      humanReviewReason = 'Expert grading agent execution failed';
    } else if (hasIntegrityFlag) {
      humanReviewReason = 'Integrity alert triggered (potential plagiarism or generative code leak)';
    } else if (lowConfidence) {
      humanReviewReason = 'Low grading confidence score detected';
    }

    return {
      finalScore,
      pass,
      flags,
      needsHumanReview,
      humanReviewReason,
      agentSummaries,
      detailedFeedback,
      engineVersion: this.ENGINE_VERSION,
    };
  }
}
