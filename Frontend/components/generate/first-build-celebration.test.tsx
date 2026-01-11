/**
 * Tests for FirstBuildCelebration modal component.
 * Tests modal rendering, content display, and close behavior.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FirstBuildCelebration } from "./first-build-celebration";

describe("FirstBuildCelebration", () => {
  it("should render when open is true", () => {
    render(<FirstBuildCelebration open={true} onClose={() => {}} />);
    expect(screen.getByText("Your First Creation!")).toBeInTheDocument();
  });

  it("should not render when open is false", () => {
    render(<FirstBuildCelebration open={false} onClose={() => {}} />);
    expect(screen.queryByText("Your First Creation!")).not.toBeInTheDocument();
  });

  it("should display trophy icon", () => {
    render(<FirstBuildCelebration open={true} onClose={() => {}} />);
    const title = screen.getByText("Your First Creation!");
    expect(title.closest("h2")?.querySelector("svg")).toBeInTheDocument();
  });

  it("should display congratulations message", () => {
    render(<FirstBuildCelebration open={true} onClose={() => {}} />);
    expect(screen.getByText(/Congratulations on completing your first/i)).toBeInTheDocument();
  });

  it("should display Advanced Mode unlocked message", () => {
    render(<FirstBuildCelebration open={true} onClose={() => {}} />);
    expect(screen.getByText(/Advanced Mode Unlocked/i)).toBeInTheDocument();
  });

  it("should display more complex designs message", () => {
    render(<FirstBuildCelebration open={true} onClose={() => {}} />);
    expect(screen.getByText(/more complex and challenging designs/i)).toBeInTheDocument();
  });

  it("should have a Continue button", () => {
    render(<FirstBuildCelebration open={true} onClose={() => {}} />);
    expect(screen.getByRole("button", { name: /Continue/i })).toBeInTheDocument();
  });

  it("should call onClose when Continue button is clicked", () => {
    const handleClose = vi.fn();
    render(<FirstBuildCelebration open={true} onClose={handleClose} />);

    const continueButton = screen.getByRole("button", { name: /Continue/i });
    fireEvent.click(continueButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it("should call onClose when dialog is dismissed via escape key", () => {
    const handleClose = vi.fn();
    render(<FirstBuildCelebration open={true} onClose={handleClose} />);

    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(handleClose).toHaveBeenCalled();
  });

  it("should have sparkles icon for Advanced Mode", () => {
    render(<FirstBuildCelebration open={true} onClose={() => {}} />);
    const advancedModeText = screen.getByText(/Advanced Mode Unlocked/i);
    expect(advancedModeText.closest("div")?.querySelector("svg")).toBeInTheDocument();
  });
});
