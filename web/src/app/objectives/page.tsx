import { ObjectiveList } from '@/components/objectives/objective-list';
import { QueueApp } from '@/sync/QueueApp';

export default function ObjectivesPage() {
  return (
    <div>
      {/*<OKRDashboard/>*/}
      <ObjectiveList />
      <QueueApp />
    </div>
  );
}
