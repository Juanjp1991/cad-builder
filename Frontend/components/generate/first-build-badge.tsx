/**
 * FirstBuildBadge component.
 * Displays a blue badge indicating First-Build Mode is active.
 * Clicking the badge opens a modal with explanation.
 */

"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Badge component indicating First-Build Mode is active.
 * Shows explanation modal when clicked.
 */
export function FirstBuildBadge(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Badge
        className={cn(
          "cursor-pointer",
          "bg-blue-100 text-blue-800 hover:bg-blue-200",
          "border-blue-200"
        )}
        onClick={() => setIsModalOpen(true)}
        role="button"
        aria-label="First-Build Mode active. Click for more information."
      >
        <Sparkles className="size-3 mr-1" />
        First-Build Mode - Simplified for success
      </Badge>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-blue-600" />
              First-Build Mode
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              We&apos;re generating a simpler design to help ensure your first
              build is successful!
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Fewer layers (max 5) for easier assembly</li>
              <li>Larger bricks that are easier to handle</li>
              <li>Stable structures without tricky overhangs</li>
            </ul>
            <p className="text-sm">
              After you complete your first build, you&apos;ll unlock Advanced
              Mode for more complex designs.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
