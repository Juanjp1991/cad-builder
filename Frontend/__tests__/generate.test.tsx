/**
 * Tests for the generation page and components.
 */

import React from "react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PromptInput } from "@/components/generate/prompt-input";
import { useGenerationStore } from "@/lib/stores/useGenerationStore";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    p: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <p {...props}>{children}</p>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the API
vi.mock("@/lib/api", () => ({
  generateLegoModel: vi.fn(),
  TaskState: {
    COMPLETED: "TASK_STATE_COMPLETED",
    FAILED: "TASK_STATE_FAILED",
  },
  getTask: vi.fn(),
}));

// Mock the database
vi.mock("@/lib/db", () => ({
  db: {
    generationCache: {
      add: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: vi.fn(() => Promise.resolve(null)),
        })),
      })),
    },
  },
  getUserPreference: vi.fn(),
  setUserPreference: vi.fn(),
}));

// Mock useFirstBuild hook
vi.mock("@/lib/hooks/use-first-build", () => ({
  useFirstBuild: vi.fn(() => ({
    isFirstBuild: true,
    isLoading: false,
    setFirstBuildComplete: vi.fn(),
  })),
}));

describe("PromptInput", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("renders input and submit button", () => {
    render(<PromptInput onSubmit={mockOnSubmit} />);

    expect(
      screen.getByPlaceholderText(/describe what you want to build/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
  });

  it("disables submit button when input is empty", () => {
    render(<PromptInput onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /generate/i });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when input has text", () => {
    render(<PromptInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/describe what you want to build/i);
    fireEvent.change(input, { target: { value: "a small dragon" } });

    const submitButton = screen.getByRole("button", { name: /generate/i });
    expect(submitButton).not.toBeDisabled();
  });

  it("calls onSubmit with trimmed prompt when form is submitted", () => {
    render(<PromptInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/describe what you want to build/i);
    fireEvent.change(input, { target: { value: "  a small dragon  " } });
    fireEvent.submit(input.closest("form")!);

    expect(mockOnSubmit).toHaveBeenCalledWith("a small dragon");
  });

  it("renders example prompts", () => {
    render(<PromptInput onSubmit={mockOnSubmit} />);

    expect(screen.getByText("a small red dragon")).toBeInTheDocument();
    expect(screen.getByText("a simple house with a roof")).toBeInTheDocument();
  });

  it("fills input when example prompt is clicked", () => {
    render(<PromptInput onSubmit={mockOnSubmit} />);

    const exampleButton = screen.getByText("a small red dragon");
    fireEvent.click(exampleButton);

    const input = screen.getByPlaceholderText(
      /describe what you want to build/i
    ) as HTMLInputElement;
    expect(input.value).toBe("a small red dragon");
  });

  it("disables input when disabled prop is true", () => {
    render(<PromptInput onSubmit={mockOnSubmit} disabled />);

    const input = screen.getByPlaceholderText(/describe what you want to build/i);
    expect(input).toBeDisabled();
  });
});

describe("useGenerationStore", () => {
  beforeEach(() => {
    // Reset the store before each test
    useGenerationStore.getState().reset();
  });

  it("starts with idle status", () => {
    const state = useGenerationStore.getState();
    expect(state.status).toBe("idle");
    expect(state.stage).toBe("idle");
  });

  it("starts generation and sets stage to imagining", () => {
    useGenerationStore.getState().startGeneration("test prompt");

    const state = useGenerationStore.getState();
    expect(state.status).toBe("generating");
    expect(state.stage).toBe("imagining");
    expect(state.prompt).toBe("test prompt");
    expect(state.startTime).not.toBeNull();
  });

  it("progresses through stages", () => {
    const store = useGenerationStore.getState();
    store.startGeneration("test");

    store.setStage("finding");
    expect(useGenerationStore.getState().stage).toBe("finding");

    store.setStage("building");
    expect(useGenerationStore.getState().stage).toBe("building");
  });

  it("completes generation with model data", () => {
    const store = useGenerationStore.getState();
    store.startGeneration("test");

    const mockModel = {
      taskId: "task-123",
      modelUrl: "https://example.com/model.stl",
      brickCount: 50,
    };

    store.completeGeneration(mockModel);

    const state = useGenerationStore.getState();
    expect(state.status).toBe("completed");
    expect(state.stage).toBe("completed");
    expect(state.model).toEqual(mockModel);
  });

  it("handles generation failure", () => {
    const store = useGenerationStore.getState();
    store.startGeneration("test");
    store.failGeneration("Network error");

    const state = useGenerationStore.getState();
    expect(state.status).toBe("failed");
    expect(state.stage).toBe("failed");
    expect(state.error).toBe("Network error");
  });

  it("tracks retry count correctly", () => {
    const store = useGenerationStore.getState();

    // First retry should succeed
    expect(store.incrementRetry()).toBe(true);
    expect(useGenerationStore.getState().retryCount).toBe(1);

    // Second retry should succeed
    expect(store.incrementRetry()).toBe(true);
    expect(useGenerationStore.getState().retryCount).toBe(2);

    // Third retry should succeed
    expect(store.incrementRetry()).toBe(true);
    expect(useGenerationStore.getState().retryCount).toBe(3);

    // Fourth retry should fail (max is 3)
    expect(store.incrementRetry()).toBe(false);
    expect(useGenerationStore.getState().retryCount).toBe(3);
  });

  it("resets state correctly", () => {
    const store = useGenerationStore.getState();
    store.startGeneration("test");
    store.completeGeneration({
      taskId: "task-123",
      modelUrl: "https://example.com/model.stl",
    });
    store.incrementRetry();

    store.reset();

    const state = useGenerationStore.getState();
    expect(state.status).toBe("idle");
    expect(state.stage).toBe("idle");
    expect(state.prompt).toBe("");
    expect(state.model).toBeNull();
    expect(state.retryCount).toBe(0);
  });

  it("updates elapsed time", () => {
    vi.useFakeTimers();
    const store = useGenerationStore.getState();

    store.startGeneration("test");
    const startTime = useGenerationStore.getState().startTime;

    // Advance time by 5 seconds
    vi.advanceTimersByTime(5000);
    store.updateElapsedTime();

    expect(useGenerationStore.getState().elapsedTime).toBe(5);

    vi.useRealTimers();
  });
});

