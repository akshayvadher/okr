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
  if (!objective.key_results || objective.key_results.length === 0) {
    return { progress: 0, status: 'at-risk' };
  }

  const totalProgress = objective.key_results.reduce((sum, kr) => {
    return sum + (kr.current / kr.target) * 100;
  }, 0);

  const averageProgress = totalProgress / objective.key_results.length;

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
