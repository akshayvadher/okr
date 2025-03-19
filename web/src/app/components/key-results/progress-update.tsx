'use client';

import { KeyResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Minus, Plus } from 'lucide-react';
import useKeyResults from '@/hooks/useKeyResults';
import { ChangeEvent } from 'react';

interface KeyResultProgressUpdateProps {
  keyResult: KeyResult;
}

export function KeyResultProgressUpdate({
  keyResult,
}: KeyResultProgressUpdateProps) {
  const { updateProgress } = useKeyResults();

  const handleIncrement = () => {
    const newValue = Math.min(keyResult.target, progress + 1);
    updateProgress(keyResult, newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(0, progress - 1);
    updateProgress(keyResult, newValue);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      const newValue = Math.max(0, Math.min(keyResult.target, value));
      updateProgress(keyResult, newValue);
    }
  };

  const progress = keyResult.current;
  const progressPercentage = (progress / keyResult.target) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{keyResult.title}</span>
        <div className="text-xs">
          Target: {keyResult.target} {keyResult.metrics || '%'}
        </div>
      </div>

      <div className="mb-3">
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-full h-8 w-8 p-0"
          onClick={handleDecrement}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Input
          type="number"
          min={0}
          max={keyResult.target}
          value={progress}
          onChange={handleInputChange}
          className="h-8 text-center"
        />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-full h-8 w-8 p-0"
          onClick={handleIncrement}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
