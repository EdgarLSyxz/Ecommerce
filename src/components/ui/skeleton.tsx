'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-muted',
        'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent after:[background-size:200%_100%] after:animate-[shimmer_1.6s_linear_infinite]',
        'dark:after:via-white/[0.04]',
        className,
      )}
      {...props}
    />
  );
}
