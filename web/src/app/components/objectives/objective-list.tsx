'use client';

import { useState } from 'react';
import { ObjectiveCard } from '@/components/objectives/objective-card';
import { ObjectiveFormModal } from '@/components/objectives/objective-form-modal';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import useObjectives from '@/hooks/useObjectives';

export function ObjectiveList() {
  const { objectives, createObjective } = useObjectives();

  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(
    new Set(),
  );

  const toggleObjectiveExpanded = (objectiveId: string, expanded: boolean) => {
    setExpandedObjectives((prev) => {
      const newSet = new Set(prev);
      if (expanded) {
        newSet.add(objectiveId);
      } else {
        newSet.delete(objectiveId);
      }
      return newSet;
    });
  };

  const toggleExpandAll = () => {
    if (expandedObjectives.size === objectives.length) {
      // If all are expanded, collapse all
      setExpandedObjectives(new Set());
    } else {
      // Expand all
      setExpandedObjectives(new Set(objectives.map((obj) => obj.id)));
    }
  };

  const allExpanded =
    objectives.length > 0 && expandedObjectives.size === objectives.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-gray-900">Objectives</h1>
          {objectives.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpandAll}
              className="h-8 px-2 text-xs text-gray-500 hover:text-gray-900"
            >
              {allExpanded ? (
                <>
                  <ChevronRight className="h-3 w-3 mr-1" />
                  <span>Collapse all</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  <span>Expand all</span>
                </>
              )}
            </Button>
          )}
        </div>
        <ObjectiveFormModal onSubmit={createObjective} />
      </div>

      {objectives.length === 0 ? (
        <div className="text-center py-12 border-b">
          <div className="max-w-sm mx-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-1">No objectives yet</h3>
            <p className="text-xs text-gray-500 mb-4">Get started by creating your first objective</p>
            <ObjectiveFormModal
              onSubmit={createObjective}
              trigger={<Button size="sm" className="bg-gray-900 hover:bg-gray-800">Create objective</Button>}
            />
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {objectives.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              isExpanded={expandedObjectives.has(objective.id)}
              onExpandToggle={(expanded) =>
                toggleObjectiveExpanded(objective.id, expanded)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
