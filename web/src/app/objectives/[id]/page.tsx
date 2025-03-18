'use client';

import { ObjectiveDetail } from '@/components/objectives/objective-detail';
import { use } from 'react';
import { useSelectedObjectiveId } from '@/sync/object-pool';

export default function ObjectiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const selectObjectiveId = useSelectedObjectiveId();
  selectObjectiveId(id);

  return (
    <div>
      <ObjectiveDetail />
    </div>
  );
}
