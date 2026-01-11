/**
 * Tests for GenerationResult component.
 * Focuses on retry/Start Fresh functionality.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GenerationResult } from "./generation-result";

// Mock the store
const mockStoreState = {
  model: {
    taskId: "test-task-123",
    modelUrl: "http://localhost:8001/model.stl",
    brickCount: 100,
  },
  prompt: "A cool dragon",
  retryCount: 0,
  maxRetries: 3,
};

vi.mock("@/lib/stores/useGenerationStore", () => ({
  useGenerationStore: vi.fn(() => mockStoreState),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("GenerationResult", () => {
  const mockOnRegenerate = vi.fn();
  const mockOnStartBuilding = vi.fn();
  const mockOnModify = vi.fn();
  const mockOnStartFresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    mockStoreState.retryCount = 0;
    mockStoreState.model = {
      taskId: "test-task-123",
      modelUrl: "http://localhost:8001/model.stl",
      brickCount: 100,
    };
  });

  const renderComponent = () =>
    render(
      <GenerationResult
        onRegenerate={mockOnRegenerate}
        onStartBuilding={mockOnStartBuilding}
        onModify={mockOnModify}
        onStartFresh={mockOnStartFresh}
      />
    );

  describe("Regenerate button", () => {
    it("shows Regenerate button when retries remaining", () => {
      mockStoreState.retryCount = 0;
      renderComponent();

      const regenerateButton = screen.getByRole("button", {
        name: /regenerate model, 3 retries remaining/i,
      });
      expect(regenerateButton).toBeTruthy();
      expect(screen.getByText(/Regenerate \(3 left\)/)).toBeTruthy();
    });

    it("calls onRegenerate when Regenerate button is clicked", () => {
      mockStoreState.retryCount = 1;
      renderComponent();

      const regenerateButton = screen.getByRole("button", {
        name: /regenerate model, 2 retries remaining/i,
      });
      fireEvent.click(regenerateButton);

      expect(mockOnRegenerate).toHaveBeenCalledTimes(1);
    });
  });

  describe("Start Fresh button", () => {
    it("shows Start Fresh button when no retries remaining", () => {
      mockStoreState.retryCount = 3;
      renderComponent();

      const startFreshButton = screen.getByRole("button", {
        name: /start fresh with a new design/i,
      });
      expect(startFreshButton).toBeTruthy();
      expect(screen.getByText("Start Fresh")).toBeTruthy();
    });

    it("calls onStartFresh when Start Fresh button is clicked", () => {
      mockStoreState.retryCount = 3;
      renderComponent();

      const startFreshButton = screen.getByRole("button", {
        name: /start fresh with a new design/i,
      });
      fireEvent.click(startFreshButton);

      expect(mockOnStartFresh).toHaveBeenCalledTimes(1);
    });

    it("shows helper text when retries exhausted", () => {
      mockStoreState.retryCount = 3;
      renderComponent();

      expect(
        screen.getByText(/You've used all 3 free retries/i)
      ).toBeTruthy();
    });
  });

  describe("Other buttons", () => {
    it("calls onStartBuilding when Start Building button is clicked", () => {
      renderComponent();

      const startBuildingButton = screen.getByRole("button", {
        name: /start building your lego model/i,
      });
      fireEvent.click(startBuildingButton);

      expect(mockOnStartBuilding).toHaveBeenCalledTimes(1);
    });

    it("calls onModify when Modify button is clicked", () => {
      renderComponent();

      const modifyButton = screen.getByRole("button", {
        name: /modify your lego model design/i,
      });
      fireEvent.click(modifyButton);

      expect(mockOnModify).toHaveBeenCalledTimes(1);
    });
  });

  describe("Model display", () => {
    it("displays brick count", () => {
      renderComponent();
      expect(screen.getByText("100")).toBeTruthy();
    });

    it("displays prompt", () => {
      renderComponent();
      // The component uses curly quotes (&ldquo; &rdquo;) around the prompt
      expect(screen.getByText(/A cool dragon/)).toBeTruthy();
    });
  });
});
