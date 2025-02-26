"use client";

import {useState} from "react";
import Link from "next/link";
import {ChevronDown, ChevronRight, Plus} from "lucide-react";
import {KeyResult, ObjectiveWithProgress} from "@/types";
// import {formatDate} from "@/lib/utils";
import {Progress} from "@/components/ui/progress";
import {StatusBadge} from "@/components/objectives/status-badge";
import {Button} from "@/components/ui/button";
import {
  KeyResultFormModal
} from "@/components/key-results/key-result-form-modal";
import {
  ProgressUpdateModal
} from "@/components/key-results/progress-update-modal";

interface ObjectiveCardProps {
  objective: ObjectiveWithProgress;
  onAddKeyResult: (data: { title: string; target: number }) => void;
  onUpdateProgress: (keyResultId: string, data: { progress: number }) => void;
  isUpdatingProgress?: boolean;
}

export function ObjectiveCard({
                                objective,
                                onAddKeyResult,
                                onUpdateProgress,
                                isUpdatingProgress = false,
                              }: ObjectiveCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1 rounded-md hover:bg-gray-100"
              >
                {expanded ? (
                    <ChevronDown className="h-4 w-4"/>
                ) : (
                    <ChevronRight className="h-4 w-4"/>
                )}
              </button>
              <div>
                <Link
                    href={`/objectives/${objective.id}`}
                    className="text-lg font-medium hover:text-indigo-600 transition-colors"
                >
                  {objective.title}
                </Link>
                <p className="text-sm text-gray-500">
                  {/*{formatDate(objective.start_date)} - {formatDate(objective.end_date)}*/}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <StatusBadge status={objective.status}/>
                  <span className="font-medium">{objective.progress}%</span>
                </div>
                <div className="w-32 mt-1">
                  <Progress value={objective.progress} className="h-2"/>
                </div>
              </div>
              <KeyResultFormModal
                  objectiveId={objective.id}
                  objectiveTitle={objective.title}
                  onSubmit={onAddKeyResult}
                  trigger={
                    <Button size="sm" variant="ghost" className="rounded-full">
                      <Plus className="h-4 w-4"/>
                    </Button>
                  }
              />
            </div>
          </div>
        </div>
        {expanded && objective.key_results && objective.key_results.length > 0 && (
            <div className="border-t p-4 bg-gray-50">
              <h3 className="text-sm font-medium mb-3">Key Results</h3>
              <div className="space-y-2">
                {objective.key_results.map((keyResult: KeyResult) => (
                    <ProgressUpdateModal
                        key={keyResult.id}
                        keyResult={keyResult}
                        onSubmit={onUpdateProgress}
                        isSubmitting={isUpdatingProgress}
                    />
                ))}
              </div>
            </div>
        )}
      </div>
  );
}
