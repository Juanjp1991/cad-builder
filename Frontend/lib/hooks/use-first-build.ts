/**
 * Custom hook for managing first-build state.
 * Tracks whether the user has completed their first build for First-Build Guarantee feature.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserPreference, setUserPreference } from "@/lib/db";

/**
 * Return type for useFirstBuild hook.
 */
interface UseFirstBuildReturn {
  /** Whether this is the user's first build (defaults to true) */
  isFirstBuild: boolean;
  /** Whether the hook is still loading the preference from IndexedDB */
  isLoading: boolean;
  /** Function to mark the first build as complete (sets isFirstBuild to false) */
  setFirstBuildComplete: () => Promise<void>;
}

/**
 * Custom hook for tracking first-build status.
 *
 * Used for the First-Build Guarantee feature:
 * - When isFirstBuild is true, simpler models are generated
 * - When the user completes their first build, call setFirstBuildComplete()
 * - Subsequent generations will use normal complexity
 *
 * @example
 * ```tsx
 * const { isFirstBuild, isLoading, setFirstBuildComplete } = useFirstBuild();
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <>
 *     {isFirstBuild && <FirstBuildBadge />}
 *     <GenerationForm complexity={isFirstBuild ? 'simple' : 'normal'} />
 *   </>
 * );
 * ```
 */
export function useFirstBuild(): UseFirstBuildReturn {
  const [isFirstBuild, setIsFirstBuild] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkFirstBuild(): Promise<void> {
      try {
        const value = await getUserPreference("isFirstBuild", "true");
        setIsFirstBuild(value === "true");
      } catch (error) {
        console.error("Failed to check first build status:", error);
        // Default to first-build mode on error for safety
        setIsFirstBuild(true);
      } finally {
        setIsLoading(false);
      }
    }

    checkFirstBuild();
  }, []);

  const setFirstBuildComplete = useCallback(async (): Promise<void> => {
    try {
      await setUserPreference("isFirstBuild", "false");
      setIsFirstBuild(false);
    } catch (error) {
      console.error("Failed to mark first build complete:", error);
      // Don't update local state if DB write fails - maintain consistency
      throw error;
    }
  }, []);

  return { isFirstBuild, isLoading, setFirstBuildComplete };
}
