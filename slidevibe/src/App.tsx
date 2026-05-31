import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CinematicIntro } from './components/CinematicIntro';
import { getProjectConfig } from './projects';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Menu,
  X,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { PyodideProvider } from './lib/PyodideProvider';
import { AiCoachPanel } from './components/AiCoachPanel';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="flex w-[100vw] h-[100vh] items-center justify-center bg-[#030308]">
        <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PyodideProvider>
      <ExperienceLauncher />
    </PyodideProvider>
  );
}

function ExperienceLauncher() {
  const [showIntro, setShowIntro] = useState(true);
  const [shellReady, setShellReady] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    setTimeout(() => setShellReady(true), 50);
  }, []);

  return (
    <div className="h-[100vh] w-[100vw] relative bg-[#030308] text-white overflow-hidden">
      {/* Immersive Slide View */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="h-full w-full"
      >
        {!showIntro && <ExperienceView />}
      </motion.div>

      {/* Cinematic intro */}
      {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}

      {/* White bridge flash */}
      <AnimatePresence>
        {!showIntro && !shellReady && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 bg-white z-[9998] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ExperienceView() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    getProjectConfig('climate-challenge').then(setProject);
  }, []);

  if (!project) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const slides = project.slides;
  const CurrentSlide = slides[slideIndex];
  const progressPercent = Math.round((slideIndex / (slides.length - 1)) * 100);

  return (
    <div className="flex flex-col h-full w-full bg-[#0B0F1A]">
      {/* Header */}
      <header className="flex-none h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-950/70 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-black text-sm text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            C
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-widest text-violet-400 uppercase">Climate Challenge</h2>
            <h1 className="text-sm font-black text-slate-100 leading-none">Map Global Warming Trends</h1>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="hidden md:flex items-center gap-4">
          <div className="w-48 bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-violet-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-400">Step {slideIndex + 1} of {slides.length}</span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Left Side: AI Coach Panel */}
        <AiCoachPanel
          title={slideIndex === 0 ? "Welcome & Setup" : slideIndex === 1 ? "Exploratory Analysis" : "Baseline Forecast"}
          section={slideIndex === 0 ? "Setup" : slideIndex === 1 ? "Analysis" : "Forecasting"}
          blurb={slideIndex === 0 ? "Run the setup code on the right to build your local Python climate model dataset." : "Generate dynamic temperature anomalies plots in your browser using Matplotlib."}
          themeColor="#8b5cf6"
          slideIndex={slideIndex}
        />

        {/* Right Side: Interactive Content & Notebook */}
        <div className="flex-1 relative overflow-hidden min-h-0">
          <CurrentSlide />
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="flex-none h-16 border-t border-white/5 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between z-20">
        <button
          onClick={() => setSlideIndex(prev => Math.max(0, prev - 1))}
          disabled={slideIndex === 0}
          className="flex items-center gap-2 h-10 px-4 rounded-full border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-xs uppercase tracking-wider"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <button
          onClick={() => setSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
          disabled={slideIndex === slides.length - 1}
          className="flex items-center gap-2 h-10 px-5 rounded-full bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(139,92,246,0.3)]"
        >
          Next <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
}
