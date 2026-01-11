"use client";

/**
 * Progress storytelling UI component for LEGO model generation.
 * Displays animated progress stages: "Imagining..." → "Finding..." → "Building..."
 */

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  useGenerationStore,
  getStageMessages,
  STAGE_PROGRESS,
  type GenerationStage,
} from "@/lib/stores/useGenerationStore";
import { Loader2, Lightbulb, Search, Hammer, CheckCircle2, XCircle } from "lucide-react";

/**
 * Icons for each generation stage.
 */
const STAGE_ICONS: Record<GenerationStage, React.ReactNode> = {
  idle: null,
  imagining: <Lightbulb className="size-8 text-accent" />,
  finding: <Search className="size-8 text-primary" />,
  building: <Hammer className="size-8 text-primary" />,
  completed: <CheckCircle2 className="size-8 text-green-500" />,
  failed: <XCircle className="size-8 text-destructive" />,
};

interface GenerationProgressProps {
  onStageChange?: (stage: GenerationStage) => void;
}

export function GenerationProgress({
  onStageChange,
}: GenerationProgressProps): React.JSX.Element {
  const { stage, mode, elapsedTime, updateElapsedTime, error } = useGenerationStore();
  const stageMessages = getStageMessages(mode);

  // Update elapsed time every second
  useEffect(() => {
    if (stage !== "idle" && stage !== "completed" && stage !== "failed") {
      const interval = setInterval(updateElapsedTime, 1000);
      return (): void => {
        clearInterval(interval);
      };
    }
    return undefined;
  }, [stage, updateElapsedTime]);

  // Notify parent of stage changes
  useEffect(() => {
    onStageChange?.(stage);
  }, [stage, onStageChange]);

  const progress = STAGE_PROGRESS[stage];
  const message = stageMessages[stage];
  const icon = STAGE_ICONS[stage];

  // Format elapsed time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (stage === "idle") {
    return <></>;
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Animated icon */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center"
        >
          <div className="relative">
            {icon}
            {stage !== "completed" && stage !== "failed" && (
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="size-8 text-primary/30" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="text-center text-lg font-medium font-heading"
        >
          {message}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{progress}%</span>
          <span className="font-mono">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Error message */}
      {stage === "failed" && error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
        >
          <p className="text-sm text-destructive text-center">{error}</p>
        </motion.div>
      )}

      {/* Stage indicators */}
      <div className="flex justify-center gap-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        {(["imagining", "finding", "building", "completed"] as GenerationStage[]).map(
          (s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                STAGE_PROGRESS[s] <= progress
                  ? "bg-primary"
                  : "bg-muted"
              }`}
              aria-hidden="true"
            />
          )
        )}
      </div>
    </div>
  );
}
