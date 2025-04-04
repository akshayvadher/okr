import { useEnqueue } from '@/sync/queue';
import { useCallback } from 'react';
import { CreateKeyResultRequest } from '@/types/dto/request';
import { KeyResultModel } from '@/types/model';

const parseInput = (input: string) => {
  try {
    const parts = input.split(' ');
    const numberIndex = parts.findIndex((part) => !isNaN(Number(part)));

    if (
      numberIndex === -1 ||
      numberIndex === 0 ||
      numberIndex === parts.length - 1
    ) {
      return { title: input, target: 100, metrics: '%' };
    }
    return {
      title: parts.slice(0, numberIndex).join(' '),
      target: parseInt(parts[numberIndex], 10),
      metrics: parts.slice(numberIndex + 1).join(' '),
    };
  } catch (e) {
    console.log('error parsing the kr text', { e });
    return { title: input, target: 100, metrics: '%' };
  }
};

const useKeyResults = () => {
  const enqueue = useEnqueue();

  const createKeyResult = useCallback(
    (objectiveId: string, data: CreateKeyResultRequest) => {
      const kr = parseInput(data.title);
      enqueue({
        entity: 'KEY_RESULT',
        action: 'CREATE',
        payload: {
          ...kr,
          objectiveId,
        },
      });
    },
    [enqueue],
  );

  const updateProgress = useCallback(
    (keyResult: KeyResultModel, progress: number) => {
      enqueue({
        entity: 'KEY_RESULT',
        action: 'UPDATE_PROGRESS',
        payload: {
          objectiveId: keyResult.objectiveId,
          keyResultId: keyResult.id,
          progress: progress,
        },
      });
    },
    [enqueue],
  );

  return { createKeyResult, updateProgress };
};

export default useKeyResults;
