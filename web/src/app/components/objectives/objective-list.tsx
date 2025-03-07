"use client";

import {useState} from "react";
import {useObjectives} from "@/hooks/use-objectives";
import {ObjectiveCard} from "@/components/objectives/objective-card";
import {ObjectiveFormModal} from "@/components/objectives/objective-form-modal";
import {CreateObjectiveRequest, UpdateProgressRequest} from "@/types";
import {Button} from "@/components/ui/button";
import {ChevronDown, ChevronRight} from "lucide-react";
import {useQueueProducer} from "@/sync/queue";
import {useObjectiveFromPool} from "@/sync/object-pool";

export function ObjectiveList() {
  const {
    isLoading,
    isError,
    error,
    isCreating,
  } = useObjectives();

  const objectives = useObjectiveFromPool();
  const {enqueue} = useQueueProducer();

  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());

  const handleCreateObjective = (data: CreateObjectiveRequest) => {
    enqueue({
      entity: "OBJECTIVE",
      action: "CREATE",
      payload: data,
    })
  };

  const handleUpdateProgress = (
      objectiveId: string,
      keyResultId: string,
      data: UpdateProgressRequest
  ) => {
    // This will be implemented via the ObjectiveCard component
    console.debug({objectiveId, keyResultId, data});
  };

  const toggleObjectiveExpanded = (objectiveId: string, expanded: boolean) => {
    setExpandedObjectives(prev => {
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
      setExpandedObjectives(new Set(objectives.map(obj => obj.id)));
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div
              className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  if (isError) {
    return (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p>Error loading objectives: {error?.message || "Unknown error"}</p>
          <Button className="mt-2" variant="secondary"
                  onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
    );
  }

  const allExpanded = objectives.length > 0 && expandedObjectives.size === objectives.length;

  return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Objectives</h1>
          <div className="flex gap-2">
            {objectives.length > 0 && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleExpandAll}
                    className="flex items-center gap-1"
                >
                  {allExpanded ? (
                      <>
                        <ChevronRight className="h-4 w-4"/>
                        <span>Collapse All</span>
                      </>
                  ) : (
                      <>
                        <ChevronDown className="h-4 w-4"/>
                        <span>Expand All</span>
                      </>
                  )}
                </Button>
            )}
            <ObjectiveFormModal
                onSubmit={handleCreateObjective}
                isSubmitting={isCreating}
            />
          </div>
        </div>

        {objectives.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-gray-50">
              <p className="text-gray-500 mb-4">No objectives found</p>
              <ObjectiveFormModal
                  onSubmit={handleCreateObjective}
                  isSubmitting={isCreating}
                  trigger={<Button>Create Your First Objective</Button>}
              />
            </div>
        ) : (
            <div className="space-y-4">
              {objectives.map((objective) => (
                  <ObjectiveCard
                      key={objective.id}
                      objective={objective}
                      onUpdateProgress={(keyResultId, data) =>
                          handleUpdateProgress(objective.id, keyResultId, data)
                      }
                      isExpanded={expandedObjectives.has(objective.id)}
                      onExpandToggle={(expanded) => toggleObjectiveExpanded(objective.id, expanded)}
                  />
              ))}
            </div>
        )}
      </div>
  );
}
