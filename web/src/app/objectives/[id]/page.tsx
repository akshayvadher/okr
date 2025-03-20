'use client';

import { ObjectiveDetail } from '@/components/objectives/objective-detail';
import { use } from 'react';
import { useSelectObjectiveId } from '@/sync/object-pool';

export default function ObjectiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const selectObjectiveId = useSelectObjectiveId();
  selectObjectiveId(id);

  return (
    <div>
      <ObjectiveDetail />
    </div>
  );
}
