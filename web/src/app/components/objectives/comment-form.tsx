'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownPreview from '@uiw/react-markdown-preview';
import useComments from '@/hooks/useComments';
import { Plus } from 'lucide-react';

interface CommentFormProps {
  objectiveId: string;
  placeholder?: string;
}

interface CommentFormData {
  content: string;
}

export function CommentForm({ objectiveId, placeholder = 'Add a comment...' }: CommentFormProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { createComment } = useComments();
  const { handleSubmit, reset, formState: { errors } } = useForm<CommentFormData>();
  const [content, setContent] = useState('');

  const handleFormSubmit = useCallback(() => {
    if (content.trim()) {
      createComment(objectiveId, content.trim());
      setContent('');
      reset();
      setIsFocused(false);
    }
  }, [content, objectiveId, createComment, reset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocused && (e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleFormSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, handleFormSubmit]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-2">
      <div className="min-h-[40px]">
        {isFocused ? (
          <MdEditor
            value={content}
            onChange={({ text }) => setContent(text)}
            style={{ height: '300px' }}
            renderHTML={(text) => <MarkdownPreview source={text} />}
            config={{
              view: {
                menu: true,
                md: true,
                html: false,
              },
              canView: {
                menu: true,
                md: true,
                html: false,
                fullScreen: false,
                hideMenu: false,
              },
            }}
            onFocus={() => setIsFocused(true)}
          />
        ) : (
          <Textarea
            placeholder={placeholder}
            className="h-10 min-h-[40px] max-h-[200px] resize-none text-sm border-gray-200 focus:border-gray-300 focus:ring-gray-300 transition-all duration-200"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
        )}
      </div>
      {errors.content && (
        <p className="text-sm text-red-500">{errors.content.message}</p>
      )}
      {isFocused && (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsFocused(false);
              setContent('');
              reset();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Comment
          </Button>
        </div>
      )}
    </form>
  );
} 
