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
          <Button variant="secondary" size="sm">
            Add Key Result
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Add Key Result to &#34;{objectiveTitle}&#34;
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Key Result</Label>
              <Input
                id="title"
                placeholder="Enter key result title"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Key Result'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