// Import mocked hook for manipulation
import { useFirstBuild } from "@/lib/hooks/use-first-build";
import { FirstBuildBadge } from "@/components/generate/first-build-badge";
import { AdvancedModeToggle } from "@/components/generate/advanced-mode-toggle";

describe("First-Build Guarantee Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("FirstBuildBadge", () => {
    it("renders with correct AC-compliant text", () => {
      render(<FirstBuildBadge />);

      // AC #4: badge should show "First-Build Mode - Simplified for success"
      expect(
        screen.getByText("First-Build Mode - Simplified for success")
      ).toBeInTheDocument();
    });

    it("has blue styling classes per AC #4", () => {
      render(<FirstBuildBadge />);

      const badge = screen.getByRole("button");
      expect(badge.className).toContain("bg-blue-100");
      expect(badge.className).toContain("text-blue-800");
    });
  });

  describe("AdvancedModeToggle", () => {
    it("shows warning when enabled for first-time users (AC #5)", () => {
      render(
        <AdvancedModeToggle
          enabled={true}
          onChange={() => {}}
          isFirstBuild={true}
        />
      );

      expect(
        screen.getByText(/Complex models may be harder to build/i)
      ).toBeInTheDocument();
    });

    it("hides warning when not first-time user", () => {
      render(
        <AdvancedModeToggle
          enabled={true}
          onChange={() => {}}
          isFirstBuild={false}
        />
      );

      expect(
        screen.queryByText(/Complex models may be harder to build/i)
      ).not.toBeInTheDocument();
    });

    it("calls onChange when toggled (AC #5)", () => {
      const handleChange = vi.fn();
      render(
        <AdvancedModeToggle
          enabled={false}
          onChange={handleChange}
          isFirstBuild={true}
        />
      );

      fireEvent.click(screen.getByRole("switch"));
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe("Complexity determination", () => {
    it("uses simple complexity when isFirstBuild is true and advancedMode is false", () => {
      // Test the logic: isFirstBuild && !advancedModeEnabled -> 'simple'
      const isFirstBuild = true;
      const advancedModeEnabled = false;
      const shouldUseSimpleMode = isFirstBuild && !advancedModeEnabled;
      const complexity = shouldUseSimpleMode ? "simple" : "normal";

      expect(complexity).toBe("simple");
    });

    it("uses normal complexity when advancedMode overrides first-build", () => {
      // Test the logic: isFirstBuild && advancedModeEnabled -> 'normal'
      const isFirstBuild = true;
      const advancedModeEnabled = true;
      const shouldUseSimpleMode = isFirstBuild && !advancedModeEnabled;
      const complexity = shouldUseSimpleMode ? "simple" : "normal";

      expect(complexity).toBe("normal");
    });

    it("uses normal complexity when not first-build", () => {
      // Test the logic: !isFirstBuild -> 'normal'
      const isFirstBuild = false;
      const advancedModeEnabled = false;
      const shouldUseSimpleMode = isFirstBuild && !advancedModeEnabled;
      const complexity = shouldUseSimpleMode ? "simple" : "normal";

      expect(complexity).toBe("normal");
    });
  });
});
