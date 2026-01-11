/**
 * FirstBuildCelebration modal component.
 * Displays a celebration modal when user completes their first build.
 * Informs them that Advanced Mode is now unlocked.
 */

"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles } from "lucide-react";

/**
 * Props for FirstBuildCelebration component.
 */
interface FirstBuildCelebrationProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
}

/**
 * Celebration modal shown when user completes their first build.
 * Announces that Advanced Mode is now unlocked.
 * Triggered by Epic 5 (Build Completion).
 */
export function FirstBuildCelebration({
  open,
  onClose,
}: FirstBuildCelebrationProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="text-center sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="size-8 text-yellow-500" />
            Your First Creation!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-lg text-muted-foreground">
            Congratulations on completing your first Lego build!
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Sparkles className="size-5" />
            <span className="font-semibold">Advanced Mode Unlocked</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You can now generate more complex and challenging designs.
          </p>
        </div>
        <Button onClick={onClose} className="w-full">
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}
