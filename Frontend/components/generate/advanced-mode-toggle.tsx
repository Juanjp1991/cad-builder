/**
 * AdvancedModeToggle component.
 * Toggle switch for enabling Advanced Mode (disabling First-Build Guarantee).
 */

"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

/**
 * Props for AdvancedModeToggle component.
 */
interface AdvancedModeToggleProps {
  /** Whether Advanced Mode is currently enabled */
  enabled: boolean;
  /** Callback when toggle state changes */
  onChange: (enabled: boolean) => void;
  /** Whether the user is in first-build status (shows warning if enabled) */
  isFirstBuild: boolean;
}

/**
 * Toggle component for switching between First-Build Mode and Advanced Mode.
 * Shows a warning when first-time users enable Advanced Mode.
 */
export function AdvancedModeToggle({
  enabled,
  onChange,
  isFirstBuild,
}: AdvancedModeToggleProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <Switch
        id="advanced-mode"
        checked={enabled}
        onCheckedChange={onChange}
      />
      <div className="flex flex-col">
        <Label htmlFor="advanced-mode" className="text-sm font-medium">
          Advanced Mode
        </Label>
        {isFirstBuild && enabled && (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="size-3" />
            Complex models may be harder to build
          </span>
        )}
      </div>
    </div>
  );
}
