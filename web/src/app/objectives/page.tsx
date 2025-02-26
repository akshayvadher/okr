import {ObjectiveList} from "@/components/objectives/objective-list";
import {OKRDashboard} from "@/components/dashboard/okr-dashboard";

export default function ObjectivesPage() {
  return (
      <div>
        <OKRDashboard/>
        <ObjectiveList/>
      </div>
  );
}
