import { z } from 'zod';

export const AgentTypeEnum = z.enum(['EXPERT']);
export type AgentType = z.infer<typeof AgentTypeEnum>;

export const DetailedBreakdownSchema = z.object({
  criterion: z.string().min(1).max(200),
  score: z.number().int().min(0).max(100),
  evidence: z.string().min(1).max(2000),
});
export type DetailedBreakdown = z.infer<typeof DetailedBreakdownSchema>;

export const AgentEvaluationOutputSchema = z.object({
  agentType: AgentTypeEnum,
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  score: z.number().int().min(0).max(100),
  confidence: z.number().min(0).max(1),
  pass: z.boolean(),
  flags: z.array(z.string()).max(20),
  reasoning: z.string().min(10).max(1000),
  thinkingSkills: z.array(z.string()).max(5),
  plusPoints: z.array(z.string()).max(5),
  areasForImprovement: z.array(z.string()).max(5),
  detailedBreakdown: z.array(DetailedBreakdownSchema).min(1).max(20),
});
export type AgentEvaluationOutput = z.infer<typeof AgentEvaluationOutputSchema>;

export const PassThresholdsSchema = z.object({
  overall: z.number().int().min(0).max(100).default(55),
  technical: z.number().int().min(0).max(100).default(50),
  business: z.number().int().min(0).max(100).default(50),
});
export type PassThresholds = z.infer<typeof PassThresholdsSchema>;

export const DEFAULT_THRESHOLDS: PassThresholds = {
  overall: 55,
  technical: 50,
  business: 50,
};

export interface EvaluationContext {
  submission: {
    id: string;
    files: Array<{ name: string; type: string; content: string }>;
  };
  project: {
    title: string;
    instructions: string;
    evaluationCriteria: Array<{ criterion: string; weight: number; description: string }>;
  };
}
