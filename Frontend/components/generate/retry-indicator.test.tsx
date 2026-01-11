/**
 * Tests for RetryIndicator component.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RetryIndicator } from "./retry-indicator";

describe("RetryIndicator", () => {
  it("does not render when retryCount is 0", () => {
    const { container } = render(
      <RetryIndicator retryCount={0} maxRetries={3} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows 'Try 2 of 3' after first retry", () => {
    render(<RetryIndicator retryCount={1} maxRetries={3} />);
    const element = screen.getByText("Try 2 of 3");
    expect(element).toBeTruthy();
  });

  it("shows 'Final try' when on last attempt", () => {
    render(<RetryIndicator retryCount={2} maxRetries={3} />);
    const element = screen.getByText("Final try");
    expect(element).toBeTruthy();
  });

  it("does not render when no retries remaining", () => {
    const { container } = render(
      <RetryIndicator retryCount={3} maxRetries={3} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("has correct aria-label for normal try", () => {
    render(<RetryIndicator retryCount={1} maxRetries={3} />);
    const indicator = screen.getByRole("status");
    expect(indicator.getAttribute("aria-label")).toBe("Try 2 of 3");
  });

  it("has correct aria-label for final try", () => {
    render(<RetryIndicator retryCount={2} maxRetries={3} />);
    const indicator = screen.getByRole("status");
    expect(indicator.getAttribute("aria-label")).toBe("Final try");
  });

  it("applies amber styling for final try", () => {
    render(<RetryIndicator retryCount={2} maxRetries={3} />);
    const indicator = screen.getByRole("status");
    expect(indicator.className).toContain("bg-amber-100");
  });

  it("applies custom className", () => {
    render(
      <RetryIndicator retryCount={1} maxRetries={3} className="my-custom-class" />
    );
    const indicator = screen.getByRole("status");
    expect(indicator.className).toContain("my-custom-class");
  });
});
