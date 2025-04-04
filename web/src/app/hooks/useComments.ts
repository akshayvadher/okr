import { useEnqueue } from '@/sync/queue';
import { CreateCommentRequest } from '@/types/dto/request';
import { useCallback } from 'react';

const useComments = () => {
  const enqueue = useEnqueue();

  const createComment = useCallback(
    (objectiveId: string, content: string, keyResultId?: string) => {
      const comment: CreateCommentRequest = {
        content,
        objectiveId,
        keyResultId,
      };

      enqueue({
        entity: 'COMMENT',
        action: 'CREATE',
        payload: comment,
      });
    },
    [enqueue],
  );

  return { createComment };
};

export default useComments;
