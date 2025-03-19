'use client';

import { StatusBadge } from '@/components/objectives/status-badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { KeyResultFormModal } from '@/components/key-results/key-result-form-modal';
import { KeyResultProgressUpdate } from '@/components/key-results/progress-update';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useObjectiveFromPool } from '@/sync/object-pool';

export function ObjectiveDetail() {
  const objective = useObjectiveFromPool();

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

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/objectives"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to all objectives
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{objective.title}</h1>
          </div>
          <StatusBadge status={objective.status} />
        </div>

        {objective.description && (
          <div className="mt-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 whitespace-pre-line">
              {objective.description}
            </p>
          </div>
        )}

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">
              Overall Progress: {objective.progress}%
            </span>
          </div>
          <Progress value={objective.progress} className="h-3" />
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Key Results</h2>
          <KeyResultFormModal
            objectiveId={objective.id}
            objectiveTitle={objective.title}
          />
        </div>

        {objective.key_results && objective.key_results.length > 0 ? (
          <div className="grid gap-4">
            {objective.key_results.map((keyResult) => (
              <div
                key={keyResult.id}
                className="border rounded-lg p-4 bg-white"
              >
                <KeyResultProgressUpdate keyResult={keyResult} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg bg-gray-50">
            <p className="text-gray-500 mb-4">No key results found</p>
            <KeyResultFormModal
              objectiveId={objective.id}
              objectiveTitle={objective.title}
              trigger={<Button>Add Your First Key Result</Button>}
            />
          </div>
        )}
      </div>
    </div>
  );
}
