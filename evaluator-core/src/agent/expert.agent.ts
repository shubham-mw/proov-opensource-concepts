import {
  AgentEvaluationOutput,
  AgentEvaluationOutputSchema,
  EvaluationContext
} from '../schemas/agent-evaluation.schema';

/**
 * BaseAgent — Handles structured system prompt construction,
 * markdown fence cleaning, and strict Zod validation parsing.
 */
export abstract class BaseAgent {
  protected cleanResponse(raw: string): string {
    let clean = raw.trim();
    // Strip markdown triple-backtick json fences if returned by the LLM
    if (clean.startsWith('```json')) {
      clean = clean.slice(7);
    } else if (clean.startsWith('```')) {
      clean = clean.slice(3);
    }
    if (clean.endsWith('```')) {
      clean = clean.slice(0, -3);
    }
    return clean.trim();
  }

  protected validate(rawJson: string): AgentEvaluationOutput {
    const clean = this.cleanResponse(rawJson);
    const parsed = JSON.parse(clean);
    return AgentEvaluationOutputSchema.parse(parsed);
  }
}

/**
 * ProjectExpertAgent — Assembles standard system prompts, injects submission
 * criteria, and converts raw LLM responses into structured, type-safe scorecard objects.
 */
export class ProjectExpertAgent extends BaseAgent {
  private readonly VERSION = '1.0.0';

  buildSystemPrompt(ctx: EvaluationContext): string {
    const criteriaStr = ctx.project.evaluationCriteria
      .map((c) => `- ${c.criterion} (weight: ${c.weight}): ${c.description}`)
      .join('\n');

    return `You are an Expert AI Grading Agent evaluating a student's project submission.
Your grading must be structured, deterministic, and highly evidence-based.

[PROJECT CONTEXT]
Title: ${ctx.project.title}
Instructions: ${ctx.project.instructions}

[EVALUATION CRITERIA]
${criteriaStr}

[INSTRUCTIONS]
Evaluate the student's submission files. You MUST respond with a single JSON object conforming EXACTLY to the following TypeScript contract. Do not include markdown code block blocks in your core text.

{
  "agentType": "EXPERT",
  "version": "${this.VERSION}",
  "score": number (0-100),
  "confidence": number (0.0-1.0),
  "pass": boolean,
  "flags": string[] (e.g., "POTENTIAL_PLAGIARISM", "AI_GENERATED_CODE" if applicable),
  "reasoning": "High-level summary of evaluation (10-1000 characters)",
  "thinkingSkills": string[] (max 5 core skills demonstrated),
  "plusPoints": string[] (max 5 outstanding elements),
  "areasForImprovement": string[] (max 5 specific suggestions),
  "detailedBreakdown": [
    {
      "criterion": "Name of criterion",
      "score": number (0-100),
      "evidence": "Concrete observations and lines of code supporting this score (10-2000 characters)"
    }
  ]
}`;
  }

  // Standalone simulation helper (replaces production Azure OpenAI Service API call)
  async evaluateMock(ctx: EvaluationContext, forcePass: boolean = true): Promise<AgentEvaluationOutput> {
    const score = forcePass ? 82 : 45;
    const confidence = 0.95;
    const isPass = score >= 55;

    const mockResponse = JSON.stringify({
      agentType: 'EXPERT',
      version: this.VERSION,
      score,
      confidence,
      pass: isPass,
      flags: forcePass ? [] : ['INTEGRITY_ALERT_AI_GENERATED'],
      reasoning: forcePass 
        ? "Outstanding data analysis notebook showing complete exploratory analysis, rolling trends computations, and baseline models projection."
        : "The notebook lacks proper rolling averages calculations and projects a static trend without accounting for data seasonality.",
      thinkingSkills: ['Time-Series Analysis', 'Data Cleaning', 'Visualization'],
      plusPoints: ['Proper rolling 10-year trend calculation', 'Excellent matplotlib visualization design'],
      areasForImprovement: ['Introduce a linear model to capture rate acceleration'],
      detailedBreakdown: ctx.project.evaluationCriteria.map((c) => ({
        criterion: c.criterion,
        score: forcePass ? Math.round(score * (0.9 + Math.random() * 0.2)) : Math.round(score * (0.8 + Math.random() * 0.3)),
        evidence: `Verified code imports pandas and evaluates criteria: "${c.description}". Found sufficient implementations of rolling arrays.`
      }))
    });

    return this.validate(mockResponse);
  }
}
