"use client";

import {useState} from "react";
import {KeyResult, UpdateProgressRequest} from "@/types";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Progress} from "@/components/ui/progress";
import {Minus, Plus} from "lucide-react";

interface KeyResultProgressUpdateProps {
  keyResult: KeyResult;
  onUpdate: (keyResultId: string, data: UpdateProgressRequest) => void;
  isUpdating?: boolean;
}

export function KeyResultProgressUpdate({
                                          keyResult,
                                          onUpdate,
                                          isUpdating = false,
                                        }: KeyResultProgressUpdateProps) {
  const [progress, setProgress] = useState<number>(keyResult.current);

  const handleIncrement = () => {
    const newValue = Math.min(keyResult.target, progress + 1);
    setProgress(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(0, progress - 1);
    setProgress(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      const newValue = Math.max(0, Math.min(keyResult.target, value));
      setProgress(newValue);
    }
  };

  const handleUpdate = () => {
    if (progress !== keyResult.current) {
      onUpdate(keyResult.id, {progress});
    }
  };

  const progressPercentage = (progress / keyResult.target) * 100;

  return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{keyResult.title}</span>
          <div className="text-xs">
            Target: {keyResult.target}
          </div>
        </div>

        <div className="mb-3">
          <Progress value={progressPercentage} className="h-2"/>
        </div>

        <div className="flex items-center gap-2">
          <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full h-8 w-8 p-0"
              onClick={handleDecrement}
          >
            <Minus className="h-4 w-4"/>
          </Button>

          <Input
              type="number"
              min={0}
              max={keyResult.target}
              value={progress}
              onChange={handleInputChange}
              className="h-8 text-center"
          />

          <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full h-8 w-8 p-0"
              onClick={handleIncrement}
          >
            <Plus className="h-4 w-4"/>
          </Button>

          <Button
              type="button"
              size="sm"
              variant="secondary"
              className="ml-2"
              disabled={progress === keyResult.current || isUpdating}
              onClick={handleUpdate}
          >
            {isUpdating ? "Updating..." : "Save"}
          </Button>
        </div>
      </div>
  );
}
