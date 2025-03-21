'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateObjectiveRequest } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ObjectiveFormModalProps {
  onSubmit: (data: CreateObjectiveRequest) => void;
  isSubmitting?: boolean;
  trigger?: React.ReactNode;
}

export function ObjectiveFormModal({
  onSubmit,
  isSubmitting = false,
  trigger,
}: ObjectiveFormModalProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateObjectiveRequest>();

  const handleFormSubmit = (data: CreateObjectiveRequest) => {
    onSubmit(data);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-gray-900/90 hover:bg-gray-900 text-sm font-medium px-3 h-8 rounded-md transition-all duration-200 hover:scale-105">New Objective</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-base font-medium text-gray-900">Create New Objective</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 px-6 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="title" className="text-xs font-medium text-gray-700">Title</Label>
              <Input
                id="title"
                placeholder="Enter objective title"
                className="h-8 text-sm border-gray-200 focus:border-gray-300 focus:ring-gray-300"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description" className="text-xs font-medium text-gray-700">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter objective description"
                className="resize-none h-24 text-sm border-gray-200 focus:border-gray-300 focus:ring-gray-300"
                {...register('description')}
              />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gray-900/90 hover:bg-gray-900 text-sm font-medium px-3 h-8 rounded-md transition-all duration-200 hover:scale-105"
            >
              {isSubmitting ? 'Creating...' : 'Create Objective'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
