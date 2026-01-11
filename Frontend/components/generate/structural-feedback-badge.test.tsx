/**
 * Tests for StructuralFeedbackBadge component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StructuralFeedbackBadge } from "./structural-feedback-badge";
import type { StructuralAnalysis } from "@/lib/types";

describe("StructuralFeedbackBadge", () => {
  const mockOnClick = vi.fn();

  const soundAnalysis: StructuralAnalysis = {
    buildabilityScore: 85,
    issues: [],
    recommendations: [],
  };

  const concernAnalysis: StructuralAnalysis = {
    buildabilityScore: 55,
    issues: [
      {
        type: "weak_base",
        severity: "warning",
        description: "Base layer is thin",
      },
    ],
    recommendations: ["Add more base bricks"],
  };

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it("shows green badge with 'Structurally sound' when score >= 70", () => {
    render(
      <StructuralFeedbackBadge analysis={soundAnalysis} onClick={mockOnClick} />
    );
    const badge = screen.getByRole("button");
    expect(screen.getByText("Structurally sound")).toBeTruthy();
    expect(badge.className).toContain("bg-green-100");
  });

  it("shows amber badge with 'Structural concerns - review' when score < 70", () => {
    render(
      <StructuralFeedbackBadge analysis={concernAnalysis} onClick={mockOnClick} />
    );
    const badge = screen.getByRole("button");
    expect(screen.getByText("Structural concerns - review")).toBeTruthy();
    expect(badge.className).toContain("bg-amber-100");
  });

  it("shows green badge at exactly 70", () => {
    const edgeAnalysis: StructuralAnalysis = {
      buildabilityScore: 70,
      issues: [],
      recommendations: [],
    };
    render(
      <StructuralFeedbackBadge analysis={edgeAnalysis} onClick={mockOnClick} />
    );
    expect(screen.getByText("Structurally sound")).toBeTruthy();
  });

  it("shows amber badge at 69", () => {
    const edgeAnalysis: StructuralAnalysis = {
      buildabilityScore: 69,
      issues: [],
      recommendations: [],
    };
    render(
      <StructuralFeedbackBadge analysis={edgeAnalysis} onClick={mockOnClick} />
    );
    expect(screen.getByText("Structural concerns - review")).toBeTruthy();
  });

  it("calls onClick when clicked", () => {
    render(
      <StructuralFeedbackBadge analysis={soundAnalysis} onClick={mockOnClick} />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when Enter key is pressed", () => {
    render(
      <StructuralFeedbackBadge analysis={soundAnalysis} onClick={mockOnClick} />
    );
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when Space key is pressed", () => {
    render(
      <StructuralFeedbackBadge analysis={soundAnalysis} onClick={mockOnClick} />
    );
    fireEvent.keyDown(screen.getByRole("button"), { key: " " });
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("has correct aria-label for structurally sound", () => {
    render(
      <StructuralFeedbackBadge analysis={soundAnalysis} onClick={mockOnClick} />
    );
    const badge = screen.getByRole("button");
    expect(badge.getAttribute("aria-label")).toBe(
      "Buildability score: 85. Structurally sound. Click for details."
    );
  });

  it("has correct aria-label for structural concerns", () => {
    render(
      <StructuralFeedbackBadge analysis={concernAnalysis} onClick={mockOnClick} />
    );
    const badge = screen.getByRole("button");
    expect(badge.getAttribute("aria-label")).toBe(
      "Buildability score: 55. Structural concerns. Click for details."
    );
  });

  it("applies custom className", () => {
    render(
      <StructuralFeedbackBadge
        analysis={soundAnalysis}
        onClick={mockOnClick}
        className="my-custom-class"
      />
    );
    const badge = screen.getByRole("button");
    expect(badge.className).toContain("my-custom-class");
  });
});
