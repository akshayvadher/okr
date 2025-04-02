'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import useComments from '@/hooks/useComments';

interface CommentFormProps {
  objectiveId: string;
  placeholder?: string;
}

export function CommentForm({ objectiveId, placeholder = "Write a comment..." }: CommentFormProps) {
  const [isFocused, setIsFocused] = useState(false);
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
    setIsFocused(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder={placeholder}
          className={`h-10 min-h-[40px] max-h-[200px] resize-none text-sm border-gray-200 focus:border-gray-300 focus:ring-gray-300 transition-all duration-200 ${isFocused ? 'min-h-[100px]' : ''}`}
          onFocus={() => setIsFocused(true)}
          {...register('content', { 
            required: 'Comment is required',
            onBlur: (e) => {
              const relatedTarget = e.relatedTarget as HTMLButtonElement;
              if (relatedTarget?.getAttribute('type') !== 'submit') {
                setIsFocused(false);
              }
            }
          })}
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
  );
} 