/**
 * Tests for FirstBuildBadge component.
 * Tests badge rendering, click interaction, and modal display.
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FirstBuildBadge } from "./first-build-badge";

describe("FirstBuildBadge", () => {
  it("should render with correct text", () => {
    render(<FirstBuildBadge />);
    expect(screen.getByText("First-Build Mode - Simplified for success")).toBeInTheDocument();
  });

  it("should have role button for accessibility", () => {
    render(<FirstBuildBadge />);
    const badge = screen.getByRole("button", { name: /First-Build Mode/i });
    expect(badge).toBeInTheDocument();
  });

  it("should have aria-label for accessibility", () => {
    render(<FirstBuildBadge />);
    const badge = screen.getByLabelText(/First-Build Mode active/i);
    expect(badge).toBeInTheDocument();
  });

  it("should apply blue styling classes", () => {
    render(<FirstBuildBadge />);
    const badge = screen.getByRole("button", { name: /First-Build Mode/i });
    expect(badge.className).toContain("bg-blue-100");
    expect(badge.className).toContain("text-blue-800");
  });

  it("should open modal when clicked", () => {
    render(<FirstBuildBadge />);
    const badge = screen.getByRole("button", { name: /First-Build Mode/i });

    fireEvent.click(badge);

    expect(screen.getByText(/We're generating a simpler design/i)).toBeInTheDocument();
  });

  it("should display explanation content in modal", () => {
    render(<FirstBuildBadge />);
    const badge = screen.getByRole("button", { name: /First-Build Mode/i });

    fireEvent.click(badge);

    expect(screen.getByText(/Fewer layers/i)).toBeInTheDocument();
    expect(screen.getByText(/Larger bricks/i)).toBeInTheDocument();
    expect(screen.getByText(/Stable structures/i)).toBeInTheDocument();
  });

  it("should have sparkles icon", () => {
    render(<FirstBuildBadge />);
    // The Sparkles icon should be present
    const badge = screen.getByRole("button", { name: /First-Build Mode/i });
    expect(badge.querySelector("svg")).toBeInTheDocument();
  });

  it("should close modal when dialog is dismissed", () => {
    render(<FirstBuildBadge />);
    const badge = screen.getByRole("button", { name: /First-Build Mode/i });

    // Open modal
    fireEvent.click(badge);
    expect(screen.getByText(/We're generating a simpler design/i)).toBeInTheDocument();

    // Close modal by clicking outside (Radix UI handles this)
    fireEvent.keyDown(document.body, { key: "Escape" });

    // Modal content should no longer be visible
    expect(screen.queryByText(/We're generating a simpler design/i)).not.toBeInTheDocument();
  });

  it("should mention Advanced Mode unlock in modal", () => {
    render(<FirstBuildBadge />);
    const badge = screen.getByRole("button", { name: /First-Build Mode/i });

    fireEvent.click(badge);

    expect(screen.getByText(/Advanced Mode/i)).toBeInTheDocument();
  });
});
