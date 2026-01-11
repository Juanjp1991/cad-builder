"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    getTaskHistory,
    regenerateTask,
    setTaskVersion,
    pollTask,
    getFileUrl,
    type ModelHistory,
    type ModelVersion,
    TaskState,
} from "@/lib/api";

/**
 * Hook for managing model version history.
 * Provides state for the current history, methods to navigate versions,
 * and regenerate functionality.
 */
export function useVersionHistory(taskId: string | null) {
    const [history, setHistory] = useState<ModelHistory | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollCountRef = useRef(0);

    // Fetch history when taskId changes
    useEffect(() => {
        if (!taskId) {
            setHistory(null);
            return;
        }

        let cancelled = false;

        async function fetchHistory() {
            setIsLoading(true);
            setError(null);
            try {
                const historyData = await getTaskHistory(taskId);
                if (!cancelled) {
                    setHistory(historyData);
                }
            } catch (err) {
                if (!cancelled) {
                    const errorMessage = err instanceof Error ? err.message : "Failed to fetch history";
                    setError(errorMessage);
                    console.error("Failed to fetch version history:", err);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchHistory();

        // Auto-poll for 30 seconds to catch background refine versions
        // BUT preserve user's current version selection
        pollCountRef.current = 0;
        pollIntervalRef.current = setInterval(async () => {
            pollCountRef.current += 1;
            // Poll every 3 seconds for 30 seconds (10 polls)
            if (pollCountRef.current >= 10) {
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                }
                return;
            }

            try {
                const historyData = await getTaskHistory(taskId);
                if (!cancelled) {
                    // Only update versions list, preserve user's current version selection
                    setHistory(prev => {
                        if (!prev) return historyData;
                        return {
                            ...historyData,
                            currentVersionId: prev.currentVersionId,
                        };
                    });
                }
            } catch {
                // Silently ignore poll errors
            }
        }, 3000);

        return () => {
            cancelled = true;
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };

    }, [taskId]);

    // Get current version
    const currentVersion = history?.versions.find(
        (v) => v.id === history.currentVersionId
    ) ?? null;

    // Get the STL URL for the current version
    const currentStlUrl = currentVersion?.stlPath
        ? getFileUrl(`/download/${currentVersion.stlPath.split("/").pop()}`)
        : null;

    // Get the STL URL for a specific version
    const getVersionStlUrl = useCallback((version: ModelVersion): string | null => {
        if (!version.stlPath) return null;
        return getFileUrl(`/download/${version.stlPath.split("/").pop()}`) ?? null;
    }, []);

    // Navigate to a specific version
    const goToVersion = useCallback(
        async (versionId: string) => {
            if (!taskId) return;

            setIsLoading(true);
            setError(null);
            try {
                const response = await setTaskVersion(taskId, versionId);
                if (response.success && history) {
                    setHistory({
                        ...history,
                        currentVersionId: response.currentVersionId,
                    });
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to switch version";
                setError(errorMessage);
                console.error("Failed to switch version:", err);
            } finally {
                setIsLoading(false);
            }
        },
        [taskId, history]
    );

    // Navigate to previous version
    const goToPrevious = useCallback(() => {
        if (!history || history.versions.length < 2) return;

        const currentIndex = history.versions.findIndex(
            (v) => v.id === history.currentVersionId
        );
        if (currentIndex > 0) {
            goToVersion(history.versions[currentIndex - 1].id);
        }
    }, [history, goToVersion]);

    // Navigate to next version
    const goToNext = useCallback(() => {
        if (!history || history.versions.length < 2) return;

        const currentIndex = history.versions.findIndex(
            (v) => v.id === history.currentVersionId
        );
        if (currentIndex < history.versions.length - 1) {
            goToVersion(history.versions[currentIndex + 1].id);
        }
    }, [history, goToVersion]);

    // Regenerate the current version
    const regenerate = useCallback(async () => {
        if (!taskId) return;

        setIsRegenerating(true);
        setError(null);
        try {
            // Start regeneration
            await regenerateTask(taskId);

            // Poll until complete
            await pollTask(taskId);

            // Refresh history
            const updatedHistory = await getTaskHistory(taskId);
            setHistory(updatedHistory);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to regenerate";
            setError(errorMessage);
            console.error("Failed to regenerate:", err);
        } finally {
            setIsRegenerating(false);
        }
    }, [taskId]);

    // Refresh history manually
    const refreshHistory = useCallback(async () => {
        if (!taskId) return;

        try {
            const historyData = await getTaskHistory(taskId);
            setHistory(historyData);
        } catch (err) {
            console.error("Failed to refresh history:", err);
        }
    }, [taskId]);

    // Check if we can navigate
    const canGoToPrevious =
        history !== null &&
        history.versions.length > 1 &&
        history.versions.findIndex((v) => v.id === history.currentVersionId) > 0;

    const canGoToNext =
        history !== null &&
        history.versions.length > 1 &&
        history.versions.findIndex((v) => v.id === history.currentVersionId) <
        history.versions.length - 1;

    return {
        history,
        currentVersion,
        currentStlUrl,
        isLoading,
        isRegenerating,
        error,
        versionCount: history?.versions.length ?? 0,
        currentVersionIndex: history?.versions.findIndex(
            (v) => v.id === history?.currentVersionId
        ) ?? -1,
        canGoToPrevious,
        canGoToNext,
        goToVersion,
        goToPrevious,
        goToNext,
        regenerate,
        refreshHistory,
        getVersionStlUrl,
    };
}
