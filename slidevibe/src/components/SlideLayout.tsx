import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { ChevronUp, X } from 'lucide-react';

export const ContentLayout = ({ 
  children, 
  isActive, 
  rightPanel, 
  rightPanelBg = 'bg-[#0B0F1A]', 
  topStripClass, 
  fullBleedRightPanel = false,
  singleColumn = false
}: { 
  children: React.ReactNode, 
  isActive: boolean, 
  rightPanel?: React.ReactNode, 
  rightPanelBg?: string, 
  topStripClass?: string, 
  fullBleedRightPanel?: boolean,
  singleColumn?: boolean
}) => {
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);

  const isDarkBg = (rightPanelBg.startsWith('bg-[#') || rightPanelBg.includes('slate') || rightPanelBg.includes('black') || rightPanelBg.includes('dark')) && !rightPanelBg.includes('gradient');
  const mobileRightPanelStyle = isDarkBg 
    ? {
        background: 'radial-gradient(circle at 15% 15%, rgba(240, 243, 250, 0.09) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(200, 205, 215, 0.03) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.01) 0%, transparent 80%), #0a0f1d',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderLeft: 'none'
      }
    : undefined;

  const desktopRightPanelStyle = isDarkBg 
    ? {
        background: 'radial-gradient(circle at 15% 15%, rgba(240, 243, 250, 0.09) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(200, 205, 215, 0.03) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.01) 0%, transparent 80%), #0a0f1d',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
      }
    : undefined;

  return (
    <div className={`w-full h-full flex flex-col ${singleColumn ? 'overflow-y-auto' : 'lg:flex-row overflow-hidden'} relative bg-[#0B0F1A] text-sm md:text-base`}>
      {topStripClass && <div className={`absolute top-0 left-0 right-0 h-1.5 md:h-2 ${topStripClass} z-50`} />}
      
      {/* Main content (full screen on mobile, left side on desktop) */}
      <motion.div 
        className={`flex-1 w-full ${singleColumn ? 'px-4 sm:px-6 py-6' : 'lg:w-auto px-4 sm:px-8 lg:px-20 xl:px-24 py-6 lg:py-12'} flex flex-col text-left bg-[#0B0F1A] overflow-y-auto hide-scrollbar`}
        initial={{ opacity: 0, x: -10 }}
        animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ paddingBottom: '24px' }}
      >
        <div className={`my-auto ${singleColumn ? 'w-full pb-32' : 'lg:max-w-2xl lg:max-w-3xl 2xl:max-w-4xl w-full mr-auto pb-36 lg:pb-24 prose prose-sm md:prose-base prose-h1:text-white prose-h2:text-white prose-h3:text-white text-slate-200 md:prose-h1:text-4xl prose-h2:text-xl md:prose-h2:text-3xl max-w-none text-slate-100'}`}>
          {children}
          
          {singleColumn && rightPanel && (
            <div 
              className={`mt-6 p-4 rounded-xl border border-white/10 ${rightPanelBg} w-full`}
              style={isDarkBg ? {
                background: 'radial-gradient(circle at 15% 15%, rgba(240, 243, 250, 0.09) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(200, 205, 215, 0.03) 0%, transparent 60%), #0a0f1d',
                borderColor: 'rgba(255, 255, 255, 0.08)'
              } : undefined}
            >
              {rightPanel}
            </div>
          )}
        </div>
      </motion.div>

      {/* Interactive Panel (Mobile Only) */}
      {!singleColumn && rightPanel && (
        <>
          {/* Persistent full-width bottom trigger bar */}
          <AnimatePresence>
            {!isFooterExpanded && (
              <motion.div 
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F1A] border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3"
                style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
              >
                <button 
                  onClick={() => setIsFooterExpanded(true)}
                  className="w-full flex items-center justify-center gap-2 h-12 bg-violet-600 hover:bg-violet-500 shadow-md text-white border border-surface-ink rounded-xl font-bold text-[15px] hover:bg-black active:scale-[0.98] transition-all"
                >
                  <ChevronUp className="w-5 h-5"/> Open Interactive Tasks
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded Modal */}
          <AnimatePresence>
            {isFooterExpanded && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsFooterExpanded(false)}
                  className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm" 
                />
                <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 h-[85dvh] ${rightPanelBg} rounded-t-3xl border-t border-white/10 flex flex-col overflow-hidden shadow-2xl`}
                  style={mobileRightPanelStyle}
                >
                  <button 
                    onClick={() => setIsFooterExpanded(false)}
                    className="absolute top-4 right-4 w-8 h-8 z-50 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-slate-100 backdrop-blur-md"
                  >
                    <X className="w-5 h-5"/>
                  </button>
                  <div className="flex-none flex items-center justify-center pt-3 pb-2 w-full">
                    <div className="w-12 h-1.5 bg-black/20 rounded-full" />
                  </div>
                  <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar relative bg-inherit">
                    {fullBleedRightPanel ? (
                      <div className="w-full min-h-full relative pb-32">
                        {rightPanel}
                      </div>
                    ) : (
                      <div className="w-full min-h-full p-4 md:p-6 mx-auto flex flex-col pb-32">
                        {rightPanel}
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Right side interactive panel on Desktop */}
      {!singleColumn && rightPanel && (
        <motion.div 
          className={`hidden lg:flex flex-none flex-col w-[450px] xl:w-[500px] border-l border-white/10 h-full hide-scrollbar relative ${rightPanelBg} ${fullBleedRightPanel ? 'p-0' : 'p-8'}`}
          style={desktopRightPanelStyle}
          initial={{ opacity: 0, x: 10 }}
          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          {fullBleedRightPanel ? (
            <div className="w-full h-full relative">
              {rightPanel}
            </div>
          ) : (
            <div className="my-auto w-full max-w-lg pb-24 mx-auto flex flex-col items-center h-full">
              {rightPanel}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const AppLayout = ({ children, isActive, rightPanel, rightPanelBg = 'bg-[#0e1424]', topStripClass }: { children: React.ReactNode, isActive: boolean, rightPanel: React.ReactNode, rightPanelBg?: string, topStripClass?: string }) => {
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);

  const isDarkBg = (rightPanelBg.startsWith('bg-[#') || rightPanelBg.includes('slate') || rightPanelBg.includes('black') || rightPanelBg.includes('dark')) && !rightPanelBg.includes('gradient');
  const mobileRightPanelStyle = isDarkBg 
    ? {
        background: 'radial-gradient(circle at 15% 15%, rgba(240, 243, 250, 0.09) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(200, 205, 215, 0.03) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.01) 0%, transparent 80%), #0a0f1d',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderLeft: 'none'
      }
    : undefined;

  const desktopRightPanelStyle = isDarkBg 
    ? {
        background: 'radial-gradient(circle at 15% 15%, rgba(240, 243, 250, 0.09) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(200, 205, 215, 0.03) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.01) 0%, transparent 80%), #0a0f1d',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
      }
    : undefined;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-[#0B0F1A] relative overflow-hidden text-sm md:text-base">
      {topStripClass && <div className={`absolute top-0 left-0 right-0 h-1.5 md:h-2 ${topStripClass} z-50`} />}
      
      {/* Main content (full screen on mobile, left on desktop) */}
      <motion.div 
        className="flex-1 w-full lg:w-auto lg:flex-none border-r border-white/10 shrink-0 px-4 sm:px-8 lg:px-12 py-6 lg:py-8 flex flex-col overflow-y-auto hide-scrollbar"
        initial={{ opacity: 0, x: -10 }}
        animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ paddingBottom: '24px' }}
      >
        <div className="my-auto pb-36 lg:pb-24 lg:max-w-2xl mx-auto w-full prose prose-sm md:prose-base prose-h1:text-white prose-h2:text-white prose-h3:text-white text-slate-200 md:prose-h1:text-4xl prose-h2:text-xl md:prose-h2:text-3xl max-w-none text-slate-100">
          {children}
        </div>
      </motion.div>

      {/* Interactive Panel (Mobile Only) */}
      {rightPanel && (
        <>
          {/* Persistent full-width bottom trigger bar */}
          <AnimatePresence>
            {!isFooterExpanded && (
              <motion.div 
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F1A] border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3"
                style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
              >
                <button 
                  onClick={() => setIsFooterExpanded(true)}
                  className="w-full flex items-center justify-center gap-2 h-12 bg-violet-600 hover:bg-violet-500 shadow-md text-white border border-surface-ink rounded-xl font-bold text-[15px] hover:bg-black active:scale-[0.98] transition-all"
                >
                  <ChevronUp className="w-5 h-5"/> Open Interactive Tasks
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded Modal */}
          <AnimatePresence>
            {isFooterExpanded && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsFooterExpanded(false)}
                  className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm" 
                />
                <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 h-[85dvh] ${rightPanelBg} rounded-t-3xl border-t border-white/10 flex flex-col overflow-hidden shadow-2xl`}
                  style={mobileRightPanelStyle}
                >
                  <button 
                    onClick={() => setIsFooterExpanded(false)}
                    className="absolute top-4 right-4 w-8 h-8 z-50 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-slate-100 backdrop-blur-md"
                  >
                    <X className="w-5 h-5"/>
                  </button>
                  <div className="flex-none flex items-center justify-center pt-3 pb-2 w-full">
                    <div className="w-12 h-1.5 bg-black/20 rounded-full" />
                  </div>
                  <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar relative bg-inherit isolate pb-safe">
                    {rightPanel}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Right side interactive panel on desktop (right side) */}
      <motion.div 
        className={`hidden lg:flex flex-1 ${rightPanelBg} flex-col relative overflow-hidden p-4 sm:p-6 w-[450px] xl:w-[500px]`}
        style={desktopRightPanelStyle}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        {rightPanel}
      </motion.div>
    </div>
  );
};

export const FullLayout = ({ children, isActive, maxW = "lg:max-w-5xl", topStripClass, className = "", noPadding = false }: { children: React.ReactNode, isActive: boolean, maxW?: string, topStripClass?: string, className?: string, noPadding?: boolean }) => {
  const padding = noPadding ? '' : 'px-4 md:px-6 lg:px-8 py-4 lg:py-8';
  const innerPadding = noPadding ? '' : 'pb-36 lg:pb-24';
  return (
    <div className={`w-full h-full flex flex-col ${padding} bg-[#0B0F1A] overflow-y-auto hide-scrollbar relative text-[14px] md:text-base ${className}`}>
      {topStripClass && <div className={`absolute top-0 left-0 right-0 h-1.5 md:h-2 ${topStripClass} z-50`} />}
      <motion.div
        className={`w-full my-auto mx-auto ${innerPadding} ${maxW} flex-1 flex flex-col prose prose-sm md:prose-base prose-h1:text-white prose-h2:text-white prose-h3:text-white text-slate-200 md:prose-h1:text-4xl prose-h2:text-xl md:prose-h2:text-3xl max-w-none text-slate-100`}
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={isActive ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: -10 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
};
