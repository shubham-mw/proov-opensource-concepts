import { EvaluationContext } from './schemas/agent-evaluation.schema';
import { EvaluationProcessor } from './orchestrator/evaluation.processor';

async function runDemo() {
  const processor = new EvaluationProcessor();

  // 1. Create a mock student data science challenge submission context
  const mockContext: EvaluationContext = {
    submission: {
      id: 'sub_student_4091',
      files: [
        {
          name: 'climate_analysis.ipynb',
          type: 'NOTEBOOK',
          content: 'import pandas as pd\ndf = pd.read_csv("climate_data.csv")\ndf["Rolling_10"] = df["Anomaly"].rolling(10).mean()\nprint("Rolling data computed successfully!")'
        }
      ]
    },
    project: {
      title: 'Climate Trend Forecasting Challenge',
      instructions: 'Load the annual anomalies dataset, compute 10-year rolling smooth curves, and chart predictions.',
      evaluationCriteria: [
        { criterion: 'Exploratory Data Analysis', weight: 0.3, description: 'Proper data loading, parsing columns, and basic anomalies descriptions.' },
        { criterion: 'Rolling Average Calculation', weight: 0.4, description: 'Correct application of rolling windows to smooth out climate noise.' },
        { criterion: 'Matplotlib Visualizations', weight: 0.3, description: 'Visually appealing charts mapping anomalies and rolling smooth lines.' }
      ]
    }
  };

  console.log('================================================================');
  console.log('DEMO RUN 1: Successful Student Submission (High Quality)');
  console.log('================================================================');
  
  const result1 = await processor.process(mockContext, { forceFailGrading: false });
  console.log('\n👉 Final Result Status:', result1.status);
  console.log('👉 Final Score:', result1.scorecard.finalScore);
  console.log('👉 Pass:', result1.scorecard.pass);
  console.log('👉 Needs Human Review?', result1.scorecard.needsHumanReview);
  console.log('👉 Summary reasoning:', result1.scorecard.agentSummaries[0]?.reasoning);

  console.log('\n================================================================');
  console.log('DEMO RUN 2: Poor Quality Student Submission (Fails Rubric & Triggers Warning)');
  console.log('================================================================');
  
  const result2 = await processor.process(mockContext, { forceFailGrading: true });
  console.log('\n👉 Final Result Status:', result2.status);
  console.log('👉 Final Score:', result2.scorecard.finalScore);
  console.log('👉 Pass:', result2.scorecard.pass);
  console.log('👉 Needs Human Review?', result2.scorecard.needsHumanReview);
  console.log('👉 Review Reason:', result2.scorecard.humanReviewReason);
}

runDemo().catch(console.error);
