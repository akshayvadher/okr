import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  CreateKeyResultRequest,
  CreateObjectiveRequest,
  ObjectiveWithProgress,
  UpdateProgressRequest
} from '@/types';
import {api, calculateObjectiveStatus} from '@/lib/api';

export function useObjectives() {
  const queryClient = useQueryClient();

  const objectivesQuery = useQuery({
    queryKey: ['objectives'],
    queryFn: api.getObjectives,
    select: (data) =>
        data.map((objective) => ({
          ...objective,
          ...calculateObjectiveStatus(objective),
        })) as ObjectiveWithProgress[],
  });

  const createObjectiveMutation = useMutation({
    mutationFn: (data: CreateObjectiveRequest) => api.createObjective(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });

  return {
    objectives: objectivesQuery.data || [],
    isLoading: objectivesQuery.isLoading,
    isError: objectivesQuery.isError,
    error: objectivesQuery.error,
    createObjective: createObjectiveMutation.mutate,
    isCreating: createObjectiveMutation.isPending,
  };
}

export function useObjective(id: string) {
  const queryClient = useQueryClient();

  const objectiveQuery = useQuery({
    queryKey: ['objective', id],
    queryFn: () => api.getObjectiveDetails(id),
    select: (data) => ({
      ...data,
      ...calculateObjectiveStatus(data),
    }) as ObjectiveWithProgress,
  });

  const createKeyResultMutation = useMutation({
    mutationFn: (data: CreateKeyResultRequest) => api.createKeyResult(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objective', id] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });

  const updateKeyResultProgressMutation = useMutation({
    mutationFn: ({
                   keyResultId,
                   data
                 }: {
      keyResultId: string;
      data: UpdateProgressRequest
    }) => api.updateKeyResultProgress(keyResultId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objective', id] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });

  return {
    objective: objectiveQuery.data,
    isLoading: objectiveQuery.isLoading,
    isError: objectiveQuery.isError,
    error: objectiveQuery.error,
    createKeyResult: createKeyResultMutation.mutate,
    isCreatingKeyResult: createKeyResultMutation.isPending,
    updateKeyResultProgress: updateKeyResultProgressMutation.mutate,
    isUpdatingProgress: updateKeyResultProgressMutation.isPending,
  };
}
