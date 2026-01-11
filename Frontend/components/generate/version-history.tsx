"use client";

/**
 * VersionHistory component - Displays version history navigation for generated models.
 * Shows version timeline, navigation buttons, and regenerate functionality.
 */

import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVersionHistory } from "@/lib/hooks";
import { cn } from "@/lib/utils";

interface VersionHistoryProps {
    taskId: string | null;
    onVersionChange?: (stlUrl: string | null) => void;
    className?: string;
}

/**
 * Version badge showing version number and type.
 */
function VersionBadge({
    versionId,
    versionType,
    approved,
    isActive,
    onClick,
}: {
    versionId: string;
    versionType: string;
    approved: boolean;
    isActive: boolean;
    onClick: () => void;
}) {
    const typeLabels: Record<string, string> = {
        generation: "Draft",
        "auto-refine": "Refined",
        regenerate: "Regenerated",
        modification: "Modified",
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
        >
            {approved ? (
                <CheckCircle2 className="size-3" />
            ) : (
                <Clock className="size-3" />
            )}
            <span>{versionId}</span>
            <span className="text-[10px] opacity-75">
                {typeLabels[versionType] || versionType}
            </span>
        </button>
    );
}

export function VersionHistory({
    taskId,
    onVersionChange,
    className,
}: VersionHistoryProps) {
    const {
        history,
        currentVersion,
        currentStlUrl,
        isLoading,
        isRegenerating,
        versionCount,
        currentVersionIndex,
        canGoToPrevious,
        canGoToNext,
        goToVersion,
        goToPrevious,
        goToNext,
        regenerate,
        getVersionStlUrl,
    } = useVersionHistory(taskId);

    // Notify parent when version changes
    React.useEffect(() => {
        if (onVersionChange) {
            onVersionChange(currentStlUrl);
        }
    }, [currentStlUrl, onVersionChange]);

    if (!taskId || !history || versionCount === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-card border rounded-lg p-3 space-y-3",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Version History</h3>
                <span className="text-xs text-muted-foreground">
                    {currentVersionIndex + 1} of {versionCount}
                </span>
            </div>

            {/* Version Timeline */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {history.versions.map((version) => (
                    <VersionBadge
                        key={version.id}
                        versionId={version.id}
                        versionType={version.versionType}
                        approved={version.approved}
                        isActive={version.id === history.currentVersionId}
                        onClick={() => goToVersion(version.id)}
                    />
                ))}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevious}
                        disabled={!canGoToPrevious || isLoading}
                        aria-label="Previous version"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNext}
                        disabled={!canGoToNext || isLoading}
                        aria-label="Next version"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>

                {/* Regenerate Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerate}
                    disabled={isRegenerating || isLoading}
                    aria-label="Regenerate this version"
                >
                    <RefreshCw className={cn("size-4 mr-1.5", isRegenerating && "animate-spin")} />
                    {isRegenerating ? "Regenerating..." : "Regenerate"}
                </Button>
            </div>

            {/* Current Version Info */}
            {currentVersion && (
                <div className="text-xs text-muted-foreground border-t pt-2">
                    <div className="flex items-center justify-between">
                        <span>
                            {currentVersion.approved ? "✓ Approved" : "○ Draft"}
                        </span>
                        <span className="truncate max-w-[200px]" title={currentVersion.prompt}>
                            "{currentVersion.prompt.slice(0, 30)}..."
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
