"use client";

/**
 * Mode toggle component for switching between Text and Image generation modes.
 * AC: image mode selected - provides UI to switch between text and image input.
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Type, Image as ImageIcon } from "lucide-react";

/**
 * Generation mode type.
 */
export type GenerationMode = "text" | "image";

interface ModeToggleProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  disabled?: boolean;
}

/**
 * Mode toggle button component for switching between Text and Image modes.
 */
export function ModeToggle({
  mode,
  onModeChange,
  disabled = false,
}: ModeToggleProps): React.JSX.Element {
  return (
    <div
      className="inline-flex items-center rounded-lg bg-muted p-1"
      role="tablist"
      aria-label="Generation mode"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "text"}
        aria-controls="text-input-panel"
        onClick={() => onModeChange("text")}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "min-h-[44px]", // WCAG AA touch target
          mode === "text"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        )}
      >
        <Type className="size-4" aria-hidden="true" />
        <span>Text</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "image"}
        aria-controls="image-input-panel"
        onClick={() => onModeChange("image")}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "min-h-[44px]", // WCAG AA touch target
          mode === "image"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        )}
      >
        <ImageIcon className="size-4" aria-hidden="true" />
        <span>Image</span>
      </button>
    </div>
  );
}
