"use client";

/**
 * Generate page - Text-to-LEGO model generation with progress storytelling.
 * FR1: Users can generate a Lego model from a text prompt.
 * FR2.5: First-Build Guarantee - simpler models for first-time users.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PromptInput, GenerationProgress, GenerationResult, GenerationErrorBoundary, ModeToggle, ImageUpload } from "@/components/generate";
import { FirstBuildBadge } from "@/components/generate/first-build-badge";
import { AdvancedModeToggle } from "@/components/generate/advanced-mode-toggle";
import { ModificationModal } from "@/components/generate/modification-modal";
import { Button } from "@/components/ui/button";
import { useGenerationStore, type GenerationStage } from "@/lib/stores/useGenerationStore";
import { generateLegoModel } from "@/lib/api";
import { db } from "@/lib/db";
import { hashImagesWithPrompt } from "@/lib/utils/image-hash";
import { useFirstBuild } from "@/lib/hooks/use-first-build";
import { ArrowLeft, RefreshCw } from "lucide-react";

/**
 * Generation timeout in milliseconds.
 * Set to 300s (5 minutes) as backend CAD generation can take 60-90+ seconds for complex models.
 */
const GENERATION_TIMEOUT_MS = 300000;

/**
 * Stage progression delays for storytelling UI.
 * Stages advance based on elapsed time during generation.
 */
const STAGE_THRESHOLDS: Record<GenerationStage, number> = {
  idle: 0,
  imagining: 0, // Starts immediately
  finding: 5000, // After 5 seconds
  building: 15000, // After 15 seconds
  completed: 0,
  failed: 0,
};

