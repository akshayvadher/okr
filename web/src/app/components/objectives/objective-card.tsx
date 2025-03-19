'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { KeyResult, ObjectiveWithProgress } from '@/types';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/objectives/status-badge';
import { Button } from '@/components/ui/button';
import { KeyResultFormModal } from '@/components/key-results/key-result-form-modal';
import { KeyResultQuickUpdate } from '@/components/key-results/key-result-quick-update';
import { useIsDebugModeOn } from '@/contex/debug';

interface ObjectiveCardProps {
  objective: ObjectiveWithProgress;
  isExpanded?: boolean;
  onExpandToggle?: (expanded: boolean) => void;
}

export function ObjectiveCard({
  objective,
  isExpanded = false,
  onExpandToggle,
}: ObjectiveCardProps) {
  const isDebugModeOn = useIsDebugModeOn();
  const [expanded, setExpanded] = useState(isExpanded);

  // Sync with parent component's expanded state
  useEffect(() => {
    setExpanded(isExpanded);
  }, [isExpanded]);

  const toggleExpanded = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    onExpandToggle?.(newExpandedState);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleExpanded}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <div>
              <Link
                href={`/objectives/${objective.id}`}
                className="text-lg font-medium hover:text-indigo-600 transition-colors"
              >
                {objective.title} {isDebugModeOn && `ℹ️ ${objective.id}`}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <StatusBadge status={objective.status} />
                <span className="font-medium">{objective.progress}%</span>
              </div>
              <div className="w-32 mt-1">
                <Progress value={objective.progress} className="h-2" />
              </div>
            </div>
            <KeyResultFormModal
              objectiveId={objective.id}
              objectiveTitle={objective.title}
              trigger={
                <Button size="sm" variant="ghost" className="rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </div>
      </div>

      {expanded &&
        objective?.key_results &&
        objective?.key_results.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium">Key Results</h3>
            </div>
            <div className="space-y-2">
              {objective?.key_results.map((keyResult: KeyResult) => (
                <KeyResultQuickUpdate
                  key={keyResult.id}
                  keyResult={keyResult}
                />
              ))}
            </div>
          </div>
        )}
      {expanded &&
        (!objective?.key_results || objective?.key_results?.length === 0) && (
          <div className="border-t p-4 bg-gray-50">
            <small className="text-gray-500">No key results created</small>
          </div>
        )}
    </div>
  );
}
