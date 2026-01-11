"use client";

/**
 * Text prompt input component for LEGO model generation.
 * Handles user input and triggers generation.
 */

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Example prompts for user inspiration.
 */
const EXAMPLE_PROMPTS = [
  "a small red dragon",
  "a simple house with a roof",
  "a race car",
  "a cute robot",
  "a castle tower",
];

export function PromptInput({
  onSubmit,
  disabled = false,
  placeholder = "Describe what you want to build...",
}: PromptInputProps): React.JSX.Element {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent): void => {
      e.preventDefault();
      if (prompt.trim() && !disabled) {
        onSubmit(prompt.trim());
      }
    },
    [prompt, disabled, onSubmit]
  );

  const handleExampleClick = useCallback((example: string): void => {
    setPrompt(example);
  }, []);

  const isValid = prompt.trim().length > 0;

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 h-12 text-base"
          autoFocus
          aria-label="Describe what you want to build"
        />
        <Button
          type="submit"
          disabled={disabled || !isValid}
          size="lg"
          className="h-12 px-6 bg-accent text-accent-foreground hover:bg-accent/90"
          aria-label="Generate LEGO model from your description"
        >
          <Sparkles className="size-5 mr-2" />
          Generate
        </Button>
      </form>

      {/* Example prompts */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Try:</span>
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleExampleClick(example)}
            disabled={disabled}
            className="text-sm px-3 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
