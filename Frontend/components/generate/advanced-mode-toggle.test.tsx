/**
 * Tests for AdvancedModeToggle component.
 * Tests toggle behavior and warning display.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdvancedModeToggle } from "./advanced-mode-toggle";

describe("AdvancedModeToggle", () => {
  it("should render with label", () => {
    render(
      <AdvancedModeToggle enabled={false} onChange={() => {}} isFirstBuild={true} />
    );
    expect(screen.getByText("Advanced Mode")).toBeInTheDocument();
  });

  it("should be unchecked when enabled is false", () => {
    render(
      <AdvancedModeToggle enabled={false} onChange={() => {}} isFirstBuild={true} />
    );
    const switchEl = screen.getByRole("switch");
    expect(switchEl).not.toBeChecked();
  });

  it("should be checked when enabled is true", () => {
    render(
      <AdvancedModeToggle enabled={true} onChange={() => {}} isFirstBuild={true} />
    );
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBeChecked();
  });

  it("should call onChange when toggled", () => {
    const handleChange = vi.fn();
    render(
      <AdvancedModeToggle enabled={false} onChange={handleChange} isFirstBuild={true} />
    );
    const switchEl = screen.getByRole("switch");
    fireEvent.click(switchEl);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("should show warning when enabled and isFirstBuild is true", () => {
    render(
      <AdvancedModeToggle enabled={true} onChange={() => {}} isFirstBuild={true} />
    );
    expect(screen.getByText(/Complex models may be harder to build/i)).toBeInTheDocument();
  });

  it("should not show warning when enabled but isFirstBuild is false", () => {
    render(
      <AdvancedModeToggle enabled={true} onChange={() => {}} isFirstBuild={false} />
    );
    expect(screen.queryByText(/Complex models may be harder to build/i)).not.toBeInTheDocument();
  });

  it("should not show warning when not enabled", () => {
    render(
      <AdvancedModeToggle enabled={false} onChange={() => {}} isFirstBuild={true} />
    );
    expect(screen.queryByText(/Complex models may be harder to build/i)).not.toBeInTheDocument();
  });

  it("should have proper label association via htmlFor", () => {
    render(
      <AdvancedModeToggle enabled={false} onChange={() => {}} isFirstBuild={true} />
    );
    const label = screen.getByText("Advanced Mode");
    const switchEl = screen.getByRole("switch");
    expect(label).toHaveAttribute("for", switchEl.id);
  });

  it("should render warning icon when showing warning", () => {
    render(
      <AdvancedModeToggle enabled={true} onChange={() => {}} isFirstBuild={true} />
    );
    const warning = screen.getByText(/Complex models may be harder to build/i);
    expect(warning.querySelector("svg")).toBeInTheDocument();
  });
});
