import React from 'react';
import { ContentLayout } from '../../components/SlideLayout';
import { CodeCell } from '../../components/CodeCell';

const setupCode = `# Let's import the data analysis libraries and generate the sample dataset!
import pandas as pd
import numpy as np

# Let's generate a beautiful synthetic 140-year climate anomaly dataset
years = np.arange(1880, 2026)
# Base global warming trend with positive acceleration in the last 40 years
baseline = (years - 1880) * 0.004 + ((years - 1980) > 0) * (years - 1980) * 0.016
# Add random temperature fluctuation noise
noise = np.random.normal(0, 0.12, len(years))
anomalies = np.round(baseline + noise, 3)

df = pd.DataFrame({
    'Year': years,
    'Anomaly': anomalies
})
df.to_csv('climate_data.csv', index=False)
print("✅ Climate dataset generated and loaded as 'climate_data.csv' in local memory!")
print(df.tail())
`;

export const climateChallengeSlides = [
  // Slide 1: Welcome & Setup
  () => (
    <ContentLayout
      isActive={true}
      topStripClass="bg-violet-500"
      rightPanelBg="bg-slate-950"
      rightPanel={
        <div className="flex flex-col gap-4 w-full h-full min-h-0 text-slate-200">
          <h4 className="text-sm font-bold tracking-widest text-violet-400 uppercase">Interactive Setup</h4>
          <p className="text-xs text-slate-400">Run the setup cell below to dynamically generate a 140-year climate dataset inside your local in-browser virtual file system.</p>
          <div className="flex-1 min-h-0">
            <CodeCell
              slideKey="setup_cell"
              initialCode={setupCode}
              readOnly={false}
              autoRun={true}
              language="python"
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <span className="text-xs font-black tracking-widest text-violet-500 uppercase">Phase 1 / Warmup</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
          Welcome to the Climate Data Challenge
        </h1>
        <p className="text-slate-300 leading-relaxed text-sm md:text-base">
          In this interactive lesson, you are acting as the **Lead Climate Research Scientist** analyzing global temperature trends.
        </p>
        <p className="text-slate-300 leading-relaxed text-sm md:text-base">
          The goal is to analyze **temperature anomalies**—the deviation of the global annual average temperature compared to a historical baseline.
        </p>
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 mt-2">
          <h5 className="font-bold text-violet-400 text-sm mb-1">💡 Browser-Native Compilation</h5>
          <p className="text-xs text-slate-400 leading-relaxed">
            The workspace on the right runs **Pyodide** (CPython compiled to WebAssembly) directly in a background worker thread. When you hit **Run cell**, Python runs locally on your computer—no backend required!
          </p>
        </div>
      </div>
    </ContentLayout>
  ),

  // Slide 2: EDA
  () => (
    <ContentLayout
      isActive={true}
      topStripClass="bg-violet-500"
      rightPanelBg="bg-slate-950"
      rightPanel={
        <div className="flex flex-col gap-4 w-full h-full min-h-0 text-slate-200">
          <h4 className="text-sm font-bold tracking-widest text-violet-400 uppercase">Matplotlib Charting</h4>
          <p className="text-xs text-slate-400">Run the cell to plot the global temp anomalies and notice how graphs compile natively inside the browser window!</p>
          <div className="flex-1 min-h-0">
            <CodeCell
              slideKey="climate_eda"
              initialCode={`import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('climate_data.csv')

# Plot the temperature anomalies
plt.figure(figsize=(10, 4.5))
plt.plot(df['Year'], df['Anomaly'], label='Annual Anomaly', color='#8b5cf6', linewidth=2)
plt.axhline(0, color='white', linestyle='--', alpha=0.3)
plt.title('Global Temperature Anomalies (1880-2025)', color='white')
plt.xlabel('Year', color='white')
plt.ylabel('Deviation (°C)', color='white')
plt.grid(True, alpha=0.15)
plt.legend()
plt.show()`
              }
              language="python"
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <span className="text-xs font-black tracking-widest text-violet-500 uppercase">Phase 2 / Exploratory Analysis</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
          Visualizing long-term anomalies
        </h1>
        <p className="text-slate-300 leading-relaxed text-sm md:text-base">
          Let's load the data we just generated using **pandas** and plot it using **matplotlib** to see the overall trend shape.
        </p>
        <p className="text-slate-300 leading-relaxed text-sm md:text-base">
          Observe how the temperature anomalies fluctuate below zero prior to 1940, and rise rapidly over the past few decades.
        </p>
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 mt-2">
          <h5 className="font-bold text-violet-400 text-sm mb-1">📝 Scientific Question</h5>
          <p className="text-xs text-slate-400 leading-relaxed">
            Take a close look at the plotted anomaly curve. In which decade does the deviation permanently lock above +0.5°C?
          </p>
        </div>
      </div>
    </ContentLayout>
  ),

  // Slide 3: Forecasting
  () => (
    <ContentLayout
      isActive={true}
      topStripClass="bg-violet-500"
      rightPanelBg="bg-slate-950"
      rightPanel={
        <div className="flex flex-col gap-4 w-full h-full min-h-0 text-slate-200">
          <h4 className="text-sm font-bold tracking-widest text-violet-400 uppercase">Rolling Averages & Forecast</h4>
          <p className="text-xs text-slate-400">Implement rolling trends to smooth out seasonal climate fluctuations.</p>
          <div className="flex-1 min-h-0">
            <CodeCell
              slideKey="climate_forecast"
              initialCode={`import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('climate_data.csv')

# Calculate rolling 10-year moving average
df['Rolling_10'] = df['Anomaly'].rolling(window=10).mean()

# Forecast the next 10 years by projecting the rolling trend
last_avg = df['Rolling_10'].iloc[-1]
future_years = range(2026, 2036)
future_forecast = [last_avg] * 10

# Plot original data + rolling smoothing + future projection
plt.figure(figsize=(10, 4.5))
plt.scatter(df['Year'], df['Anomaly'], color='white', alpha=0.2, s=15, label='Annual Data')
plt.plot(df['Year'], df['Rolling_10'], color='#f59e0b', linewidth=2.5, label='10-Year Rolling Average')
plt.plot(future_years, future_forecast, color='#ec4899', linestyle='--', linewidth=2.5, label='Projected Temp')
plt.title('Climate Trends and Projected Baseline (1880-2035)', color='white')
plt.legend()
plt.show()`
              }
              language="python"
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <span className="text-xs font-black tracking-widest text-violet-500 uppercase">Phase 3 / Forecasting</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
          Smooth trends & projecting models
        </h1>
        <p className="text-slate-300 leading-relaxed text-sm md:text-base">
          Climate observations carry a large amount of random seasonal variance. In data science, we smooth this noise out using a **Rolling Moving Average**.
        </p>
        <p className="text-slate-300 leading-relaxed text-sm md:text-base">
          On the right, we've implemented a **10-year rolling window** and created a pink projected baseline that forecasts temp levels for the next decade.
        </p>
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
          <h5 className="font-bold text-violet-400 text-sm mb-1">🏁 Final Task</h5>
          <p className="text-xs text-slate-400 leading-relaxed">
            By keeping the projected temperatures high, does this baseline capture the acceleration of the warming cycle, or does it lag behind? Think about how we could build a linear model to capture the accelerating rate of change.
          </p>
        </div>
      </div>
    </ContentLayout>
  )
];
