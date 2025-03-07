"use client";

import {useObjective} from "@/hooks/use-objectives";
import {StatusBadge} from "@/components/objectives/status-badge";
import {Progress} from "@/components/ui/progress";
import {Button} from "@/components/ui/button";
import {
  KeyResultFormModal
} from "@/components/key-results/key-result-form-modal";
import {
  KeyResultProgressUpdate
} from "@/components/key-results/progress-update";
import {ArrowLeft} from "lucide-react";
import Link from "next/link";
import {UpdateProgressRequest} from "@/types";

interface ObjectiveDetailProps {
  objectiveId: string;
}

export function ObjectiveDetail({objectiveId}: ObjectiveDetailProps) {
  const {
    objective,
    isLoading,
    isError,
    error,
    isCreatingKeyResult,
    updateKeyResultProgress,
    isUpdatingProgress,
  } = useObjective(objectiveId);

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
          <p>Error loading objective: {error?.message || "Unknown error"}</p>
          <Button className="mt-2" variant="secondary"
                  onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
    );
  }

  if (!objective) {
    return (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">Objective not found</p>
          <Link href="/objectives" className="mt-4 inline-block">
            <Button variant="secondary">Back to Objectives</Button>
          </Link>
        </div>
    );
  }

  const handleUpdateProgress = (keyResultId: string, data: UpdateProgressRequest) => {
    updateKeyResultProgress({keyResultId, data});
  };


  return (
      <div>
        <div className="mb-8">
          <Link href="/objectives"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1"/>
            Back to all objectives
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{objective.title}</h1>

            </div>
            <StatusBadge status={objective.status}/>
          </div>

          {objective.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{objective.description}</p>
              </div>
          )}

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span
                  className="font-medium">Overall Progress: {objective.progress}%</span>
            </div>
            <Progress value={objective.progress} className="h-3"/>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Key Results</h2>
            <KeyResultFormModal
                objectiveId={objective.id}
                objectiveTitle={objective.title}
                isSubmitting={isCreatingKeyResult}
            />
          </div>

          {objective.key_results && objective.key_results.length > 0 ? (
              <div className="grid gap-4">
                {objective.key_results.map((keyResult) => (
                    <div key={keyResult.id}
                         className="border rounded-lg p-4 bg-white">
                      <KeyResultProgressUpdate
                          keyResult={keyResult}
                          onUpdate={(keyResultId, data) => handleUpdateProgress(keyResultId, data)}
                          isUpdating={isUpdatingProgress}
                      />
                    </div>
                ))}
              </div>
          ) : (
              <div className="text-center p-8 border rounded-lg bg-gray-50">
                <p className="text-gray-500 mb-4">No key results found</p>
                <KeyResultFormModal
                    objectiveId={objective.id}
                    objectiveTitle={objective.title}
                    isSubmitting={isCreatingKeyResult}
                    trigger={<Button>Add Your First Key Result</Button>}
                />
              </div>
          )}
        </div>
      </div>
  );
}
