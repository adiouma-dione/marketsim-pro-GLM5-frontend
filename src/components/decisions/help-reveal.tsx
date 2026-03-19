'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

type HelpTone = 'info' | 'success' | 'warning' | 'danger';

interface HelpRevealProps {
  title: string;
  lines: string[];
  className?: string;
  tone?: HelpTone;
  defaultOpen?: boolean;
}

const toneClasses: Record<HelpTone, string> = {
  info: 'border-blue-200 bg-linear-to-br from-blue-50 via-white to-cyan-50 text-blue-900',
  success: 'border-emerald-200 bg-linear-to-br from-emerald-50 via-white to-lime-50 text-emerald-900',
  warning: 'border-amber-200 bg-linear-to-br from-amber-50 via-white to-orange-50 text-amber-900',
  danger: 'border-red-200 bg-linear-to-br from-red-50 via-white to-rose-50 text-red-900',
};

const toneIconClasses: Record<HelpTone, string> = {
  info: 'bg-blue-600/10 text-blue-700',
  success: 'bg-emerald-600/10 text-emerald-700',
  warning: 'bg-amber-600/10 text-amber-700',
  danger: 'bg-red-600/10 text-red-700',
};

export function HelpReveal({
  title,
  lines,
  className,
  tone = 'info',
  defaultOpen = false,
}: HelpRevealProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border shadow-sm', toneClasses[tone], className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/40"
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold',
              toneIconClasses[tone]
            )}
            aria-hidden="true"
          >
            🛈
          </span>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs opacity-80">
              Cliquez pour afficher l'aide
            </p>
          </div>
        </div>

        <ChevronDown
          className={cn(
            'h-4 w-4 flex-shrink-0 transition-transform duration-300',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-black/5 px-4 pb-4 pt-1">
              <ul className="space-y-2 pt-3 text-sm">
                {lines.map((line) => (
                  <li key={line} className="leading-6 opacity-90">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
