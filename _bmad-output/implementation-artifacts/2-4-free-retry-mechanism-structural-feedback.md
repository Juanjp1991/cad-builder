# Story 2.4: Free Retry Mechanism & Structural Feedback

Status: done

## Story

As a user,
I want to regenerate a model if it doesn't match my expectations (up to 3 free retries) and see if it has structural issues,
So that I can iterate on designs without penalty and know if my model is stable before building.

## Acceptance Criteria

1. **Given** a model has been generated (from Story 2.1 or 2.2)
   **When** the user clicks "Regenerate" button
   **Then** the same prompt/images are sent to the backend agents again via A2A

2. **And** the Zustand `useGenerationStore` tracks retry count (max 3)

3. **And** the UI shows "Try 2 of 3" or "Final try" indicator

4. **And** after 3 retries, the button changes to "Start Fresh" (clears prompt, resets count)

5. **And** each retry generates a NEW model (backend agents create different design)

6. **And** when the backend returns a model, it includes structural analysis metadata:
   - Buildability score (0-100)
   - Issues found (e.g., "Weak base layer", "Cantilever detected")
   - Recommendations (e.g., "Add support bricks here")

7. **And** if buildability score <70, a yellow warning badge appears: "Structural concerns - review before building"

8. **And** if buildability score >=70, a green badge appears: "Structurally sound"

9. **And** user can tap the badge to see detailed structural feedback in a modal

10. **And** structural feedback is stored with the model via Zustand persist middleware (localStorage)

11. **And** retry count resets when user starts a new generation

## Tasks / Subtasks

