import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  visible: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F6F0E5]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Logo mark — larger for splash */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5"
          >
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-3xl bg-[#3D6048] flex items-center justify-center shadow-lg shadow-[#3D6048]/20"
              aria-hidden="true"
            >
              <svg viewBox="0 0 32 32" fill="none" className="w-11 h-11">
                <path
                  d="M25.5 6.5C17.5 6.5 11.2 10.7 8.4 17.8C7.5 20.1 7.2 22.8 7.5 25.5C10.2 25.8 12.9 25.3 15.2 24.3C22.2 21.3 25.5 14.8 25.5 6.5Z"
                  fill="#E8C879"
                  fillOpacity="0.95"
                />
                <path
                  d="M7.5 25.5C11.8 20.8 16.5 16.3 22 11.5"
                  stroke="#3D6048"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
                <path
                  d="M12.5 20.5C13.5 17.8 14.8 15.8 16.8 14.5"
                  stroke="#3D6048"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Wordmark */}
            <div className="flex flex-col items-center gap-1.5">
              <span
                className="text-4xl font-bold tracking-tight text-[#343A32]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ventura
              </span>
              <span
                className="text-sm text-[#343A32]/55 font-medium tracking-wide"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Cleaner air starts with you
              </span>
            </div>
          </motion.div>

          {/* Subtle loading dot */}
          <motion.div
            className="absolute bottom-16 flex gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#3D6048]/30"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
