'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { StatusBadge } from '@/components/objectives/status-badge';
import { Button } from '@/components/ui/button';
import { KeyResultFormModal } from '@/components/key-results/key-result-form-modal';
import { KeyResultQuickUpdate } from '@/components/key-results/key-result-quick-update';
import { useIsDebugModeOn } from '@/contex/debug';
import { ObjectiveView } from '@/types/view';
import { KeyResultModel } from '@/types/model';

interface ObjectiveCardProps {
  objective: ObjectiveView;
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
    <div className="py-4 group/card hover:bg-gray-50/50 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleExpanded}
            className="p-1.5 rounded-md hover:bg-white transition-all duration-200 transform hover:scale-105"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 rotate-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400 transition-transform duration-200 rotate-0" />
            )}
          </button>
          <div>
            <Link
              href={`/objectives/${objective.id}`}
              className="text-sm font-semibold text-gray-900 hover:text-gray-700 transition-all duration-200 hover:translate-x-0.5"
            >
              {objective.title} {isDebugModeOn && `ℹ️ ${objective.id}`}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={objective.status} />
            <span className="text-xs font-medium text-gray-900 transition-all duration-200">
              {objective.progress}%
            </span>
          </div>
          <div className="opacity-0 group-hover/card:opacity-100 transition-all duration-200 transform group-hover/card:translate-x-0">
            <KeyResultFormModal
              objectiveId={objective.id}
              objectiveTitle={objective.title}
              trigger={
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 rounded-md hover:bg-white transition-all duration-200 hover:scale-110"
                >
                  <Plus className="h-3 w-3 text-gray-500 transition-transform duration-200" />
                </Button>
              }
            />
          </div>
        </div>
      </div>

      {expanded &&
        objective?.keyResults &&
        objective?.keyResults.length > 0 && (
          <div className="mt-4 ml-8 animate-fadeIn">
            <div className="relative pl-4 border-l border-gray-100">
              <div className="space-y-2">
                {objective?.keyResults.map(
                  (keyResult: KeyResultModel, index: number) => (
                    <div
                      key={keyResult.id}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="animate-fadeIn"
                    >
                      <KeyResultQuickUpdate keyResult={keyResult} />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      {expanded &&
        (!objective?.keyResults || objective?.keyResults?.length === 0) && (
          <div className="mt-4 ml-8 animate-fadeIn">
            <div className="relative pl-4 border-l border-gray-100">
              <p className="text-xs text-gray-500">No key results</p>
            </div>
          </div>
        )}
    </div>
  );
}
