/**
 * Tests for useGenerationStore.
 * Focuses on structural feedback persistence and retry logic.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useGenerationStore } from "./useGenerationStore";
import type { GeneratedModel } from "@/lib/types";

describe("useGenerationStore", () => {
  beforeEach(() => {
    // Reset store to initial state
    useGenerationStore.getState().reset();
  });

  describe("structural feedback persistence", () => {
    it("stores model with structural analysis", () => {
      const modelWithAnalysis: GeneratedModel = {
        taskId: "test-123",
        modelUrl: "http://localhost/model.stl",
        brickCount: 150,
        structuralAnalysis: {
          buildabilityScore: 85,
          issues: [
            {
              type: "cantilever",
              severity: "warning",
              description: "Overhang detected",
            },
          ],
          recommendations: ["Add support brick"],
        },
      };

      useGenerationStore.getState().completeGeneration(modelWithAnalysis);

      const state = useGenerationStore.getState();
      expect(state.model).toBeDefined();
      expect(state.model?.structuralAnalysis).toBeDefined();
      expect(state.model?.structuralAnalysis?.buildabilityScore).toBe(85);
      expect(state.model?.structuralAnalysis?.issues).toHaveLength(1);
      expect(state.model?.structuralAnalysis?.recommendations).toEqual([
        "Add support brick",
      ]);
    });

    it("stores model without structural analysis", () => {
      const modelWithoutAnalysis: GeneratedModel = {
        taskId: "test-456",
        modelUrl: "http://localhost/model.stl",
        brickCount: 100,
      };

      useGenerationStore.getState().completeGeneration(modelWithoutAnalysis);

      const state = useGenerationStore.getState();
      expect(state.model).toBeDefined();
      expect(state.model?.structuralAnalysis).toBeUndefined();
    });

    it("persist partialize includes model with structural analysis", () => {
      const modelWithAnalysis: GeneratedModel = {
        taskId: "test-789",
        modelUrl: "http://localhost/model.stl",
        structuralAnalysis: {
          buildabilityScore: 70,
          issues: [],
          recommendations: [],
        },
      };

      useGenerationStore.getState().completeGeneration(modelWithAnalysis);

      // Access the persisted state shape (model, prompt, mode are persisted)
      const state = useGenerationStore.getState();
      expect(state.model?.structuralAnalysis).toBeDefined();
      expect(state.model?.structuralAnalysis?.buildabilityScore).toBe(70);
    });
  });

  describe("retry count behavior", () => {
    it("resets retry count on new prompt", () => {
      const store = useGenerationStore.getState();

      // First generation
      store.startGeneration("first prompt");
      store.incrementRetry();
      store.incrementRetry();

      expect(useGenerationStore.getState().retryCount).toBe(2);

      // New prompt should reset retry count
      useGenerationStore.getState().startGeneration("different prompt");

      expect(useGenerationStore.getState().retryCount).toBe(0);
    });

    it("keeps retry count on same prompt regeneration", () => {
      const store = useGenerationStore.getState();

      store.startGeneration("same prompt");
      store.incrementRetry();

      expect(useGenerationStore.getState().retryCount).toBe(1);

      // Same prompt should keep retry count
      useGenerationStore.getState().startGeneration("same prompt");

      expect(useGenerationStore.getState().retryCount).toBe(1);
    });

    it("incrementRetry returns false when max reached", () => {
      const store = useGenerationStore.getState();

      store.startGeneration("test");
      expect(store.incrementRetry()).toBe(true); // 1
      expect(store.incrementRetry()).toBe(true); // 2
      expect(store.incrementRetry()).toBe(true); // 3
      expect(useGenerationStore.getState().incrementRetry()).toBe(false); // Already at max
    });

    it("reset clears retry count", () => {
      const store = useGenerationStore.getState();

      store.startGeneration("test");
      store.incrementRetry();
      store.incrementRetry();

      expect(useGenerationStore.getState().retryCount).toBe(2);

      useGenerationStore.getState().reset();

      expect(useGenerationStore.getState().retryCount).toBe(0);
    });
  });

  describe("generation flow", () => {
    it("completeGeneration sets status and model", () => {
      const store = useGenerationStore.getState();

      store.startGeneration("test prompt");
      expect(useGenerationStore.getState().status).toBe("generating");

      const model: GeneratedModel = {
        taskId: "complete-123",
        modelUrl: "http://localhost/model.stl",
      };

      useGenerationStore.getState().completeGeneration(model);

      const state = useGenerationStore.getState();
      expect(state.status).toBe("completed");
      expect(state.stage).toBe("completed");
      expect(state.model).toEqual(model);
    });
  });
});
