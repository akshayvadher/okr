'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateKeyResultRequest } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useKeyResults from '@/hooks/useKeyResults';

interface KeyResultFormModalProps {
  objectiveId: string;
  objectiveTitle: string;
  isSubmitting?: boolean;
  trigger?: React.ReactNode;
}

export function KeyResultFormModal({
  objectiveId,
  objectiveTitle,
  isSubmitting = false,
  trigger,
}: KeyResultFormModalProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateKeyResultRequest>({
    defaultValues: {
      metrics: '%',
    },
  });

  const { createKeyResult } = useKeyResults();

  const handleFormSubmit = (data: CreateKeyResultRequest) => {
    createKeyResult(objectiveId, data);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gray-900/90 hover:bg-gray-900 text-sm font-medium px-3 h-8 rounded-md transition-colors">Add Key Result</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-base font-medium text-gray-900">
            Add Key Result to &#34;{objectiveTitle}&#34;
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 px-6 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="title" className="text-xs font-medium text-gray-700">Key Result</Label>
              <Input
                id="title"
                placeholder="Enter key result title"
                className="h-8 text-sm border-gray-200 focus:border-gray-300 focus:ring-gray-300"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gray-900/90 hover:bg-gray-900 text-sm font-medium px-3 h-8 rounded-md transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Key Result'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
