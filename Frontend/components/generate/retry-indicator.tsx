"use client";

/**
 * Retry indicator component showing current try number.
 * Displays "Try X of 3" or "Final try" with visual emphasis.
 */

import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetryIndicatorProps {
  retryCount: number;
  maxRetries: number;
  className?: string;
}

/**
 * Displays the current retry attempt status.
 * Shows "Try X of 3" for normal tries, "Final try" with amber warning for last attempt.
 */
export function RetryIndicator({
  retryCount,
  maxRetries,
  className,
}: RetryIndicatorProps): React.JSX.Element {
  // Only show if user has made at least one attempt
  if (retryCount === 0) {
    return <></>;
  }

  const currentTry = retryCount + 1; // 1-indexed for display
  const isFinalTry = retryCount === maxRetries - 1;
  const remainingRetries = maxRetries - retryCount;

  // Don't show if no retries remaining (Start Fresh state)
  if (remainingRetries <= 0) {
    return <></>;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1",
        isFinalTry
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
          : "bg-muted text-muted-foreground",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={isFinalTry ? "Final try" : `Try ${currentTry} of ${maxRetries}`}
    >
      {isFinalTry ? (
        <>
          <AlertTriangle className="size-3" aria-hidden="true" />
          <span>Final try</span>
        </>
      ) : (
        <span>Try {currentTry} of {maxRetries}</span>
      )}
    </div>
  );
}
