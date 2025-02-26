"use client";

import {useState} from "react";
import {useForm} from "react-hook-form";
import {CreateKeyResultRequest} from "@/types";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

interface KeyResultFormModalProps {
  objectiveId: string;
  objectiveTitle: string;
  onSubmit: (data: CreateKeyResultRequest) => void;
  isSubmitting?: boolean;
  trigger?: React.ReactNode;
}

export function KeyResultFormModal({
                                     objectiveTitle,
                                     onSubmit,
                                     isSubmitting = false,
                                     trigger,
                                   }: KeyResultFormModalProps) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateKeyResultRequest>();

  const handleFormSubmit = (data: CreateKeyResultRequest) => {
    onSubmit({
      ...data,
      target: parseFloat(data.target.toString())
    });
    setOpen(false);
    reset();
  };

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="secondary" size="sm">Add Key Result</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Key Result to &#34;{objectiveTitle}&#34;</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    placeholder="Enter key result title"
                    {...register("title", { required: "Title is required" })}
                />
                {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target">Target Value</Label>
                <Input
                    id="target"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter target value (e.g., 100)"
                    {...register("target", {
                      required: "Target is required",
                      valueAsNumber: true,
                      min: { value: 1, message: "Target must be greater than 0" }
                    })}
                />
                {errors.target && (
                    <p className="text-xs text-red-500">{errors.target.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Key Result"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}
