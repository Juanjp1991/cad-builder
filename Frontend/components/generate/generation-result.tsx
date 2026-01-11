"use client";

/**
 * Generation result component for displaying completed LEGO models.
 * Shows 3D viewer placeholder, model metadata, structural feedback, and action buttons.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGenerationStore } from "@/lib/stores/useGenerationStore";
import { RetryIndicator } from "./retry-indicator";
import { StructuralFeedbackBadge } from "./structural-feedback-badge";
import { StructuralFeedbackModal } from "./structural-feedback-modal";
import { VersionHistory } from "./version-history";
import { ModelViewer } from "@/components/viewer/model-viewer";
import {
  RotateCcw,
  Play,
  Pencil,
  Download,
  ExternalLink,
  Blocks,
  RefreshCw,
} from "lucide-react";

interface GenerationResultProps {
  onRegenerate: () => void;
  onStartBuilding: () => void;
  onModify: () => void;
  onStartFresh: () => void;
}

export function GenerationResult({
  onRegenerate,
  onStartBuilding,
  onModify,
  onStartFresh,
}: GenerationResultProps): React.JSX.Element {
  const { model, prompt, retryCount, maxRetries } = useGenerationStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModelUrl, setCurrentModelUrl] = useState<string | null>(null);

  if (!model) {
    return <></>;
  }

  const remainingRetries = maxRetries - retryCount;
  const hasStructuralFeedback = !!model.structuralAnalysis;

  // Use version-based URL if available, otherwise fall back to model URL
  const displayModelUrl = currentModelUrl || model.modelUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-heading">Your LEGO Model</CardTitle>
              <RetryIndicator retryCount={retryCount} maxRetries={maxRetries} />
            </div>
            <div className="flex items-center gap-2">
              {hasStructuralFeedback && (
                <StructuralFeedbackBadge
                  analysis={model.structuralAnalysis!}
                  onClick={() => setIsModalOpen(true)}
                />
              )}
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            &ldquo;{prompt}&rdquo;
          </span>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 3D Model Viewer */}
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <ModelViewer modelUrl={displayModelUrl} />
          </div>

          {/* Version History - shows navigation between versions */}
          <VersionHistory
            taskId={model.taskId}
            onVersionChange={setCurrentModelUrl}
          />

          {/* Model Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Estimated Bricks</p>
              <p className="text-2xl font-bold font-mono">
                {model.brickCount ?? "—"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Task ID</p>
              <p className="text-sm font-mono truncate" title={model.taskId}>{model.taskId}</p>
            </div>
          </div>

          {/* Download Link - opens in same tab to trigger download */}

          <Button variant="outline" className="w-full" asChild>
            <a
              href={model.modelUrl}
              download="lego-model.stl"
              rel="noopener noreferrer"
              aria-label="Download STL file for your LEGO model"
            >
              <Download className="size-4 mr-2" />
              Download STL File
            </a>
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-4 border-t">
          {/* Primary Action */}
          <Button
            onClick={onStartBuilding}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            size="lg"
            aria-label="Start building your LEGO model with step-by-step instructions"
          >
            <Play className="size-5 mr-2" />
            Start Building
          </Button>

          {/* Secondary Actions */}
          <div className="flex gap-2 w-full">
            {remainingRetries > 0 ? (
              <Button
                onClick={onRegenerate}
                variant="outline"
                className="flex-1"
                aria-label={`Regenerate model, ${remainingRetries} retries remaining`}
              >
                <RotateCcw className="size-4 mr-2" />
                Regenerate ({remainingRetries} left)
              </Button>
            ) : (
              <Button
                onClick={onStartFresh}
                variant="default"
                className="flex-1"
                aria-label="Start fresh with a new design"
              >
                <RefreshCw className="size-4 mr-2" />
                Start Fresh
              </Button>
            )}
            <Button
              onClick={onModify}
              variant="outline"
              className="flex-1"
              aria-label="Modify your LEGO model design"
            >
              <Pencil className="size-4 mr-2" />
              Modify
            </Button>
          </div>

          {/* Retry info */}
          {remainingRetries <= 0 && (
            <p className="text-xs text-muted-foreground text-center">
              You&apos;ve used all 3 free retries. Start fresh to create a new design.
            </p>
          )}
        </CardFooter>
      </Card>

      {/* Structural Feedback Modal */}
      {hasStructuralFeedback && (
        <StructuralFeedbackModal
          analysis={model.structuralAnalysis!}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </motion.div>
  );
}
