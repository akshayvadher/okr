import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Objective } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateObjectiveStatus(objective: Objective): {
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind';
} {
  if (!objective.keyResults || objective.keyResults.length === 0) {
    return { progress: 0, status: 'at-risk' };
  }

  const totalProgress = objective.keyResults.reduce((sum, kr) => {
    return sum + (kr.current / kr.target) * 100;
  }, 0);

  const averageProgress = totalProgress / objective.keyResults.length;

  // Determine status based on progress percentage
  let status: 'on-track' | 'at-risk' | 'behind' = 'on-track';

  if (averageProgress < 40) {
    status = 'behind';
  } else if (averageProgress < 70) {
    status = 'at-risk';
  }

  return {
    progress: Math.round(averageProgress * 10) / 10, // Round to 1 decimal place
    status,
  };
}
