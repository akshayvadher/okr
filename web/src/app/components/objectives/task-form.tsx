'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import useTasks from '@/hooks/useTasks';

interface TaskFormProps {
  objectiveId: string;
}

export function TaskForm({ objectiveId }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const { createTask } = useTasks();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask(objectiveId, title.trim());
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm"
        />
        <Button
          type="submit"
          size="sm"
          className="bg-gray-900 hover:bg-gray-800"
          disabled={!title.trim()}
        >
          Add
        </Button>
      </div>
    </form>
  );
}
