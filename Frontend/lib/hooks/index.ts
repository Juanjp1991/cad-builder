/**
 * Export all custom hooks.
 */

// First-Build Guarantee hook (Story 2.5)
// Used to check if user is a first-time builder for First-Build Guarantee feature.
// Epic 5 (Build Completion) should call setFirstBuildComplete() when user finishes first build.
export { useFirstBuild } from "./use-first-build";

// Version History hook (Linear History feature)
// Provides version navigation, regeneration, and history tracking functionality.
export { useVersionHistory } from "./use-version-history";
