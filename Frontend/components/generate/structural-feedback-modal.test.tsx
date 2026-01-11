/**
 * Tests for StructuralFeedbackModal component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StructuralFeedbackModal } from "./structural-feedback-modal";
import type { StructuralAnalysis } from "@/lib/types";

describe("StructuralFeedbackModal", () => {
  const mockOnOpenChange = vi.fn();

  const soundAnalysis: StructuralAnalysis = {
    buildabilityScore: 90,
    issues: [],
    recommendations: [],
  };

  const concernAnalysis: StructuralAnalysis = {
    buildabilityScore: 55,
    issues: [
      {
        type: "weak_base",
        severity: "warning",
        description: "Base layer is only 1 brick thick",
      },
      {
        type: "cantilever",
        severity: "error",
        description: "Unsupported overhang detected",
        location: "Layer 5, brick at (2,4)",
      },
    ],
    recommendations: [
      "Add support bricks under extended section",
      "Consider wider base layer",
    ],
  };

  beforeEach(() => {
    mockOnOpenChange.mockClear();
  });

  it("renders when open is true", () => {
    render(
      <StructuralFeedbackModal
        analysis={soundAnalysis}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );
    expect(screen.getByText("Structural Analysis")).toBeTruthy();
  });

  it("does not render when open is false", () => {
    render(
      <StructuralFeedbackModal
        analysis={soundAnalysis}
        open={false}
        onOpenChange={mockOnOpenChange}
      />
    );
    expect(screen.queryByText("Structural Analysis")).toBeNull();
  });

  it("shows buildability score", () => {
    render(
      <StructuralFeedbackModal
        analysis={soundAnalysis}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );
    expect(screen.getByText("90/100")).toBeTruthy();
  });

  it("shows positive message for high score", () => {
    render(
      <StructuralFeedbackModal
        analysis={soundAnalysis}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );
    expect(
      screen.getByText("Your model is structurally sound and ready to build.")
    ).toBeTruthy();
  });

  it("shows concern message for low score", () => {
    render(
      <StructuralFeedbackModal
        analysis={concernAnalysis}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );
    expect(
      screen.getByText("Your model has some structural concerns to review.")
    ).toBeTruthy();
  });

  it("displays issues when present", () => {
    render(
      <StructuralFeedbackModal
        analysis={concernAnalysis}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );
    expect(screen.getByText("Issues Found (2)")).toBeTruthy();
    expect(screen.getByText("Weak Base")).toBeTruthy();
    expect(screen.getByText("Cantilever")).toBeTruthy();
    expect(screen.getByText("Base layer is only 1 brick thick")).toBeTruthy();
  });

  it("displays issue location when present", () => {
    render(
      <StructuralFeedbackModal
        analysis={concernAnalysis}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );
    expect(screen.getByText("Location: Layer 5, brick at (2,4)")).toBeTruthy();
  });

  it("displays recommendations when present", () => {
    render(
      <StructuralFeedbackModal
        analysis={concernAnalysis}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );
    expect(screen.getByText("Recommendations (2)")).toBeTruthy();
    expect(screen.getByText("Add support bricks under extended section")).toBeTruthy();
    expect(screen.getByText("Consider wider base layer")).toBeTruthy();
  });

  it("shows 'no issues' message when score is high and no issues", () => {
    render(
      <StructuralFeedbackModal
        analysis={soundAnalysis}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );
    expect(
      screen.getByText("No issues detected. Your model is ready to build!")
    ).toBeTruthy();
  });

  it("calls onOpenChange when 'Got it' button is clicked", () => {
    render(
      <StructuralFeedbackModal
        analysis={soundAnalysis}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );
    fireEvent.click(screen.getByText("Got it"));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("formats issue types correctly", () => {
    const analysisWithAllTypes: StructuralAnalysis = {
      buildabilityScore: 50,
      issues: [
        { type: "weak_base", severity: "warning", description: "Test" },
        { type: "cantilever", severity: "warning", description: "Test" },
        { type: "floating_brick", severity: "error", description: "Test" },
        { type: "unstable_joint", severity: "error", description: "Test" },
        { type: "other", severity: "warning", description: "Test" },
      ],
      recommendations: [],
    };

    render(
      <StructuralFeedbackModal
        analysis={analysisWithAllTypes}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByText("Weak Base")).toBeTruthy();
    expect(screen.getByText("Cantilever")).toBeTruthy();
    expect(screen.getByText("Floating Brick")).toBeTruthy();
    expect(screen.getByText("Unstable Joint")).toBeTruthy();
    expect(screen.getByText("Other Issue")).toBeTruthy();
  });
});
