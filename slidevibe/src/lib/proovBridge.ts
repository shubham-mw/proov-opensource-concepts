// Mock ProovBridge for self-contained, browser-only interactive execution.
// Removes server dependencies while preserving identical TypeScript signatures.

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ProovSessionContext = {
  externalKey: string;
  lastSlideIndex: number;
};

export const ProovBridge = {
  isActive: () => true,

  init: async (): Promise<ProovSessionContext> => {
    return {
      externalKey: 'climate-challenge',
      lastSlideIndex: 0
    };
  },

  complete: async (data: any): Promise<string> => {
    console.log('[Mock ProovBridge] Simulation completed:', data);
    return 'mock-submission-12345';
  },

  syncProgress: async (slideIndex: number, totalSlides: number, stepKey?: string) => {
    console.log(`[Mock ProovBridge] Progress updated: Slide ${slideIndex}/${totalSlides - 1} (${stepKey || 'none'})`);
    localStorage.setItem('slidevibe_progress', String(slideIndex));
  },

  recordResponse: async (key: string, type: string, payload: any) => {
    console.log(`[Mock ProovBridge] Student Response Recorded: [${type}] key="${key}"`, payload);
    localStorage.setItem(`response_${key}`, JSON.stringify(payload));
  },

  aiChat: async (messages: ChatMessage[]): Promise<string> => {
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const lastUserMessageLower = lastUserMessage.toLowerCase();
    
    // Simple simulated smart context coaching
    if (lastUserMessageLower.includes('hint') || lastUserMessageLower.includes('stuck')) {
      return "💡 **Here is a hint to get you going:**\n\nTry loading the dataset first using `import pandas as pd` and `df = pd.read_csv('climate_data.csv')`. Let me know if you want me to explain what column headings like `Anomaly` mean!";
    }
    
    if (lastUserMessageLower.includes('explain') || lastUserMessageLower.includes('simply')) {
      return "🌍 **Let's break it down simply:**\n\nGlobal warming is measured by **temperature anomalies**. An anomaly is the *difference* between the actual observed temperature and a long-term historical baseline average. A positive anomaly means the year was warmer than the baseline!";
    }
    
    if (lastUserMessageLower.includes('example')) {
      return "📊 **Real-World Example:**\n\nClimate scientists resample high-frequency daily sensor datasets into monthly or annual averages. This eliminates short-term noise (like a single cold week) to make the overall long-term trend clear. We're doing exactly that on Slide 4!";
    }
    
    return "🤖 **Hello! I am your SlideVibe AI Coach.**\n\nI can help you analyze the climate dataset. Ask me to:\n* *'Explain anomalies simply'*\n* *'Give a hint — I am stuck'*\n* *'Give a real-world example of resampling'*";
  }
};
