import { ObjectiveDetail } from "@/components/objectives/objective-detail";

export default async function ObjectiveDetailPage({
                                              params,
                                            }: {
  params: Promise<{ id: string }>;
}) {
  const {id} = await params;
  return (
      <div>
        <ObjectiveDetail objectiveId={id} />
      </div>
  );
}
