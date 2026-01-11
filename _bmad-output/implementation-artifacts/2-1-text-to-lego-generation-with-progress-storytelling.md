# Story 2.1: Text-to-Lego Generation with Progress Storytelling

Status: done

## Story

As a user,
I want to generate a Lego model from a text description,
So that I can bring my ideas to life as buildable Lego creations.

## Acceptance Criteria

**Given** the user is on the `/app/generate/page.tsx` with text mode selected
**When** the user enters a text prompt (e.g., "a small red dragon") and clicks "Generate"
**Then** the frontend calls the extended `generateLegoModel('text', prompt, [], inventory, options)` function from `/lib/api.ts`
**And** the API client sends a request to the **existing backend A2A endpoint** (`POST /v1/message:send`) with the prompt
**And** the **backend multi-agent system** (Control Flow → Designer → Coder → Renderer agents) processes the request
**And** the frontend displays progress storytelling UI: "Imagining your creation..." → "Finding the perfect design..." → "Building your model..."
**And** the frontend polls the task status via `GET /v1/tasks/{taskId}` using the A2A protocol pattern
**And** when the backend agents complete, the frontend receives:
  - STL file URL (from backend renderer agent)
  - Model metadata (brick count, dimensions)
  - Task completion status
**And** the generated STL file is cached in IndexedDB `generationCache` table (7-day TTL)
**And** the user sees the 3D model loaded in the viewer (Story 2.3 dependency)
**And** progress storytelling transitions to "Done!" with a completion animation
**And** the entire process completes in <60 seconds (NFR1)

## Technical Integration Notes

- Frontend does NOT generate models - it calls existing backend agents
- Backend agents already implemented: `/Backend/sub_agents/` (designer.py, coder.py, renderer.py)
- A2A protocol: sendMessage → pollTask → extract STL artifact
- No changes to backend agent logic required

## Tasks / Subtasks

- [x] Create `/app/generate/page.tsx` route (AC: Given - page exists)
  - [x] Setup basic page layout with header and main content area
  - [x] Add "use client" directive for client-side interactivity
  - [x] Configure route metadata (title, description)
- [x] Implement text prompt input component (AC: When - user enters prompt)
  - [x] Create `/components/generate/prompt-input.tsx` component
  - [x] Add text input with placeholder "Describe what you want to build..."
  - [x] Add "Generate" button (primary yellow, disabled when empty)
  - [x] Handle form submission
  - [x] Add example prompts for user inspiration
- [x] Extend `/lib/api.ts` with `generateLegoModel()` function (AC: Then - API call)
  - [x] Already implemented in Epic 1 - function exists in /lib/api.ts
  - [x] A2A protocol: sendMessage → pollTask pattern working
  - [x] TypeScript types defined for request/response
- [x] Implement progress storytelling UI (AC: Then - progress UI)
  - [x] Create `/components/generate/generation-progress.tsx` component
  - [x] Add progress stages: "Imagining..." → "Finding..." → "Building..."
  - [x] Animate transitions between stages using Framer Motion
  - [x] Show elapsed time indicator with progress bar
  - [x] Stage icons and visual indicators
- [x] Implement Zustand `useGenerationStore` for state management (AC: State)
  - [x] Create `/lib/stores/useGenerationStore.ts`
  - [x] Track generation status (idle, generating, completed, failed)
  - [x] Store current prompt, task ID, progress stage
  - [x] Store generated model data (STL URL, metadata)
  - [x] Retry count tracking (max 3 retries)
  - [x] Persist middleware for session continuity
- [x] Cache generated models in IndexedDB (AC: Then - cached)
  - [x] Extend `/lib/db.ts` with generationCache operations (already configured)
  - [x] Implement cache write on successful generation
  - [x] Add 7-day TTL logic for cache expiration
- [x] Display completion state with 3D viewer placeholder (AC: Then - model loaded)
  - [x] Create `/components/generate/generation-result.tsx` component
  - [x] Show STL file URL for model viewer (Story 2.3 will implement actual viewer)
  - [x] Add "Start Building", "Regenerate", "Modify" action buttons
  - [x] Show model metadata (brick count, task ID)
  - [x] Download STL button
