import { climateChallengeSlides } from './climate-challenge';

export const projectKeys = ['climate-challenge'];

export const getProjectConfig = async (key: string) => {
  if (key === 'climate-challenge') {
    const manifest = await import('./climate-challenge/manifest.json');
    return {
      slides: climateChallengeSlides,
      sidebarSteps: [
        {
          title: "Warmup Setup",
          substeps: [{ label: "Welcome & Setup", slideIndex: 0 }]
        },
        {
          title: "Data Analysis",
          substeps: [{ label: "Exploratory Analysis", slideIndex: 1 }]
        },
        {
          title: "Trend Forecasting",
          substeps: [{ label: "Baseline Forecast", slideIndex: 2 }]
        }
      ],
      getActiveStep: (index: number) => {
        if (index === 0) return 0;
        if (index === 1) return 1;
        return 2;
      }
    };
  }
  return null;
};
