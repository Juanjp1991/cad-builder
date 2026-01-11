import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ModeToggle } from "./mode-toggle";

describe("ModeToggle", () => {
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders text and image mode buttons", () => {
    render(
      <ModeToggle mode="text" onModeChange={mockOnModeChange} />
    );

    expect(screen.getByRole("tab", { name: /text/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /image/i })).toBeInTheDocument();
  });

  it("shows text mode as selected when mode is text", () => {
    render(
      <ModeToggle mode="text" onModeChange={mockOnModeChange} />
    );

    const textTab = screen.getByRole("tab", { name: /text/i });
    const imageTab = screen.getByRole("tab", { name: /image/i });

    expect(textTab).toHaveAttribute("aria-selected", "true");
    expect(imageTab).toHaveAttribute("aria-selected", "false");
  });

  it("shows image mode as selected when mode is image", () => {
    render(
      <ModeToggle mode="image" onModeChange={mockOnModeChange} />
    );

    const textTab = screen.getByRole("tab", { name: /text/i });
    const imageTab = screen.getByRole("tab", { name: /image/i });

    expect(textTab).toHaveAttribute("aria-selected", "false");
    expect(imageTab).toHaveAttribute("aria-selected", "true");
  });

  it("calls onModeChange with 'image' when image button is clicked", () => {
    render(
      <ModeToggle mode="text" onModeChange={mockOnModeChange} />
    );

    const imageTab = screen.getByRole("tab", { name: /image/i });
    fireEvent.click(imageTab);

    expect(mockOnModeChange).toHaveBeenCalledWith("image");
  });

  it("calls onModeChange with 'text' when text button is clicked", () => {
    render(
      <ModeToggle mode="image" onModeChange={mockOnModeChange} />
    );

    const textTab = screen.getByRole("tab", { name: /text/i });
    fireEvent.click(textTab);

    expect(mockOnModeChange).toHaveBeenCalledWith("text");
  });

  it("disables both buttons when disabled prop is true", () => {
    render(
      <ModeToggle mode="text" onModeChange={mockOnModeChange} disabled />
    );

    const textTab = screen.getByRole("tab", { name: /text/i });
    const imageTab = screen.getByRole("tab", { name: /image/i });

    expect(textTab).toBeDisabled();
    expect(imageTab).toBeDisabled();
  });

  it("does not call onModeChange when disabled", () => {
    render(
      <ModeToggle mode="text" onModeChange={mockOnModeChange} disabled />
    );

    const imageTab = screen.getByRole("tab", { name: /image/i });
    fireEvent.click(imageTab);

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it("has proper accessibility attributes", () => {
    render(
      <ModeToggle mode="text" onModeChange={mockOnModeChange} />
    );

    const tablist = screen.getByRole("tablist");
    expect(tablist).toHaveAttribute("aria-label", "Generation mode");

    const textTab = screen.getByRole("tab", { name: /text/i });
    expect(textTab).toHaveAttribute("aria-controls", "text-input-panel");

    const imageTab = screen.getByRole("tab", { name: /image/i });
    expect(imageTab).toHaveAttribute("aria-controls", "image-input-panel");
  });

  it("has minimum touch target size for WCAG AA compliance", () => {
    render(
      <ModeToggle mode="text" onModeChange={mockOnModeChange} />
    );

    const textTab = screen.getByRole("tab", { name: /text/i });
    const imageTab = screen.getByRole("tab", { name: /image/i });

    // Both buttons should have the min-h-[44px] class for WCAG AA touch targets
    expect(textTab.className).toContain("min-h-[44px]");
    expect(imageTab.className).toContain("min-h-[44px]");
  });
});
