'use client';

import { Button } from '@/components/ui/button';
import { KeyResultFormModal } from '@/components/key-results/key-result-form-modal';
import { KeyResultProgressUpdate } from '@/components/key-results/progress-update';
import { ObjectiveComments } from '@/components/objectives/objective-comments';
import { ObjectiveHeader } from '@/components/objectives/objective-header';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useObjectiveFromPool } from '@/hooks/useObjectives';

export function ObjectiveDetail() {
  const objective = useObjectiveFromPool();

  if (!objective) {
    return (
      <div className="text-center py-12">
        <div className="max-w-sm mx-auto">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Objective not found
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            The objective you&apos;re looking for doesn&apos;t exist
          </p>
          <Link href="/objectives">
            <Button size="sm" className="bg-gray-900 hover:bg-gray-800">
              Back to objectives
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/objectives"
          className="inline-flex items-center text-xs text-gray-500 hover:text-gray-900 mb-4 group"
        >
          <ArrowLeft className="h-3 w-3 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to objectives
        </Link>

        <ObjectiveHeader objective={objective} />

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-gray-500">Progress:</span>
          <span className="text-sm font-medium text-gray-900">
            {objective.progress}%
          </span>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-900">Key Results</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Track your progress
              </p>
            </div>
            <KeyResultFormModal
              objectiveId={objective.id}
              objectiveTitle={objective.title}
            />
          </div>

          {objective.keyResults.length > 0 ? (
            <div className="space-y-4">
              {objective.keyResults.map((keyResult) => (
                <div key={keyResult.id} className="group relative">
                  <div className="absolute -left-3 top-0 bottom-0 w-px bg-gray-100 group-hover:bg-gray-200 transition-colors" />
                  <KeyResultProgressUpdate keyResult={keyResult} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-gray-500">No key results</p>
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-gray-100">
          <ObjectiveComments
            objectiveId={objective.id}
            comments={objective.comments}
          />
        </div>
      </div>
    </div>
  );
}
