'use client';

import { ObjectiveDetail } from '@/components/objectives/objective-detail';
import { use } from 'react';
import { useSelectObjectiveId } from '@/hooks/useObjectives';

export default function ObjectiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const selectObjectiveId = useSelectObjectiveId();
  selectObjectiveId(id);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <ObjectiveDetail />
      </div>
    </div>
  );
}
