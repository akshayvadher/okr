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
import {useObjective} from "@/hooks/use-objectives";

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
    formState: {errors},
    reset
  } = useForm<CreateKeyResultRequest>({
    defaultValues: {
      metrics: '%'
    }
  });

  const {createKeyResult} = useObjective(objectiveId)

  const handleFormSubmit = (data: CreateKeyResultRequest) => {
    createKeyResult(parseInput(data.title));
    setOpen(false);
    reset();
  };

  function parseInput(input: string) {
    const parts = input.split(' ');
    const numberIndex = parts.findIndex(part => !isNaN(Number(part)));

    if (numberIndex === -1 || numberIndex === 0 || numberIndex === parts.length - 1) {
      throw new Error("Invalid input format");
    }

    return {
      title: parts.slice(0, numberIndex).join(' '),
      target: parseInt(parts[numberIndex], 10),
      metrics: parts.slice(numberIndex + 1).join(' ')
    };
  }

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ||
              <Button variant="secondary" size="sm">Add Key Result</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Key Result
              to &#34;{objectiveTitle}&#34;</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Key Result</Label>
                <Input
                    id="title"
                    placeholder="Enter key result title"
                    {...register("title", {required: "Title is required"})}
                />
                {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                )}
              </div>
              {/*<div className="grid grid-cols-3 gap-4">*/}
              {/*  <div className="col-span-2 grid gap-2">*/}
              {/*    <Label htmlFor="target">Target Value</Label>*/}
              {/*    <Input*/}
              {/*        id="target"*/}
              {/*        type="number"*/}
              {/*        min="0"*/}
              {/*        step="1"*/}
              {/*        placeholder="Enter target value (e.g., 100)"*/}
              {/*        {...register("target", {*/}
              {/*          required: "Target is required",*/}
              {/*          valueAsNumber: true,*/}
              {/*          min: {*/}
              {/*            value: 1,*/}
              {/*            message: "Target must be greater than 0"*/}
              {/*          }*/}
              {/*        })}*/}
              {/*    />*/}
              {/*    {errors.target && (*/}
              {/*        <p className="text-xs text-red-500">{errors.target.message}</p>*/}
              {/*    )}*/}
              {/*  </div>*/}
              {/*  <div className="grid gap-2">*/}
              {/*    <Label htmlFor="metrics">Metrics</Label>*/}
              {/*    <Input*/}
              {/*        id="metrics"*/}
              {/*        placeholder="e.g., %, $, users"*/}
              {/*        {...register("metrics")}*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*</div>*/}
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary"
                      onClick={() => setOpen(false)}>
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
