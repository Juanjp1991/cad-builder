"use client";

/**
 * Structural feedback badge component.
 * Displays buildability status with color-coded badges.
 * Green for structurally sound (score >= 70), amber for concerns (score < 70).
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StructuralAnalysis } from "@/lib/types";

interface StructuralFeedbackBadgeProps {
  analysis: StructuralAnalysis;
  onClick: () => void;
  className?: string;
}

/**
 * Displays a clickable badge indicating structural buildability.
 * - Green badge with shield icon when buildabilityScore >= 70
 * - Amber badge with warning icon when buildabilityScore < 70
 */
export function StructuralFeedbackBadge({
  analysis,
  onClick,
  className,
}: StructuralFeedbackBadgeProps): React.JSX.Element {
  const isSound = analysis.buildabilityScore >= 70;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "cursor-pointer transition-colors gap-1.5",
        isSound
          ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/50"
          : "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Buildability score: ${analysis.buildabilityScore}. ${
        isSound ? "Structurally sound" : "Structural concerns"
      }. Click for details.`}
    >
      {isSound ? (
        <>
          <ShieldCheck className="size-3" aria-hidden="true" />
          <span>Structurally sound</span>
        </>
      ) : (
        <>
          <AlertTriangle className="size-3" aria-hidden="true" />
          <span>Structural concerns - review</span>
        </>
      )}
    </Badge>
  );
}
