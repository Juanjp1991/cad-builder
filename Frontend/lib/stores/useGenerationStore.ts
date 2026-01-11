/**
 * Zustand store for managing LEGO model generation state.
 * Tracks generation status, progress stages, and generated model data.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GeneratedModel } from "@/lib/types";

/**
 * Generation mode type - text or image.
 */
export type GenerationMode = "text" | "image";

/**
 * Progress stages for generation storytelling UI.
 */
export type GenerationStage =
  | "idle"
  | "imagining"
  | "finding"
  | "building"
  | "completed"
  | "failed";

/**
 * Generation status for tracking overall state.
 */
export type GenerationStatus = "idle" | "generating" | "completed" | "failed";

/**
 * Generation store state interface.
 */
interface GenerationState {
  // Current status
  status: GenerationStatus;
  stage: GenerationStage;
  mode: GenerationMode;

  // Current generation
  prompt: string;
  images: File[];
  taskId: string | null;
  startTime: number | null;
  elapsedTime: number;

  // Generated model data
  model: GeneratedModel | null;

  // Error handling
  error: string | null;

  // Retry tracking
  retryCount: number;
  maxRetries: number;

  // Actions
  setMode: (mode: GenerationMode) => void;
  startGeneration: (prompt: string, images?: File[]) => void;
  setStage: (stage: GenerationStage) => void;
  setTaskId: (taskId: string) => void;
  updateElapsedTime: () => void;
  completeGeneration: (model: GeneratedModel) => void;
  failGeneration: (error: string) => void;
  reset: () => void;
  incrementRetry: () => boolean; // Returns true if retry is allowed
}

/**
 * Stage display messages for progress storytelling (text mode).
 */
export const STAGE_MESSAGES_TEXT: Record<GenerationStage, string> = {
  idle: "",
  imagining: "Imagining your creation...",
  finding: "Finding the perfect design...",
  building: "Building your model...",
  completed: "Done!",
  failed: "Generation failed",
};

/**
 * Stage display messages for progress storytelling (image mode).
 */
export const STAGE_MESSAGES_IMAGE: Record<GenerationStage, string> = {
  idle: "",
  imagining: "Analyzing your images...",
  finding: "Designing from multiple angles...",
  building: "Building your model...",
  completed: "Done!",
  failed: "Generation failed",
};

/**
 * Returns stage messages based on generation mode.
 */
export function getStageMessages(mode: GenerationMode): Record<GenerationStage, string> {
  return mode === "image" ? STAGE_MESSAGES_IMAGE : STAGE_MESSAGES_TEXT;
}

/**
 * Stage display messages for progress storytelling.
 * @deprecated Use getStageMessages(mode) instead for mode-aware messages.
 */
export const STAGE_MESSAGES: Record<GenerationStage, string> = STAGE_MESSAGES_TEXT;

/**
 * Stage progress percentages for progress bar.
 */
export const STAGE_PROGRESS: Record<GenerationStage, number> = {
  idle: 0,
  imagining: 15,
  finding: 45,
  building: 75,
  completed: 100,
  failed: 0,
};

const initialState = {
  status: "idle" as GenerationStatus,
  stage: "idle" as GenerationStage,
  mode: "text" as GenerationMode,
  prompt: "",
  images: [] as File[],
  taskId: null,
  startTime: null,
  elapsedTime: 0,
  model: null,
  error: null,
  retryCount: 0,
  maxRetries: 3,
};

/**
 * Zustand store for generation state management.
 * Uses persist middleware to save state across sessions.
 */
export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setMode: (mode: GenerationMode): void => {
        set({ mode });
      },

      startGeneration: (prompt: string, images: File[] = []): void => {
        const { prompt: currentPrompt, images: currentImages } = get();
        // Reset retry count if this is a NEW prompt or images changed (not a retry)
        const isNewPrompt = prompt !== currentPrompt || images.length !== currentImages.length;

        set({
          status: "generating",
          stage: "imagining",
          prompt,
          images,
          taskId: null,
          startTime: Date.now(),
          elapsedTime: 0,
          model: null,
          error: null,
          retryCount: isNewPrompt ? 0 : get().retryCount,
        });
      },

      setStage: (stage: GenerationStage): void => {
        set({ stage });
      },

      setTaskId: (taskId: string): void => {
        set({ taskId });
      },

      updateElapsedTime: (): void => {
        const { startTime } = get();
        if (startTime) {
          set({ elapsedTime: Math.floor((Date.now() - startTime) / 1000) });
        }
      },

      completeGeneration: (model: GeneratedModel): void => {
        set({
          status: "completed",
          stage: "completed",
          model,
          error: null,
        });
      },

      failGeneration: (error: string): void => {
        set({
          status: "failed",
          stage: "failed",
          error,
        });
      },

      reset: (): void => {
        set({
          ...initialState,
          mode: get().mode, // Preserve mode on reset
          retryCount: 0,
        });
      },

      incrementRetry: (): boolean => {
        const { retryCount, maxRetries } = get();
        if (retryCount < maxRetries) {
          set({ retryCount: retryCount + 1 });
          return true;
        }
        return false;
      },
    }),
    {
      name: "lego-generation-store",
      // Only persist certain fields (not File objects)
      partialize: (state) => ({
        model: state.model,
        prompt: state.prompt,
        mode: state.mode,
      }),
    }
  )
);
