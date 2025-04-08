'use client';

import { CheckSquare } from 'lucide-react';
import { TaskForm } from './task-form';
import { TaskItem } from './task-item';
import { TaskModel } from '@/types/model';

interface ObjectiveTasksProps {
  objectiveId: string;
  tasks?: TaskModel[];
}

export function ObjectiveTasks({
  objectiveId,
  tasks = [],
}: ObjectiveTasksProps) {


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-gray-400" />
        <div>
          <h2 className="text-sm font-medium text-gray-900">Tasks</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track your action items
          </p>
        </div>
      </div>

      <TaskForm objectiveId={objectiveId} />

      <div className="space-y-4">
        {tasks.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} objectiveId={objectiveId} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckSquare className="h-5 w-5 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
