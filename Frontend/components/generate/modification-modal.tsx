"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";

interface ModificationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (modificationPrompt: string) => void;
    originalPrompt?: string;
}

export function ModificationModal({
    open,
    onOpenChange,
    onSubmit,
    originalPrompt,
}: ModificationModalProps): React.JSX.Element {
    const [modificationPrompt, setModificationPrompt] = useState("");

    const handleSubmit = (): void => {
        if (modificationPrompt.trim()) {
            onSubmit(modificationPrompt.trim());
            setModificationPrompt("");
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="size-5" />
                        Modify Your Model
                    </DialogTitle>
                    <DialogDescription>
                        Describe how you'd like to modify your current model.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {originalPrompt && (
                        <div className="rounded-lg bg-muted p-3">
                            <p className="text-xs text-muted-foreground mb-1">Original:</p>
                            <p className="text-sm">&ldquo;{originalPrompt}&rdquo;</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="modification" className="text-sm font-medium">
                            What would you like to change?
                        </label>
                        <Textarea
                            id="modification"
                            placeholder="e.g., 'make it taller', 'add wings', 'make it wider', 'change the color to red'"
                            value={modificationPrompt}
                            onChange={(e) => setModificationPrompt(e.target.value)}
                            className="min-h-[100px]"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.ctrlKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            Tip: Press Ctrl+Enter to submit
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!modificationPrompt.trim()}
                    >
                        <Pencil className="size-4 mr-2" />
                        Modify Model
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
