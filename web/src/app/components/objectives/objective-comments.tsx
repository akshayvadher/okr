'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentModal } from '@/types/modal';
import useComments from '@/hooks/useComments';
import { MessageSquare } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@/sync/date/format';

interface ObjectiveCommentsProps {
  objectiveId: string;
  comments?: CommentModal[];
}

export function ObjectiveComments({ objectiveId, comments = [] }: ObjectiveCommentsProps) {
  const { createComment } = useComments();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ content: string }>();

  const handleFormSubmit = (data: { content: string }) => {
    createComment(objectiveId, data.content);
    reset();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-gray-400" />
        <div>
          <h2 className="text-sm font-medium text-gray-900">Comments</h2>
          <p className="text-xs text-gray-500 mt-0.5">Add your thoughts and feedback</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Write a comment..."
            className="h-10 min-h-[40px] max-h-[200px] resize-none text-sm border-gray-200 focus:border-gray-300 focus:ring-gray-300 transition-all duration-200 focus:min-h-[100px]"
            {...register('content', { required: 'Comment is required' })}
          />
          {errors.content && (
            <p className="text-xs text-red-500">{errors.content.message}</p>
          )}
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-gray-900/90 hover:bg-gray-900 text-sm font-medium px-3 h-8 rounded-md transition-all duration-200 hover:scale-105"
          >
            Add Comment
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="py-4 first:pt-0 last:pb-0 group/comment"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-colors duration-200 group-hover/comment:bg-gray-200">
                    <MessageSquare className="h-4 w-4 text-gray-400 transition-colors duration-200 group-hover/comment:text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 leading-relaxed transition-colors duration-200 group-hover/comment:text-gray-800">{comment.content}</p>
                    <div className="relative h-4">
                      <p className="absolute inset-0 text-xs text-gray-400 transition-colors duration-200 group-hover/comment:text-gray-500">
                        <span className="group-hover/comment:hidden">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </p>
                      <p className="absolute inset-0 text-xs text-gray-400 opacity-0 group-hover/comment:opacity-100 transition-opacity duration-200">
                        {formatDateTime(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-5 w-5 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No comments yet</p>
          </div>
        )}
      </div>
    </div>
  );
} 