"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { KeyResult, UpdateProgressRequest } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface ProgressUpdateModalProps {
  keyResult: KeyResult;
  onSubmit: (keyResultId: string, data: UpdateProgressRequest) => void;
  isSubmitting?: boolean;
}

export function ProgressUpdateModal({
                                      keyResult,
                                      onSubmit,
                                      isSubmitting = false,
                                    }: ProgressUpdateModalProps) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<UpdateProgressRequest>({
    defaultValues: {
      progress: keyResult.current
    }
  });

  const watchProgress = watch("progress", keyResult.current);
  const progressPercentage = (watchProgress / keyResult.target) * 100;

  const handleFormSubmit = (data: UpdateProgressRequest) => {
    onSubmit(keyResult.id, data);
    setOpen(false);
  };

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
              variant="ghost"
              className="h-8 w-full justify-start px-2 text-left font-normal"
          >
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{keyResult.title}</span>
                <span className="text-xs text-gray-500">
                {keyResult.current} / {keyResult.target} {keyResult.metrics || '%'}
              </span>
              </div>
              <Progress value={(keyResult.current / keyResult.target) * 100} className="h-2" />
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="font-medium">{keyResult.title}</h3>
                <p className="text-sm text-gray-500">Target: {keyResult.target} {keyResult.metrics || '%'}</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="progress">Current Progress</Label>
                <Input
                    id="progress"
                    type="number"
                    min="0"
                    max={keyResult.target}
                    step="1"
                    {...register("progress", {
                      required: "Progress is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Progress cannot be negative" },
                      max: { value: keyResult.target, message: `Progress cannot exceed target (${keyResult.target})` }
                    })}
                />
                {errors.progress && (
                    <p className="text-xs text-red-500">{errors.progress.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">
                  {Math.round(progressPercentage)}%
                </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Progress"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}