- [x] Task 1: Enhance GeneratedModel type with structural feedback (AC: #6)
  - [x] Update `/Frontend/lib/types.ts` to add `StructuralAnalysis` interface
  - [x] Add `structuralAnalysis` optional field to `GeneratedModel` type
  - [x] Define `buildabilityScore: number` (0-100)
  - [x] Define `issues: StructuralIssue[]` array with `type`, `severity`, `description`
  - [x] Define `recommendations: string[]` array

- [x] Task 2: Update API client to parse structural feedback (AC: #6)
  - [x] Modify `/Frontend/lib/api.ts` `generateLegoModel()` to extract structural metadata
  - [x] Parse backend response artifacts for buildability data
  - [x] Handle missing structural data gracefully (default to null)
  - [x] Add unit tests for structural data parsing

- [x] Task 3: Implement "Start Fresh" button logic (AC: #4)
  - [x] Update `generation-result.tsx` to show "Start Fresh" when `remainingRetries <= 0`
  - [x] Create `handleStartFresh()` function that calls `reset()` store action
  - [x] Navigate user back to prompt input or clear current state
  - [x] Add "Start Fresh" button variant (primary style since it's the only option)

- [x] Task 4: Improve retry count display (AC: #3)
  - [x] Create `RetryIndicator` component showing "Try X of 3"
  - [x] Show "Final try" badge when `retryCount === 2` (0-indexed)
  - [x] Add visual emphasis (amber color) for final retry warning
  - [x] Position indicator in generation result UI header

- [x] Task 5: Create StructuralFeedbackBadge component (AC: #7, #8)
  - [x] Create `/Frontend/components/generate/structural-feedback-badge.tsx`
  - [x] Display green badge "Structurally sound" when score >= 70
  - [x] Display yellow/amber badge "Structural concerns" when score < 70
  - [x] Make badge clickable to open modal
  - [x] Use Shadcn/ui Badge component with custom colors
  - [x] Add aria-label for accessibility

- [x] Task 6: Create StructuralFeedbackModal component (AC: #9)
  - [x] Create `/Frontend/components/generate/structural-feedback-modal.tsx`
  - [x] Use Shadcn/ui Dialog component
  - [x] Display buildability score as progress bar or gauge
  - [x] List all issues with severity icons (warning/error)
  - [x] List recommendations as actionable tips
  - [x] Add "Got it" or "Close" button
  - [x] Handle empty issues/recommendations gracefully

- [x] Task 7: Integrate structural feedback into GenerationResult (AC: #7, #8, #9)
  - [x] Import StructuralFeedbackBadge into `generation-result.tsx`
  - [x] Position badge near model info section
  - [x] Pass structural analysis data to badge component
  - [x] Wire up modal open/close state
  - [x] Only show badge when structural data is available

- [x] Task 8: Update useGenerationStore for persistence (AC: #10)
  - [x] Ensure `model.structuralAnalysis` is included in persist partialize (already handled via model persistence)
  - [x] Verify structural data survives page refresh
  - [x] Add store test for structural feedback persistence

- [x] Task 9: Add comprehensive unit tests (AC: all)
  - [x] Test `RetryIndicator` displays correct try count (8 tests)
  - [x] Test `StructuralFeedbackBadge` shows correct badge color (10 tests)
  - [x] Test `StructuralFeedbackModal` renders issues and recommendations (11 tests)
  - [x] Test "Start Fresh" button resets state correctly
  - [x] Test structural data parsing from API response (3 tests in lego-api.test.ts)
  - [x] Test retry count resets on new prompt

## Dev Notes

### Key Architecture Decisions

1. **Leverage Existing Retry Infrastructure**: The `useGenerationStore.ts` already has `retryCount`, `maxRetries`, and `incrementRetry()` - extend rather than rebuild
2. **Backend Integration**: Structural analysis comes from backend coder agent's validation - frontend displays only
3. **Progressive Enhancement**: Show structural feedback only when available (backend may not always return it)
4. **Accessibility First**: All badges and modals must be keyboard accessible per WCAG AA
5. **Design System Consistency**: Use Shadcn/ui Badge and Dialog components with Lego color palette

### Previous Story Learnings (2.1, 2.2, 2.3)

From completed stories:
- **Store Pattern**: `useGenerationStore.ts` already tracks `retryCount`, `maxRetries`, `incrementRetry()`
- **API Pattern**: `generateLegoModel()` in `/lib/lego-api.ts` polls A2A tasks and extracts artifacts
- **Component Pattern**: `generation-result.tsx` already shows "Regenerate (X left)" button
- **Modal Pattern**: Use Shadcn/ui Dialog for modals (consistent with design system)
- **Badge Pattern**: Use Shadcn/ui Badge component with variant props
- **Error Handling**: Error boundaries wrap major features
- **Test Pattern**: Mock external dependencies, use `vi.mock()`, test with `waitFor` for async

### Technology Stack (CRITICAL - Use Exact Versions)

From `/Frontend/package.json`:
- **React**: `react@19.2.1`
- **Zustand**: `zustand@5.x` with persist middleware
- **Shadcn/ui**: Badge, Dialog, Button components already installed
- **Framer Motion**: `framer-motion@12.23.24` for animations
- **Lucide React**: `lucide-react@0.554.0` for icons
- **TypeScript**: 5.x with strict mode

### Structural Analysis Type Definition

```typescript
// Add to /Frontend/lib/types.ts

export interface StructuralIssue {
  type: 'weak_base' | 'cantilever' | 'floating_brick' | 'unstable_joint' | 'other';
  severity: 'warning' | 'error';
  description: string;
  location?: string; // Optional: "Layer 3, brick at (2,4)"
}

export interface StructuralAnalysis {
  buildabilityScore: number; // 0-100
  issues: StructuralIssue[];
  recommendations: string[];
}

// Update GeneratedModel interface
export interface GeneratedModel {
  modelUrl: string;
  taskId: string;
  brickCount?: number;
  dimensions?: { width: number; height: number; depth: number };
  structuralAnalysis?: StructuralAnalysis; // NEW
  createdAt: string;
}
```

### Backend Response Structure (Expected)

The backend coder agent performs structural validation. Expected response format:
```typescript
// From A2A task artifacts or message parts
{
  structural_analysis: {
    buildability_score: 85,
    issues: [
      {
        type: "cantilever",
        severity: "warning",
        description: "Brick at layer 5 extends 3 studs without support"
      }
    ],
    recommendations: [
      "Add support brick under extended section",
      "Consider larger base layer for stability"
    ]
  }
}
```

**Note**: Backend uses `snake_case`, frontend converts to `camelCase`.

### Retry Logic Flow

```
User clicks "Regenerate"
    ↓
Check remainingRetries > 0?
    ↓ YES                    ↓ NO
incrementRetry()             Show "Start Fresh" button only
    ↓                        ↓
Call generateLegoModel()     User clicks "Start Fresh"
with SAME prompt/images      ↓
    ↓                        reset() store action
Backend generates NEW        ↓
model variant                Navigate to prompt input
    ↓
completeGeneration(model)
with structural feedback
```

### StructuralFeedbackBadge Component Pattern

```tsx
// /Frontend/components/generate/structural-feedback-badge.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import type { StructuralAnalysis } from "@/lib/types";

interface StructuralFeedbackBadgeProps {
  analysis: StructuralAnalysis;
  onClick: () => void;
}

export function StructuralFeedbackBadge({
  analysis,
  onClick,
}: StructuralFeedbackBadgeProps): React.JSX.Element {
  const isSound = analysis.buildabilityScore >= 70;

  return (
    <Badge
      variant={isSound ? "default" : "secondary"} // Or custom variants
      className={cn(
        "cursor-pointer",
        isSound
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-amber-100 text-amber-800 hover:bg-amber-200"
      )}
      onClick={onClick}
      role="button"
      aria-label={`Buildability score: ${analysis.buildabilityScore}. ${isSound ? "Structurally sound" : "Structural concerns"}. Click for details.`}
    >
      {isSound ? (
        <>
          <ShieldCheck className="size-3 mr-1" />
          Structurally sound
        </>
      ) : (
        <>
          <AlertTriangle className="size-3 mr-1" />
          Structural concerns
        </>
      )}
    </Badge>
  );
}
```

### RetryIndicator Component Pattern

```tsx
// In generation-result.tsx or separate component

function RetryIndicator({ retryCount, maxRetries }: { retryCount: number; maxRetries: number }): React.JSX.Element {
  const currentTry = retryCount + 1; // 1-indexed for display
  const isFinalTry = retryCount === maxRetries - 1;

  return (
    <div className={cn(
      "text-xs font-medium",
      isFinalTry ? "text-amber-600" : "text-muted-foreground"
    )}>
      {isFinalTry ? (
        <span className="flex items-center gap-1">
          <AlertTriangle className="size-3" />
          Final try
        </span>
      ) : (
        <span>Try {currentTry} of {maxRetries}</span>
      )}
    </div>
  );
}
```

### File Locations

**New Files:**
- `/Frontend/components/generate/structural-feedback-badge.tsx`
- `/Frontend/components/generate/structural-feedback-badge.test.tsx`
- `/Frontend/components/generate/structural-feedback-modal.tsx`
- `/Frontend/components/generate/structural-feedback-modal.test.tsx`
- `/Frontend/components/generate/retry-indicator.tsx` (optional, could be inline)

**Modified Files:**
- `/Frontend/lib/types.ts` - Add StructuralAnalysis types
- `/Frontend/lib/lego-api.ts` - Parse structural data from response
- `/Frontend/lib/lego-api.test.ts` - Add tests for structural parsing
- `/Frontend/lib/stores/useGenerationStore.ts` - Ensure persistence includes structural data
- `/Frontend/components/generate/generation-result.tsx` - Integrate badge, modal, retry indicator, "Start Fresh"

### Existing Code to Leverage

From `/Frontend/lib/stores/useGenerationStore.ts`:
```typescript
// Already implemented:
retryCount: number;
maxRetries: number; // Set to 3
incrementRetry: () => boolean; // Returns true if retry allowed
reset: () => void; // Clears state
```

From `/Frontend/components/generate/generation-result.tsx`:
```typescript
// Already shows retry info:
const remainingRetries = maxRetries - retryCount;
// ...
<Button onClick={onRegenerate} disabled={remainingRetries <= 0}>
  Regenerate ({remainingRetries} left)
</Button>
```

From `/Frontend/lib/lego-api.ts`:
```typescript
// Parse STL artifacts - extend to parse structural metadata
const stlArtifact = artifacts.find(a => a.file?.mimeType === "model/stl");
// ADD: Parse structural analysis from metadata artifacts
```

### Design System Integration

Colors (from `globals.css` and design spec):
- Green (structurally sound): `bg-green-100 text-green-800` (Tailwind)
- Amber (structural concerns): `bg-amber-100 text-amber-800` (Tailwind)
- Score gauge: Use Progress component from Shadcn/ui

Icons (Lucide):
- `ShieldCheck` - For "Structurally sound" badge
- `AlertTriangle` - For "Structural concerns" badge and final try warning
- `RotateCcw` - Existing, for regenerate
- `RefreshCw` - Alternative for "Start Fresh"

### Testing Strategy

**What to Test:**
1. RetryIndicator shows correct try number (1, 2, 3)
2. RetryIndicator shows "Final try" on last attempt
3. StructuralFeedbackBadge shows green when score >= 70
4. StructuralFeedbackBadge shows amber when score < 70
5. StructuralFeedbackModal lists all issues
6. StructuralFeedbackModal lists all recommendations
7. "Start Fresh" button appears after 3 retries
8. "Start Fresh" calls reset() and clears state
9. Structural data persists in store
10. API parses structural data correctly

**Test Structure:**
```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('StructuralFeedbackBadge', () => {
  it('shows green badge when score >= 70', () => {
    render(<StructuralFeedbackBadge
      analysis={{ buildabilityScore: 85, issues: [], recommendations: [] }}
      onClick={() => {}}
    />);
    expect(screen.getByText('Structurally sound')).toBeInTheDocument();
  });

  it('shows amber badge when score < 70', () => {
    render(<StructuralFeedbackBadge
      analysis={{ buildabilityScore: 55, issues: [], recommendations: [] }}
      onClick={() => {}}
    />);
    expect(screen.getByText('Structural concerns')).toBeInTheDocument();
  });
});
```

### Accessibility Requirements (WCAG AA)

- Badge has `role="button"` and descriptive `aria-label`
- Modal uses Shadcn/ui Dialog which handles focus trap and escape key
- Color is not sole indicator (icons accompany text)
- Touch targets >= 44px for mobile
- Keyboard navigable: Tab to badge, Enter to open modal

### Project Structure Notes

Per Architecture:
- New components in `/Frontend/components/generate/`
- Tests co-located: `*.tsx` + `*.test.tsx`
- Types in `/Frontend/lib/types.ts`
- Store updates in `/Frontend/lib/stores/`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Client Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling Patterns]
- [Source: _bmad-output/project-context.md#Testing Patterns]
- [Source: Frontend/lib/stores/useGenerationStore.ts] - Existing retry logic
- [Source: Frontend/components/generate/generation-result.tsx] - Existing result UI
- [Source: Frontend/lib/lego-api.ts] - API client to extend
- [Source: Shadcn/ui Badge Documentation](https://ui.shadcn.com/docs/components/badge)
- [Source: Shadcn/ui Dialog Documentation](https://ui.shadcn.com/docs/components/dialog)

### Integration Points

**Consumes from Story 2.1/2.2/2.3:**
- Generated model data from A2A completion
- 3D model viewer for visual context
- Generation store state

**Enables for Story 2.5+:**
- First-Build Guarantee builds on structural feedback (simpler = higher score)
- Error handling (Story 2.6) handles retry failures

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- All 9 tasks completed successfully
- 46 unit tests passing
- Build passes with no TypeScript errors
- Structural analysis types and parsing implemented
- UI components for retry indicator, badge, and modal created
- Full integration with GenerationResult component

### File List

**New Files Created:**
- `/Frontend/lib/types.test.ts` - Type definition tests
- `/Frontend/lib/stores/useGenerationStore.test.ts` - Store persistence and retry tests
- `/Frontend/components/ui/badge.tsx` - Shadcn/ui Badge component
- `/Frontend/components/generate/retry-indicator.tsx` - Retry indicator component
- `/Frontend/components/generate/retry-indicator.test.tsx` - RetryIndicator tests (8 tests)
- `/Frontend/components/generate/structural-feedback-badge.tsx` - Structural feedback badge
- `/Frontend/components/generate/structural-feedback-badge.test.tsx` - Badge tests (10 tests)
- `/Frontend/components/generate/structural-feedback-modal.tsx` - Structural feedback modal
- `/Frontend/components/generate/structural-feedback-modal.test.tsx` - Modal tests (11 tests)
- `/Frontend/components/generate/generation-result.test.tsx` - GenerationResult tests (Start Fresh, retry)

**Modified Files:**
- `/Frontend/lib/types.ts` - Added StructuralAnalysis, StructuralIssue interfaces
- `/Frontend/lib/api.ts` - Added parseStructuralAnalysis helper, updated generateLegoModel
- `/Frontend/__tests__/lego-api.test.ts` - Added 3 structural analysis tests
- `/Frontend/components/generate/generation-result.tsx` - Integrated all new components
- `/Frontend/app/generate/page.tsx` - Added onStartFresh prop
- `/_bmad-output/implementation-artifacts/sprint-status.yaml` - Updated story status

## Change Log

- 2026-01-07: Story created by create-story workflow
- 2026-01-07: All tasks implemented by dev-story workflow
- 2026-01-07: Code review completed - fixed 1 HIGH, 3 MEDIUM, 3 LOW issues. Added missing tests, updated badge text, clarified AC #10. Status → done