export default function GeneratePage(): React.JSX.Element {
  const router = useRouter();
  const {
    status,
    stage,
    mode,
    prompt,
    images,
    model,
    error,
    setMode,
    startGeneration,
    setStage,
    setTaskId,
    completeGeneration,
    failGeneration,
    reset,
    incrementRetry,
  } = useGenerationStore();

  // First-Build Guarantee state (AC #1, #5)
  const { isFirstBuild, isLoading: isFirstBuildLoading } = useFirstBuild();
  const [advancedModeEnabled, setAdvancedModeEnabled] = useState(false);

  // Modification modal state
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);

  // Reset advanced mode toggle when starting fresh
  useEffect(() => {
    if (status === "idle") {
      setAdvancedModeEnabled(false);
    }
  }, [status]);

  const stageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * Updates stage based on elapsed time for storytelling effect.
   */
  const updateStageFromElapsedTime = useCallback((): void => {
    const { startTime, stage: currentStage } = useGenerationStore.getState();
    if (!startTime || currentStage === "completed" || currentStage === "failed") {
      return;
    }

    const elapsed = Date.now() - startTime;

    // Progress through stages based on elapsed time
    if (elapsed >= STAGE_THRESHOLDS.building && currentStage !== "building") {
      setStage("building");
    } else if (elapsed >= STAGE_THRESHOLDS.finding && currentStage === "imagining") {
      setStage("finding");
    }
  }, [setStage]);

  // Auto-advance stages during generation based on elapsed time
  useEffect(() => {
    if (status === "generating" && stage !== "completed" && stage !== "failed") {
      // Update stages every 500ms based on elapsed time
      stageIntervalRef.current = setInterval(updateStageFromElapsedTime, 500);
      return () => {
        if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
      };
    }
    return undefined;
  }, [status, stage, updateStageFromElapsedTime]);

  /**
   * Looks up a cached model by prompt.
   * Returns null if not found or expired.
   */
  const lookupCache = useCallback(async (promptText: string): Promise<string | null> => {
    try {
      const cached = await db.generationCache
        .where("prompt")
        .equals(promptText)
        .first();

      if (cached && cached.expiresAt > new Date()) {
        return cached.modelData;
      }

      // Clean up expired entry if found
      if (cached) {
        await db.generationCache.delete(cached.id!);
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Caches the generated model in IndexedDB.
   */
  const cacheModel = useCallback(async (promptText: string, modelData: string): Promise<void> => {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await db.generationCache.add({
        prompt: promptText,
        modelData,
        createdAt: now,
        expiresAt,
      });
    } catch (err) {
      // Log but don't fail generation if cache write fails
      console.warn("Failed to cache model:", err);
    }
  }, []);

  /**
   * Handles the generation process with timeout and cache lookup.
   * Supports both text and image generation modes.
   * @param bypassCache - If true, skip cache lookup and force new generation (used for retries)
   */
  const handleGenerate = useCallback(
    async (promptText: string, imageFiles: File[] = [], bypassCache = false): Promise<void> => {
      // Determine cache key based on mode
      let cacheKey: string;
      if (mode === "image" && imageFiles.length > 0) {
        // Generate hash from images + prompt for image mode
        cacheKey = await hashImagesWithPrompt(imageFiles, promptText);
      } else {
        // Use prompt directly for text mode
        cacheKey = promptText;
      }

      // Check cache first (unless bypassed for retry)
      if (!bypassCache) {
        const cachedData = await lookupCache(cacheKey);
        if (cachedData) {
          try {
            const cachedModel = JSON.parse(cachedData);
            startGeneration(promptText, imageFiles);
            // Quick progression for cached results
            setTimeout(() => setStage("finding"), 500);
            setTimeout(() => setStage("building"), 1000);
            setTimeout(() => {
              setTaskId(cachedModel.taskId);
              completeGeneration(cachedModel);
            }, 1500);
            return;
          } catch {
            // Invalid cache, continue with generation
          }
        }
      }

      // Start generation UI
      startGeneration(promptText, imageFiles);

      // Set up timeout (NFR1: <60 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error("Generation timed out. Please try again."));
        }, GENERATION_TIMEOUT_MS);
      });

      try {
        // Determine complexity based on First-Build Guarantee (AC #2)
        // Use 'simple' for first-time users unless they override with Advanced Mode
        const shouldUseSimpleMode = isFirstBuild && !advancedModeEnabled;
        const complexity = shouldUseSimpleMode ? "simple" : "normal";

        // Race between generation and timeout
        const result = await Promise.race([
          generateLegoModel(mode, promptText, imageFiles, [], {
            complexity,
          }),
          timeoutPromise,
        ]);

        // Clear timeout on success
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Set task ID for tracking
        setTaskId(result.taskId);

        // Complete generation
        completeGeneration(result);

        // Cache the result using the appropriate cache key (even for retries, cache the new result)
        await cacheModel(cacheKey, JSON.stringify(result));
      } catch (err) {
        // Clear timeout on error
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate model";
        failGeneration(errorMessage);
      }
    },
    [mode, startGeneration, setStage, setTaskId, completeGeneration, failGeneration, cacheModel, lookupCache, isFirstBuild, advancedModeEnabled]
  );

  /**
   * Handles regeneration with retry tracking.
   * Bypasses cache to force a new generation attempt.
   */
  const handleRegenerate = useCallback((): void => {
    if (incrementRetry() && prompt) {
      handleGenerate(prompt, images, true); // bypassCache=true to force new generation
    }
  }, [incrementRetry, prompt, images, handleGenerate]);

  /**
   * Handles mode change - resets state when switching modes.
   */
  const handleModeChange = useCallback((newMode: "text" | "image"): void => {
    if (newMode !== mode && status === "idle") {
      setMode(newMode);
    }
  }, [mode, status, setMode]);

  /**
   * Handles starting the build process.
   */
  const handleStartBuilding = useCallback((): void => {
    // Navigate to build page (to be implemented in Epic 4)
    router.push(`/build/${model?.taskId || "new"}`);
  }, [router, model]);

  /**
   * Handles model modification.
   * Opens modal to collect modification prompt, then regenerates with modifications.
   */
  const handleModify = useCallback((): void => {
    if (model) {
      setIsModifyModalOpen(true);
    }
  }, [model]);

  /**
   * Handles modification submission.
   * For now, appends modification as a new prompt.
   * TODO: Implement proper modification API call in backend
   */
  const handleModificationSubmit = useCallback(async (modificationPrompt: string): Promise<void> => {
    if (!prompt) return;

    // Create combined prompt: original + modification
    const combinedPrompt = `${prompt}\n\nModification: ${modificationPrompt}`;

    // Regenerate with the modified prompt
    handleGenerate(combinedPrompt, images, true); // bypass cache for modifications
  }, [prompt, images, handleGenerate]);

  /**
   * Handles starting fresh (reset).
   */
  const handleStartFresh = useCallback((): void => {
    reset();
  }, [reset]);

  const isGenerating = status === "generating";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  return (
    <GenerationErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              aria-label="Go back to home page"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
            <h1 className="font-heading font-semibold">Create Design</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartFresh}
              disabled={status === "idle"}
              aria-label="Start a new design"
            >
              <RefreshCw className="size-4 mr-2" />
              New
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Title and description */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-heading font-bold">
                What do you want to build?
              </h2>
              <p className="text-muted-foreground">
                {mode === "text"
                  ? "Describe your idea and our AI will create a buildable LEGO model"
                  : "Upload images and our AI will create a buildable LEGO model"}
              </p>
            </div>

            {/* Mode Toggle - visible when idle or failed */}
            <AnimatePresence mode="wait">
              {(status === "idle" || isFailed) && (
                <motion.div
                  key="mode-toggle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center"
                >
                  <ModeToggle
                    mode={mode}
                    onModeChange={handleModeChange}
                    disabled={isGenerating}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* First-Build Mode controls - visible when idle or failed (AC #4, #5) */}
            <AnimatePresence mode="wait">
              {(status === "idle" || isFailed) && !isFirstBuildLoading && (
                <motion.div
                  key="first-build-controls"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="flex items-center justify-center gap-4"
                >
                  {/* First-Build Badge - only show when in first-build mode and not overridden */}
                  {isFirstBuild && !advancedModeEnabled && (
                    <FirstBuildBadge />
                  )}
                  {/* Advanced Mode Toggle - only show for first-time users */}
                  {isFirstBuild && (
                    <AdvancedModeToggle
                      enabled={advancedModeEnabled}
                      onChange={setAdvancedModeEnabled}
                      isFirstBuild={isFirstBuild}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input section - visible when idle or failed */}
            <AnimatePresence mode="wait">
              {(status === "idle" || isFailed) && mode === "text" && (
                <motion.div
                  key="text-input"
                  id="text-input-panel"
                  role="tabpanel"
                  aria-labelledby="text-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PromptInput
                    onSubmit={(prompt) => handleGenerate(prompt, [])}
                    disabled={isGenerating}
                    placeholder="e.g., a small red dragon, a simple house..."
                  />
                </motion.div>
              )}
              {(status === "idle" || isFailed) && mode === "image" && (
                <motion.div
                  key="image-input"
                  id="image-input-panel"
                  role="tabpanel"
                  aria-labelledby="image-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImageUpload
                    onSubmit={handleGenerate}
                    disabled={isGenerating}
                    placeholder="Add a description for your images (optional)..."
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress section - visible when generating */}
            <AnimatePresence mode="wait">
              {isGenerating && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="py-12"
                >
                  <GenerationProgress />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result section - visible when completed */}
            <AnimatePresence mode="wait">
              {isCompleted && model && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GenerationResult
                    onRegenerate={handleRegenerate}
                    onStartBuilding={handleStartBuilding}
                    onModify={handleModify}
                    onStartFresh={handleStartFresh}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error retry section - visible when failed */}
            <AnimatePresence mode="wait">
              {isFailed && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-4"
                >
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-destructive font-medium">
                      {error || "Something went wrong"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try rephrasing your prompt or check your connection
                    </p>
                  </div>
                  <Button onClick={handleRegenerate} variant="outline">
                    <RefreshCw className="size-4 mr-2" />
                    Try Again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Modification Modal */}
      <ModificationModal
        open={isModifyModalOpen}
        onOpenChange={setIsModifyModalOpen}
        onSubmit={handleModificationSubmit}
        originalPrompt={prompt}
      />
    </GenerationErrorBoundary>
  );
}
