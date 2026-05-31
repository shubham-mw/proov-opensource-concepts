import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Star {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  slow: boolean;
}

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const isSlow = i > count * 0.7;
    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: isSlow ? 1 + Math.random() * 1.5 : 1 + Math.random() * 2.5,
      duration: isSlow ? 4 + Math.random() * 3 : 2 + Math.random() * 2.5,
      delay: Math.random() * 2.5,
      opacity: 0.4 + Math.random() * 0.6,
      slow: isSlow,
    });
  }
  return stars;
}

function TypeInText({
  text,
  startDelay,
  charDelay = 0.08,
  className,
  style,
}: {
  text: string;
  startDelay: number;
  charDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={className} style={style}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{
            duration: 0.15,
            delay: startDelay + i * charDelay,
            ease: 'easeOut',
          }}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'stars' | 'brand' | 'launch' | 'done'>('stars');
  const stars = useMemo(() => generateStars(85), []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('brand'), 1800),
      setTimeout(() => setPhase('launch'), 5200),
      setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 7500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === 'done') return null;

  const isLaunching = phase === 'launch';

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="cinematic-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            overflow: 'hidden',
            background: '#030308',
          }}
        >
          {/* Starfield */}
          <motion.div
            animate={{
              opacity: isLaunching ? 0 : 1,
              scale: isLaunching ? 1.5 : 1,
            }}
            transition={{ duration: 1.5, ease: 'easeIn' }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {stars.map((star, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: star.size,
                  height: star.size,
                  opacity: star.opacity,
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                }}
              />
            ))}
          </motion.div>

          {/* Glow Pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: isLaunching ? 0.8 : phase === 'brand' ? 0.35 : 0.15,
              scale: isLaunching ? 2.5 : phase === 'brand' ? 1.1 : 0.8,
            }}
            transition={{ duration: isLaunching ? 1.2 : 2, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 500,
              height: 500,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(99, 102, 241, 0.15) 40%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />

          {/* Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'stars' ? 0.03 : 0.015 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              pointerEvents: 'none',
            }}
          />

          {/* Brand Reveal */}
          <motion.div
            animate={{
              scale: isLaunching ? 1.6 : 1,
              filter: isLaunching ? 'blur(20px)' : 'blur(0px)',
              opacity: isLaunching ? 0 : 1,
            }}
            transition={{
              duration: isLaunching ? 1.8 : 0.5,
              ease: isLaunching ? [0.45, 0, 0.55, 1] : [0.22, 1, 0.36, 1],
            }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AnimatePresence>
                {(phase === 'brand' || phase === 'launch') && (
                  <TypeInText
                    text="Introducing"
                    startDelay={0.1}
                    charDelay={0.06}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '0.4em',
                      textTransform: 'uppercase',
                      color: 'rgba(196, 181, 253, 0.7)',
                      marginBottom: 16,
                      display: 'block',
                    }}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {(phase === 'brand' || phase === 'launch') && (
                  <motion.h1
                    initial={{ opacity: 0, scale: 0.8, filter: 'blur(12px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 1, delay: 0.6 }}
                    style={{
                      margin: 0,
                      fontSize: 'clamp(42px, 8vw, 84px)',
                      fontWeight: 900,
                      letterSpacing: '-0.04em',
                      color: '#ffffff',
                      textShadow: '0 0 40px rgba(139, 92, 246, 0.3)',
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    SlideVibe
                  </motion.h1>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {(phase === 'brand' || phase === 'launch') && (
                  <motion.span
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.4 }}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '13px',
                      fontWeight: 400,
                      letterSpacing: '0.45em',
                      textTransform: 'uppercase',
                      color: 'rgba(156, 163, 175, 0.6)',
                      marginTop: 8,
                    }}
                  >
                    Interactive Slide Engine
                  </motion.span>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {(phase === 'brand' || phase === 'launch') && (
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 2.0 }}
                    style={{
                      width: '80px',
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)',
                      marginTop: 20,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Exposure Flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLaunching ? 1 : 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: 'easeIn' }}
            style={{
              position: 'absolute',
              inset: 0,
              background: '#ffffff',
              pointerEvents: 'none',
              zIndex: 50,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
