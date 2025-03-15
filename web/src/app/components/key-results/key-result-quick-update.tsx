'use client';

import { KeyResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Minus, Plus } from 'lucide-react';
import { useQueueActions } from '@/sync/queue';
import { useIsDebugModeOn } from '@/contex/debug';

interface KeyResultQuickUpdateProps {
  keyResult: KeyResult;
}

export function KeyResultQuickUpdate({ keyResult }: KeyResultQuickUpdateProps) {
  const { enqueue } = useQueueActions();
  const isDebugModeOn = useIsDebugModeOn();

  const progress = keyResult.current;

  const update = (progress: number) => {
    enqueue({
      entity: 'KEY_RESULT',
      action: 'UPDATE_PROGRESS',
      payload: {
        objective_id: keyResult.objective_id,
        keyResultId: keyResult.id,
        progress: progress,
      },
    });
  };
  const handleIncrement = () => {
    const newValue = Math.min(keyResult.target, progress + 1);
    update(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(0, progress - 1);
    update(newValue);
  };

  const progressPercentage = (progress / keyResult.target) * 100;

  return (
    <div className="flex items-center gap-3 p-2 bg-white rounded-md border hover:border-gray-300 transition-colors">
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-sm font-medium truncate max-w-[200px]">
            {keyResult.title} {isDebugModeOn && `ℹ️ ${keyResult.id}`}
          </h4>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="text-indigo-600 font-medium">{progress}</span>
            <span>/</span>
            <span>{keyResult.target}</span>
            <span>{keyResult.metrics || '%'}</span>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-1.5" />
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 rounded-full"
          onClick={handleDecrement}
          disabled={progress <= 0}
        >
          <Minus className="h-3 w-3" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 rounded-full"
          onClick={handleIncrement}
          disabled={progress >= keyResult.target}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
