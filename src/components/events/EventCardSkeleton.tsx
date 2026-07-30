import React from 'react';

export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col animate-pulse shadow-lg">
      {/* Banner Skeleton */}
      <div className="relative h-48  flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white dark:bg-blue-950/80 border border-slate-200 dark:border-slate-800/60" />
        <div className="absolute top-3 left-3 w-16 h-5 rounded bg-slate-100 dark:bg-slate-800/90" />
        <div className="absolute top-3 right-3 w-20 h-5 rounded bg-slate-100 dark:bg-slate-800/90" />
      </div>

      {/* Content Skeleton */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Location line */}
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
            <div className="w-32 h-3.5 rounded bg-slate-100 dark:bg-slate-800" />
          </div>

          {/* Title line */}
          <div className="w-3/4 h-6 rounded-md bg-slate-100 dark:bg-slate-800" />

          {/* Description lines */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-3 rounded bg-slate-100 dark:bg-slate-800/70" />
            <div className="w-5/6 h-3 rounded bg-slate-100 dark:bg-slate-800/70" />
          </div>

          {/* Category Chips Skeleton */}
          <div className="flex gap-1.5 pt-2">
            <div className="w-16 h-4 rounded bg-slate-100 dark:bg-slate-800/60" />
            <div className="w-20 h-4 rounded bg-slate-100 dark:bg-slate-800/60" />
            <div className="w-14 h-4 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>

        {/* Footer line */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="w-24 h-4 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="w-20 h-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
};
