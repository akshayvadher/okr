'use client';

import { MessageSquare } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@/sync/date/format';
import { CommentForm } from './comment-form';
import { CommentModel } from '@/types/model';

interface ObjectiveCommentsProps {
  objectiveId: string;
  comments?: CommentModel[];
}

export function ObjectiveComments({
  objectiveId,
  comments = [],
}: ObjectiveCommentsProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-gray-400" />
        <div>
          <h2 className="text-sm font-medium text-gray-900">Comments</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Add your thoughts and feedback
          </p>
        </div>
      </div>

      <CommentForm objectiveId={objectiveId} />

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
                    <p className="text-sm text-gray-900 leading-relaxed transition-colors duration-200 group-hover/comment:text-gray-800 whitespace-pre-wrap">
                      {comment.content}
                    </p>
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