- [x] Add error handling and user feedback (AC: Error states)
  - [x] Handle network errors with retry option
  - [x] Handle backend errors with user-friendly messages
  - [x] Visual error state with retry button
- [x] Write unit tests
  - [x] Test PromptInput component rendering and interactions
  - [x] Test `useGenerationStore` state transitions
  - [x] Test retry count tracking
  - [x] Test reset functionality

## Dev Notes

**Key Architecture Decisions:**
1. **A2A Protocol Pattern**: Use existing `sendMessage` → `pollTask` pattern from `/lib/api.ts`
2. **State Management**: Zustand store with persist middleware for generation state
3. **Progress Storytelling**: UX requirement - animated stages make wait feel shorter
4. **3D Viewer**: Story 2.3 will implement actual viewer; this story shows placeholder/URL

**Dependencies:**
- Epic 1 foundation (Next.js, Zustand, Dexie.js, design system)
- Backend A2A endpoint already working
- Story 2.3 will add 3D viewer component

**File Locations:**
- Page: `/Frontend/app/generate/page.tsx`
- Components: `/Frontend/components/generate/*.tsx`
- Store: `/Frontend/lib/stores/useGenerationStore.ts`
- API: `/Frontend/lib/api.ts` (extend existing)
- DB: `/Frontend/lib/db.ts` (extend existing)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Next.js build passes successfully with `/generate` route
- All 15 unit tests pass in generate.test.tsx
- TypeScript types properly inferred from existing api.ts and types.ts

### Completion Notes List

1. **Page Route Created**: `/app/generate/page.tsx` with full generation workflow
2. **Components Created**:
   - `prompt-input.tsx` - Text input with example prompts
   - `generation-progress.tsx` - Animated progress storytelling UI
   - `generation-result.tsx` - Result display with action buttons
   - `index.ts` - Component exports
3. **Zustand Store**: `useGenerationStore.ts` with:
   - Status tracking (idle, generating, completed, failed)
   - Stage tracking (imagining, finding, building, completed)
   - Retry count management (max 3)
   - Persist middleware for session continuity
4. **UX Features**:
   - Progress storytelling with animated stages
   - Elapsed time indicator
   - Example prompts for user inspiration
   - Error states with retry option
   - Download STL button
5. **Integration**: Uses existing `generateLegoModel()` from Epic 1
6. **3D Viewer**: Placeholder - Story 2.3 will implement actual viewer

### File List

**New Files:**
- Frontend/app/generate/page.tsx
- Frontend/components/generate/prompt-input.tsx
- Frontend/components/generate/generation-progress.tsx
- Frontend/components/generate/generation-result.tsx
- Frontend/components/generate/error-boundary.tsx
- Frontend/components/generate/index.ts
- Frontend/lib/stores/useGenerationStore.ts
- Frontend/__tests__/generate.test.tsx

**Modified Files (Code Review):**
- Frontend/app/generate/page.tsx (timeout, cache lookup, error boundary, aria labels)
- Frontend/components/generate/generation-progress.tsx (aria labels, removed unused var)
- Frontend/components/generate/generation-result.tsx (aria labels, fixed fallback)
- Frontend/lib/stores/useGenerationStore.ts (retryCount reset logic)

### Change Log

- 2026-01-07: Implemented text-to-LEGO generation with progress storytelling (Story 2.1)
- 2026-01-07: Code review fixes applied:
  - Removed unused imports (TaskState, getTask)
  - Replaced fake stage timeouts with elapsed-time-based progression
  - Added 60-second timeout handling (NFR1)
  - Added cache lookup before generation
  - Removed console.log from handleModify
  - Added GenerationErrorBoundary component
  - Fixed download link behavior (removed target="_blank")
  - Reset retryCount on new prompt (not retry)
  - Added aria labels for accessibility
  - Added role="progressbar" to stage indicators
