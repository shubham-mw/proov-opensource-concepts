import { EvaluationContext, AgentEvaluationOutput } from '../schemas/agent-evaluation.schema';
import { ProjectExpertAgent } from '../agent/expert.agent';
import { ScoringEngine, ScorecardResult } from '../engine/scoring.engine';

export interface EvaluationOrchestratorResult {
  runId: string;
  submissionId: string;
  status: 'COMPLETED' | 'NEEDS_HUMAN_REVIEW' | 'FAILED';
  scorecard: ScorecardResult;
  evaluatedAt: string;
}

/**
 * EvaluationProcessor — Framework-agnostic pipeline orchestrator.
 * Coordinates loading, expert agent scoring, aggregation, and scoring.
 */
export class EvaluationProcessor {
  private readonly expertAgent = new ProjectExpertAgent();
  private readonly scoringEngine = new ScoringEngine();

  async process(ctx: EvaluationContext, options?: { simulateAgentFailure?: boolean, forceFailGrading?: boolean }): Promise<EvaluationOrchestratorResult> {
    const runId = 'run_' + Math.random().toString(36).substring(2, 9);
    console.log(`[Orchestrator] Starting Evaluation Run: ${runId} for submission ${ctx.submission.id}`);

    try {
      let evaluations: AgentEvaluationOutput[] = [];

      if (options?.simulateAgentFailure) {
        // Simulate a complete pipeline agent failure
        console.warn('[Orchestrator] Simulating expert grading agent failure...');
      } else {
        // Run the agent model grading logic
        const expertResult = await this.expertAgent.evaluateMock(ctx, !options?.forceFailGrading);
        evaluations.push(expertResult);
      }

      // Aggregate outputs deterministically
      const scorecard = this.scoringEngine.computeScorecard(evaluations, { overall: 55 });

      const status = scorecard.needsHumanReview ? 'NEEDS_HUMAN_REVIEW' : 'COMPLETED';

      console.log(`[Orchestrator] Scorecard Aggregated successfully: Final Score = ${scorecard.finalScore}, Status = ${status}`);

      return {
        runId,
        submissionId: ctx.submission.id,
        status,
        scorecard,
        evaluatedAt: new Date().toISOString()
      };

    } catch (err) {
      console.error('[Orchestrator] Fatal error during pipeline execution:', err);
      throw err;
    }
  }
}
