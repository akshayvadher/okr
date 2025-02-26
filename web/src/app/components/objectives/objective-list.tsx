"use client";

import { useObjectives } from "@/hooks/use-objectives";
import { ObjectiveCard } from "@/components/objectives/objective-card";
import { ObjectiveFormModal } from "@/components/objectives/objective-form-modal";
import { CreateObjectiveRequest, CreateKeyResultRequest, UpdateProgressRequest } from "@/types";
import { Button } from "@/components/ui/button";

export function ObjectiveList() {
  const {
    objectives,
    isLoading,
    isError,
    error,
    createObjective,
    isCreating,
  } = useObjectives();

  const handleCreateObjective = (data: CreateObjectiveRequest) => {
    createObjective(data);
  };

  const handleCreateKeyResult = (objectiveId: string, data: CreateKeyResultRequest) => {
    // This will be implemented via the ObjectiveCard component
    console.debug({ objectiveId, data });
  };

  const handleUpdateProgress = (
      objectiveId: string,
      keyResultId: string,
      data: UpdateProgressRequest
  ) => {
    // This will be implemented via the ObjectiveCard component
    console.debug({ objectiveId, keyResultId, data });
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  if (isError) {
    return (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p>Error loading objectives: {error?.message || "Unknown error"}</p>
          <Button className="mt-2" variant="secondary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
    );
  }

  return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Objectives</h1>
          <ObjectiveFormModal
              onSubmit={handleCreateObjective}
              isSubmitting={isCreating}
          />
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
                      onAddKeyResult={(data) => handleCreateKeyResult(objective.id, data)}
                      onUpdateProgress={(keyResultId, data) =>
                          handleUpdateProgress(objective.id, keyResultId, data)
                      }
                  />
              ))}
            </div>
        )}
      </div>
  );
}
