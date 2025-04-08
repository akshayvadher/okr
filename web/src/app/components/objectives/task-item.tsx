'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckSquare, Edit, Check } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@/sync/date/format';
import { TaskModel, TaskStatus } from '@/types/model';
import { Badge } from '../../components/ui/badge';
import { Input } from '@/components/ui/input';
import useTasks from '@/hooks/useTasks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskItemProps {
  task: TaskModel;
  objectiveId: string;
}

export function TaskItem({ task, objectiveId }: TaskItemProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { updateTask, updateTaskStatus } = useTasks();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-700';
      case 'doing':
        return 'bg-blue-100 text-blue-700';
      case 'done':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, title.trim(), objectiveId);
    } else {
      setTitle(task.title);
    }
    setIsEditingTitle(false);
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus !== task.status) {
      updateTaskStatus(task.id, newStatus, objectiveId);
      setStatus(newStatus);
    }
    setIsEditingStatus(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="py-4 first:pt-0 last:pb-0 group/task">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-colors duration-200 group-hover/task:bg-gray-200">
          <CheckSquare className="h-4 w-4 text-gray-400 transition-colors duration-200 group-hover/task:text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-1 flex-1">
                <Input
                  ref={titleInputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleKeyDown}
                  className="text-sm py-1 h-8"
                />
                <button
                  onClick={handleTitleSubmit}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <Check className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <p
                className="text-sm text-gray-900 leading-relaxed transition-colors duration-200 group-hover/task:text-gray-800 flex-1"
                onClick={() => setIsEditingTitle(true)}
              >
                {task.title}
                <button className="ml-2 opacity-0 group-hover/task:opacity-100 transition-opacity">
                  <Edit className="h-3 w-3 text-gray-400" />
                </button>
              </p>
            )}
            
            {isEditingStatus ? (
              <Select
                value={status}
                onValueChange={(value: TaskStatus) => handleStatusChange(value)}
                onOpenChange={(open: boolean) => {
                  if (!open) setIsEditingStatus(false);
                }}
              >
                <SelectTrigger className="h-7 w-24">
                  <SelectValue placeholder={status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">todo</SelectItem>
                  <SelectItem value="doing">doing</SelectItem>
                  <SelectItem value="done">done</SelectItem>
                  <SelectItem value="cancelled">cancelled</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge 
                className={`${getStatusColor(task.status)} cursor-pointer`}
                onClick={() => setIsEditingStatus(true)}
              >
                {task.status}
              </Badge>
            )}
          </div>
          <div className="relative h-4">
            <p className="absolute inset-0 text-xs text-gray-400 transition-colors duration-200 group-hover/task:text-gray-500">
              <span className="group-hover/task:hidden">
                {formatRelativeTime(task.createdAt)}
              </span>
            </p>
            <p className="absolute inset-0 text-xs text-gray-400 opacity-0 group-hover/task:opacity-100 transition-opacity duration-200">
              {formatDateTime(task.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
