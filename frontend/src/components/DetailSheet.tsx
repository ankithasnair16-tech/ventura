import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface DetailSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const DetailSheet: React.FC<DetailSheetProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}) => {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Dimmed backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#343A32]/45 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Slide-up sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className="relative z-10 w-full max-w-xl max-h-[86dvh] bg-[#FBF8F1] rounded-t-3xl sm:rounded-3xl shadow-xl border border-[#343A32]/10 flex flex-col overflow-hidden"
          >
            {/* Drag handle + header */}
            <div className="pt-2.5 pb-3 px-5 border-b border-[#343A32]/8 shrink-0">
              <div
                className="w-10 h-1.5 rounded-full bg-[#343A32]/18 mx-auto mb-3 sm:hidden"
                aria-hidden="true"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {subtitle && (
                    <p className="text-xs font-bold text-[#3D6048] mb-0.5">
                      {subtitle}
                    </p>
                  )}
                  <h2 className="text-xl font-extrabold text-[#343A32] leading-snug">
                    {title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close detail sheet"
                  className="min-h-[44px] min-w-[44px] -mt-1 -mr-2 rounded-2xl flex items-center justify-center text-[#343A32]/65 hover:text-[#343A32] hover:bg-[#343A32]/6 active:scale-95 transition-all shrink-0"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
              {children}
            </div>

            {/* Sticky bottom CTA zone */}
            {footer && (
              <div className="px-5 py-3.5 bg-[#FBF8F1] border-t border-[#343A32]/10 pb-safe shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
