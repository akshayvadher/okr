'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import useObjectives from '@/hooks/useObjectives';
import { Objective } from '@/types';

interface ObjectiveHeaderProps {
  objective: Objective;
}

export function ObjectiveHeader({ objective }: ObjectiveHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState(objective.title);
  const [description, setDescription] = useState(objective.description || '');
  const { patchObjective } = useObjectives();

  const handleTitleSubmit = () => {
    if (title.trim() !== objective.title) {
      patchObjective(objective.id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSubmit = () => {
    if (description.trim() !== objective.description) {
      patchObjective(objective.id, { description: description.trim() });
    }
    setIsEditingDescription(false);
  };

  return (
    <div className="space-y-4">
      {isEditingTitle ? (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleTitleSubmit();
            }
          }}
          className="text-2xl font-semibold border-gray-200 focus:border-gray-300 focus:ring-gray-300"
          autoFocus
        />
      ) : (
        <h1
          className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors"
          onClick={() => setIsEditingTitle(true)}
        >
          {objective.title}
        </h1>
      )}

      {isEditingDescription ? (
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionSubmit}
          className="min-h-[100px] resize-none text-sm border-gray-200 focus:border-gray-300 focus:ring-gray-300"
          placeholder="Add a description..."
          autoFocus
        />
      ) : (
        <p
          className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors whitespace-pre-wrap"
          onClick={() => setIsEditingDescription(true)}
        >
          {objective.description || 'Add a description...'}
        </p>
      )}
    </div>
  );
} 