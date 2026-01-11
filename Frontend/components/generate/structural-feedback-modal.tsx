"use client";

/**
 * Structural feedback modal component.
 * Displays detailed buildability analysis including score, issues, and recommendations.
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StructuralAnalysis, StructuralIssue } from "@/lib/types";

interface StructuralFeedbackModalProps {
  analysis: StructuralAnalysis;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal displaying detailed structural analysis feedback.
 * Shows buildability score gauge, issues list, and recommendations.
 */
export function StructuralFeedbackModal({
  analysis,
  open,
  onOpenChange,
}: StructuralFeedbackModalProps): React.JSX.Element {
  const isSound = analysis.buildabilityScore >= 70;
  const hasIssues = analysis.issues.length > 0;
  const hasRecommendations = analysis.recommendations.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSound ? (
              <CheckCircle2 className="size-5 text-green-600" aria-hidden="true" />
            ) : (
              <AlertTriangle className="size-5 text-amber-600" aria-hidden="true" />
            )}
            Structural Analysis
          </DialogTitle>
          <DialogDescription>
            {isSound
              ? "Your model is structurally sound and ready to build."
              : "Your model has some structural concerns to review."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Buildability Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Buildability Score</span>
              <span
                className={cn(
                  "font-bold",
                  analysis.buildabilityScore >= 70
                    ? "text-green-600"
                    : analysis.buildabilityScore >= 50
                      ? "text-amber-600"
                      : "text-red-600"
                )}
              >
                {analysis.buildabilityScore}/100
              </span>
            </div>
            <Progress
              value={analysis.buildabilityScore}
              className="h-2"
              aria-label={`Buildability score: ${analysis.buildabilityScore} out of 100`}
            />
            <p className="text-xs text-muted-foreground">
              {analysis.buildabilityScore >= 70
                ? "Score indicates stable, buildable design."
                : analysis.buildabilityScore >= 50
                  ? "Score indicates moderate stability. Review issues below."
                  : "Score indicates significant structural concerns."}
            </p>
          </div>

          {/* Issues List */}
          {hasIssues && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="size-4 text-muted-foreground" aria-hidden="true" />
                Issues Found ({analysis.issues.length})
              </h4>
              <ul className="space-y-2">
                {analysis.issues.map((issue, index) => (
                  <IssueItem key={`${issue.type}-${index}`} issue={issue} />
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations List */}
          {hasRecommendations && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="size-4 text-muted-foreground" aria-hidden="true" />
                Recommendations ({analysis.recommendations.length})
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <li
                    key={index}
                    className="text-sm pl-4 border-l-2 border-blue-200 dark:border-blue-800 py-1"
                  >
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No issues/recommendations state */}
          {!hasIssues && !hasRecommendations && isSound && (
            <div className="text-center py-4 text-muted-foreground">
              <CheckCircle2 className="size-8 mx-auto mb-2 text-green-500" aria-hidden="true" />
              <p className="text-sm">No issues detected. Your model is ready to build!</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Individual issue item with severity icon.
 */
function IssueItem({ issue }: { issue: StructuralIssue }): React.JSX.Element {
  const isError = issue.severity === "error";

  return (
    <li
      className={cn(
        "text-sm p-2 rounded-md border-l-2",
        isError
          ? "bg-red-50 border-red-400 dark:bg-red-950/30 dark:border-red-600"
          : "bg-amber-50 border-amber-400 dark:bg-amber-950/30 dark:border-amber-600"
      )}
    >
      <div className="flex items-start gap-2">
        {isError ? (
          <AlertCircle
            className="size-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
            aria-label="Error"
          />
        ) : (
          <AlertTriangle
            className="size-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
            aria-label="Warning"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium",
            isError ? "text-red-800 dark:text-red-200" : "text-amber-800 dark:text-amber-200"
          )}>
            {formatIssueType(issue.type)}
          </p>
          <p className="text-muted-foreground">{issue.description}</p>
          {issue.location && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              Location: {issue.location}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * Formats issue type from snake_case to human readable.
 */
function formatIssueType(type: StructuralIssue["type"]): string {
  const typeMap: Record<StructuralIssue["type"], string> = {
    weak_base: "Weak Base",
    cantilever: "Cantilever",
    floating_brick: "Floating Brick",
    unstable_joint: "Unstable Joint",
    other: "Other Issue",
  };
  return typeMap[type] || type;
}
