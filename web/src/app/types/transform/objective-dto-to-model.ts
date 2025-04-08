import { ObjectiveDto } from '@/types/dto';
import { p } from '@/sync/date/format';
import { ObjectiveModel, TaskStatus } from '@/types/model';

const serverToModelMapping = (o: ObjectiveDto) => {
  return {
    ...o,
    createdAt: p(o.createdAt),
    updatedAt: p(o.updatedAt),
  } as ObjectiveModel;
};

export const objectiveDtoToModel = (objectives: ObjectiveDto[]) => {
  const objectivesModel = objectives
    .map(serverToModelMapping)
    .sort((a, b) => a.id.localeCompare(b.id));
  const keyResultsModel = objectives.flatMap((o) =>
    o.keyResults
      .map((k) => {
        return {
          ...k,
          createdAt: p(k.createdAt),
          updatedAt: p(k.updatedAt),
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
  const commentsModel = objectives.flatMap((o) =>
    o.comments
      .map((c) => {
        return {
          ...c,
          createdAt: p(c.createdAt),
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id)),
  );

  const tasksModel = objectives.flatMap((o) =>
    o.tasks
      .map((t) => {
        return {
          ...t,
          createdAt: p(t.createdAt),
          updatedAt: p(t.updatedAt),
          status: t.status as TaskStatus,
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
  return {
    objectives: objectivesModel,
    keyResults: keyResultsModel,
    comments: commentsModel,
    tasks: tasksModel,
  };
};
