'use client';

import { KeyResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Minus, Plus } from 'lucide-react';
import { useIsDebugModeOn } from '@/contex/debug';
import useKeyResults from '@/hooks/useKeyResults';

interface KeyResultQuickUpdateProps {
  keyResult: KeyResult;
}

export function KeyResultQuickUpdate({ keyResult }: KeyResultQuickUpdateProps) {
  const isDebugModeOn = useIsDebugModeOn();

  const { updateProgress } = useKeyResults();

  const handleIncrement = () => {
    const newValue = Math.min(keyResult.target, progress + 1);
    updateProgress(keyResult, newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(0, progress - 1);
    updateProgress(keyResult, newValue);
  };

  const progress = keyResult.current;
  const progressPercentage = (progress / keyResult.target) * 100;

  return (
    <div className="flex items-center gap-4 py-2 group hover:bg-white rounded-md transition-all duration-200 hover:shadow-sm">
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <h4 className="text-sm text-gray-600 truncate max-w-[200px] group-hover:text-gray-900 transition-all duration-200 group-hover:translate-x-0.5">
            {keyResult.title} {isDebugModeOn && `ℹ️ ${keyResult.id}`}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 transition-all duration-200 group-hover:text-gray-700">
            <span className="font-medium text-gray-900 transition-all duration-200">{progress}</span>
            <span>/</span>
            <span>{keyResult.target}</span>
            <span className="text-gray-400">{keyResult.metrics || '%'}</span>
          </div>
        </div>
        <div className="mt-1.5">
          <Progress 
            value={progressPercentage} 
            className="h-0.5 bg-gray-100 transition-all duration-500 ease-out" 
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-0">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 rounded-md hover:bg-gray-100/80 disabled:opacity-40 disabled:hover:bg-transparent transition-all duration-200 hover:scale-110 disabled:hover:scale-100"
          onClick={handleDecrement}
          disabled={progress <= 0}
        >
          <Minus className="h-2.5 w-2.5 text-gray-400 transition-transform duration-200" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 rounded-md hover:bg-gray-100/80 disabled:opacity-40 disabled:hover:bg-transparent transition-all duration-200 hover:scale-110 disabled:hover:scale-100"
          onClick={handleIncrement}
          disabled={progress >= keyResult.target}
        >
          <Plus className="h-2.5 w-2.5 text-gray-400 transition-transform duration-200" />
        </Button>
      </div>
    </div>
  );
}
