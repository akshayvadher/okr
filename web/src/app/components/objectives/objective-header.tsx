'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownPreview from '@uiw/react-markdown-preview';
import useObjectives from '@/hooks/useObjectives';
import { ObjectiveModel } from '@/types/model';

interface ObjectiveHeaderProps {
  objective: ObjectiveModel;
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

  const handleDescriptionSubmit = useCallback(() => {
    if (description.trim() !== objective.description) {
      patchObjective(objective.id, { description: description.trim() });
    }
    setIsEditingDescription(false);
  }, [description, objective.description, objective.id, patchObjective]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingDescription && (e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleDescriptionSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditingDescription, handleDescriptionSubmit]);

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
        <div className="space-y-2">
          <div className="min-h-[200px]">
            <MdEditor
              value={description}
              onChange={({ text }) => setDescription(text)}
              style={{ height: '200px' }}
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
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingDescription(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleDescriptionSubmit}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="prose prose-sm max-w-none text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
          onClick={() => setIsEditingDescription(true)}
        >
          {objective.description ? (
            <div className="[&>ul]:!list-disc [&>ul]:!list-inside [&>ol]:!list-decimal [&>ol]:!list-inside [&>ul]:!list-style-disc [&>ol]:!list-style-decimal">
              <MarkdownPreview source={objective.description} />
            </div>
          ) : (
            <p>Add a description...</p>
          )}
        </div>
      )}
    </div>
  );
}
