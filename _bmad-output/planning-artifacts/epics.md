---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - '_bmad-output/project-planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/project-planning-artifacts/ux-design-specification.md'
---

# Lego builder python - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Lego builder python, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Model Generation (6 FRs):**
- FR1: Users can generate a Lego model from a text prompt
- FR2: Users can generate a Lego model from an uploaded 2D image
- FR3: Users can regenerate a model with the same prompt (free retry, up to 3x)
- FR4: Users can scale down a generated model when inventory doesn't fully match
- FR5: Users receive feedback if generated model has structural issues
- FR6: System recommends simpler builds for first-time users (First-Build Guarantee)

**Brick Inventory Management (5 FRs):**
- FR7: Users can photograph their brick collection to create an inventory
- FR8: System detects and counts bricks from photographs using resemblance-based matching
- FR9: Users can view their current brick inventory
- FR10: Users can use Quick Start mode without scanning (assumes standard collection)
- FR11: Users can access their inventory across sessions

**Build Instructions (6 FRs):**
- FR12: Users can view layer-by-layer build instructions for any generated model
- FR13: Users can navigate forward and backward through build instruction steps
- FR14: Users can view the current brick required at each step
- FR15: Users can see build progress (e.g., "Step 3 of 12")
- FR16: Users see missing brick count before starting a build
- FR17: Users see missing brick alert during build if specific brick is unavailable

**3D Viewer (3 FRs):**
- FR18: Users can rotate the 3D model
- FR19: Users can zoom in/out on the 3D model
- FR20: Users can see loading states during AI generation

**Design Discovery (3 FRs):**
- FR21: Users can browse template categories (Animals, Vehicles, Buildings)
- FR22: Users can view inventory match percentage for any template
- FR23: Users can start building a template scaled to their inventory

**Build Management (5 FRs):**
- FR24: Users can save an in-progress build for later
- FR25: Users can resume a saved build
- FR26: Users can name their completed creations
- FR27: Users can view a list of their completed builds
- FR28: Users can view celebration feedback upon build completion

**Onboarding (2 FRs):**
- FR29: Users can view onboarding tutorial on first launch
- FR30: Users can skip onboarding and go directly to app

**Application Experience (3 FRs):**
- FR31: Users can install the app as a PWA on mobile devices
- FR32: Users can access saved builds and inventory while offline
- FR33: System shows pre-permission explanation before requesting camera access

**Error Handling (4 FRs):**
- FR34: Users see clear error message when AI generation fails
- FR35: Users see clear error message when brick scanning fails
- FR36: Users see clear error message when 3D rendering fails
- FR37: Users can retry after any error

**Analytics & Tracking (2 FRs):**
- FR38: System tracks device IDs for anonymous user identification
- FR39: System tracks core events (scan, generate, build start, build complete)

### NonFunctional Requirements

**Performance:**
- NFR1: AI Generation Time must be <1 minute (end-to-end: prompt submission → 3D model displayed)
- NFR2: 3D Viewer Frame Rate must achieve 20 fps on 2019+ mid-range devices (Snapdragon 6-series / A12)
- NFR3: First Contentful Paint must be <2 seconds
- NFR4: PWA Lighthouse Score must be >90 (Performance, accessibility, best practices)
- NFR5: Touch Response must provide UI feedback within <100ms on user interactions

**Security (MVP Minimal):**
- NFR6: Data Storage must be local only (IndexedDB); no cloud storage in MVP
- NFR7: User Data must be anonymous; device ID for analytics only
- NFR8: Camera Access used for scanning only; images not stored on servers
- NFR9: API Keys must be secured server-side (Gemini API key not exposed to client)
- NFR10: HTTPS required for all network communication

**Integration:**
- NFR11: Gemini API integration must include rate limiting, response caching, and graceful degradation on failure
- NFR12: PostHog analytics integration must use free tier with device ID tracking and core event logging

**Reliability & Offline Support:**
- NFR13: Offline Access to saved builds and brick inventory must be available
- NFR14: Service Worker must provide PWA caching for offline fallback
- NFR15: Data Persistence via IndexedDB for local storage durability
- NFR16: Error Recovery - all errors must be recoverable with retry option
- NFR17: Generation Caching - generated models must be cached locally to avoid re-generation

**Accessibility (Basic):**
- NFR18: Keyboard Navigation must be available for all interactive elements
- NFR19: Color Contrast must meet WCAG AA contrast ratios (4.5:1 for text)
- NFR20: Touch Targets must be minimum 44px for all interactive elements
- NFR21: Focus States must have visible focus indicators for navigation
- NFR22: Screen Reader support via labels on buttons/icons for assistive technology
- NFR23: Reduced motion CSS media query support required

**Browser Compatibility:**
- NFR24: Chrome 90+ (Primary) - WebGL 2.0, Camera API required
- NFR25: Safari 15+ (Primary) - WebGL 2.0, Camera API, PWA permission handling
- NFR26: Edge 90+ (Secondary) - WebGL 2.0, Camera API
- NFR27: Firefox 90+ (Secondary) - WebGL 2.0, Camera API
- NFR28: Device baseline: 2019+ devices required

### Additional Requirements

**From Architecture:**

- **Starter Template & Frontend Setup:** Architecture specifies using `create-next-app@latest` with TypeScript, Tailwind CSS 4, App Router as the foundation (not a pre-made PWA starter). Manual addition of PWA support via next-pwa, Shadcn/ui design system, Three.js for 3D rendering, and domain-specific libraries. This is documented as "Story 0" setup task before feature development.

- **Technology Stack Requirements:**
  - Frontend: Next.js 16+ with App Router, React 19, TypeScript 5.x with strict mode
  - UI: Shadcn/ui component library (Radix UI primitives) + Tailwind CSS 4.0
  - 3D Rendering: Three.js 0.181.2 + @react-three/fiber 9.4.0 + @react-three/drei 10.7.7
  - State Management: Zustand v5.x with persistence middleware for offline-first PWA
  - Database: Dexie.js 4.2.1 for IndexedDB with 5-table schema (bricks, builds, templates, userPreferences, generationCache)
  - Backend: Python FastAPI 0.118.3 with build123d 0.10.0 (existing, leveraged from Forma AI)
  - AI: Google Gemini SDK via Next.js API Routes (server-side key management)

- **Data Sync Strategy:** Local-first architecture with no cloud sync in MVP. All data persists to IndexedDB only. Network boundary is only for AI generation (Gemini API calls). Cloud sync deferred to v1.1 with authentication.

- **API Client Architecture:** Must extend existing `/lib/api.ts` A2A protocol client (brownfield integration). Key functions: `generateLegoModel()`, `scanBricks()`, `getTemplates()`. Follow A2A task polling pattern: `sendMessage` → `pollTask` → extract artifacts.

- **IndexedDB Schema Design:** 5 tables with camelCase names - `bricks`, `builds`, `templates`, `userPreferences`, `generationCache`. Cache TTL: 7 days for AI generation cache. Images stored as Base64 in JSON for MVP.

- **Component Architecture:** Compound Components pattern (Shadcn/ui style). Example: `<LayerView><LayerView.Model /><LayerView.Progress /><LayerView.Navigation /></LayerView>`

- **Route Structure:** Next.js App Router with structure:
  - `/app/page.tsx` - Home (onboarding or dashboard)
  - `/app/generate/page.tsx` - AI generation (text/image mode)
  - `/app/build/[id]/page.tsx` - Layer-by-layer instructions
  - `/app/inventory/page.tsx` - Brick inventory management
  - `/app/templates/page.tsx` - Browse templates
  - `/app/api/generate/route.ts` - Server-side Gemini API calls

- **Multi-Image Upload Protocol:** HTTP multipart/form-data for up to 4 images per generation request. Client-side validation (max 4 images, 10MB per image) + server-side validation.

- **Environment Variables:** `NEXT_PUBLIC_API_URL` for backend URL. No `NEXT_PUBLIC_` prefix for secrets (API keys). Use Next.js API Routes for server-side API key usage.

- **Code Organization:**
  - Tests co-located with source files (`component.tsx` + `component.test.tsx`)
  - Components grouped by feature under `/components/[feature]/`
  - Zustand stores centralized in `/lib/stores/`
  - Custom hooks in `/lib/hooks/`
  - Integration/E2E tests in `__tests__/` directory only

- **Naming Conventions:**
  - Files: kebab-case.tsx (frontend), snake_case.py (backend)
  - Components: PascalCase
  -Functions: camelCase verbs
  - Constants: UPPER_SNAKE_CASE
  - Database tables/fields: camelCase
  - API endpoints: `/api/lowercase` with hyphens

- **Testing Framework:** Vitest 4.0.14 for unit testing, React Testing Library 16.3.0 for component tests, optional Playwright for E2E

- **Code Quality:** GTS (Google TypeScript Style) enforced via `tsconfig.json`. ESLint with Next.js rules. TypeScript strict mode with explicit return types required.

- **Deployment:** Vercel for frontend (Next.js PWA), existing Python FastAPI deployment for backend (separate, unchanged)

- **CI/CD Pipeline:** GitHub Actions with quality gates - Lint (ESLint), Type-check (TypeScript), Unit tests (Vitest), Build test. 80%+ code coverage, 0 TypeScript errors, 0 ESLint errors, successful build required.

**From UX Design:**

- **Design System:** Shadcn/ui base + Tailwind CSS 4 with custom Lego-inspired color palette defined in globals.css
  - Primary: 210 100% 45% (Lego blue)
  - Accent: 45 100% 50% (Lego yellow)
  - Destructive: 0 84% 60% (Brick red)
  - Muted: 30 10% 96% (Warm gray)

- **Typography:** Nunito (headings, rounded terminals, playful), Inter (body text), JetBrains Mono (stats/numbers)

- **Spacing & Layout:** 8px design grid for all spacing, 44px minimum touch targets (WCAG AA), border radius 8px/12px/16px for playful aesthetic

- **Visual Design Direction:** "Warm & Balanced" - Warm gray primary background, Lego blue navigation, yellow CTAs, red alerts. Card-based layouts, rounded corners, glass morphism overlays for premium feel.

- **Responsive Design:** Mobile-first with breakpoints - Mobile (0-767px), Tablet (768-1023px), Desktop (1024px+). Bottom tab bar on mobile, side navigation on desktop.

- **User Experience Principles:**
  - Visual Over Verbal - Show, don't tell. Kids don't need to read.
  - Inventory-First Flow - Scan bricks first, then discover what you can build
  - Graceful Recovery - Free retries, scale-down options, no dead-ends
  - Progress Storytelling - "Imagining... Finding... Building..." makes waits feel shorter
  - Celebration Built-in - Make completion moments special and shareable

- **Floating Action Button (FAB):** Context-aware, bottom-right positioned, expands to Camera + Create options, hides during Build flow, 44px+ touch targets

- **Component States:** All components must have Loading (skeleton shimmer), Interactive, Error, and Empty states defined

- **Emotional Design Goals:**
  - Curiosity: "What can I make? What will it create?"
  - Pride: "I made this! Look what WE built!"
  - Excitement: "This is amazing! I can't wait to build!"
  - Connection: "WE did this together" (family bonding)

- **Accessibility Requirements:**
  - WCAG AA contrast ratios (4.5:1 for text)
  - 16px minimum body text
  - Keyboard navigation for all elements
  - Reduced motion CSS media query support
  - Color not sole indicator (icons + text)

- **Button Hierarchy:**
  - Primary: Yellow fill, dark text (CTAs like "Start Building", "Create")
  - Secondary: Blue outline (Alternative actions like "Edit", "Cancel", "Retry")
  - Ghost: Text only, no border (Tertiary actions like "Skip", "Later")
  - Destructive: Red fill (Dangerous actions like "Delete")

- **Loading States Patterns:**
  - Cards: Skeleton shimmer
  - 3D Viewer: Spinner + "Loading model..."
  - AI Processing: Progress storytelling stages
  - Page Load: Skeleton + brand animation

- **Error Recovery Patterns:**
  - Component-Level Errors: Error boundaries for major features (3D viewer, camera, generation)
  - User-Facing Messages: Clear, actionable, avoid technical jargon
  - Retry Logic: All retryable errors include retry button/option

- **Journey Flows Defined:**
  1. Scan Brick Inventory - Camera → "Thinking..." → "Found 127 bricks!" → Save
  2. Create Design - FAB → Prompt → "Imagining... Finding... Building..." → Reveal → Rotate/Zoom → Inventory Check
  3. Build Instructions - "Start Building →" → Layer 1 highlighted → Tap to advance → "Step 3/12" → Celebration
  4. Share Creation - Build complete → Celebration screen → Share card → Social/Save
  5. Browse Ideas - Home → Scroll community → Tap design → "Build This" → Match check → Begin build
  6. First-Time Onboarding - "Welcome!" → Guided scan → First inventory → "Create your first design!" → First build complete → "Your first creation! 🎉"

- **Empty States Content:**
  - No Inventory: "Let's scan your bricks!" + Camera CTA
  - No Creations: "Ready to build something?" + Create CTA
  - No Community: "Be the first to share!" + Create CTA

- **Camera Permission UX Flow:**
  1. User taps "Scan Bricks"
  2. Pre-permission screen: "We need camera access to detect your Lego bricks. Nothing is stored on our servers."
  3. User taps "Allow Camera"
  4. Browser permission popup
  5. If denied → Recovery instructions

### FR Coverage Map

- FR1 (Text prompt generation) → Epic 2
- FR2 (Image upload generation) → Epic 2
- FR3 (Free retry 3x) → Epic 2
- FR4 (Scale-down option) → Epic 2 (logic) + Epic 4 (UI integration)
- FR5 (Structural feedback) → Epic 2
- FR6 (First-Build Guarantee) → Epic 2
- FR7 (Photograph bricks) → Epic 3
- FR8 (Resemblance matching) → Epic 3
- FR9 (View inventory) → Epic 3
- FR10 (Quick Start mode) → Epic 3
- FR11 (Inventory persistence) → Epic 3
- FR12 (Layer-by-layer instructions) → Epic 4
- FR13 (Navigation forward/backward) → Epic 4
- FR14 (Current brick view) → Epic 4
- FR15 (Build progress) → Epic 4
- FR16 (Missing brick count before) → Epic 4
- FR17 (Missing brick alert during) → Epic 4
- FR18 (Rotate 3D model) → Epic 2
- FR19 (Zoom 3D model) → Epic 2
- FR20 (Loading states) → Epic 2
- FR21 (Browse templates) → Epic 6
- FR22 (Inventory match %) → Epic 6
- FR23 (Build scaled template) → Epic 6
- FR24 (Save in-progress) → Epic 5
- FR25 (Resume build) → Epic 5
- FR26 (Name creations) → Epic 5
- FR27 (Build gallery) → Epic 5
- FR28 (Celebration feedback) → Epic 5
- FR29 (Onboarding tutorial) → Epic 7
- FR30 (Skip onboarding) → Epic 7
- FR31 (PWA install) → Epic 8
- FR32 (Offline access) → Epic 8
- FR33 (Camera permission UX) → Epic 8 (+ Epic 3 integration)
- FR34 (AI error message) → Epic 2
- FR35 (Scan error message) → Epic 3
- FR36 (Render error message) → Epic 2
- FR37 (Retry after error) → All epics (embedded)
- FR38 (Device ID tracking) → All epics (embedded)
- FR39 (Event tracking) → All epics (embedded)

**Total Coverage:** 39/39 FRs mapped across 8 epics

## Epic List

### Epic 1: Project Foundation & Setup
**User Outcome:** Development environment is configured and ready with Next.js 16, React 19, TypeScript strict mode, Tailwind CSS 4, Shadcn/ui design system, and all required dependencies. Database schema initialized, API client extended, and project structure established per Architecture specifications.

**FRs covered:** None directly (Story 0 - technical foundation enabling all future epics)

**Technical Scope:**
- Initialize Next.js App Router project with TypeScript and strict mode
- Configure GTS (Google TypeScript Style) and ESLint
- Setup Shadcn/ui design system with Lego-inspired color palette
- Add PWA support via next-pwa plugin
- Install 3D rendering stack: Three.js, @react-three/fiber, @react-three/drei
- Install state management: Zustand v5.x with persistence middleware
- Setup Dexie.js 4.2.1 with IndexedDB schema (5 tables: bricks, builds, templates, userPreferences, generationCache)
- Extend existing `/lib/api.ts` A2A protocol client with `generateLegoModel()`, `scanBricks()`, `getTemplates()` functions
- Configure environment variables and deployment settings
- Implement 8px design grid, 44px touch targets, typography system (Nunito/Inter/JetBrains Mono)

---

### Epic 2: AI Model Generation & 3D Visualization
**User Outcome:** Users can transform ideas and images into buildable Lego models with interactive 3D visualization. They can generate models from text prompts or uploaded images (up to 4 images), explore the 3D model with touch gestures (rotate, zoom, pan), retry generation if the result doesn't match expectations (up to 3 free retries), receive structural buildability feedback, and see appropriate complexity for first-time users via First-Build Guarantee.

**FRs covered:** FR1, FR2, FR3, FR5, FR6, FR18, FR19, FR20, FR34, FR36

**Technical Scope:**
- **AI Generation Core:**
  - Text-to-Lego generation via Gemini API (server-side via Next.js API Routes)
  - Multi-image upload (FormData multipart, max 4 images, 10MB each)
  - Image-to-Lego generation with multi-image context handling
  - Free retry mechanism (3x regenerations with same prompt)
  - Structural validation feedback (buildability checks: staggered joints, gravity, cantilevers)
  - First-Build Guarantee logic (simpler models for new users)
  - Progress storytelling UI ("Imagining... Finding... Building...")
  - Scale-down option core logic (UI integration in Epic 4)
  
- **3D Model Viewer (react-three-fiber):**
  - Canvas component using @react-three/fiber (NOT iframe)
  - STL model loading via three-stdlib
  - OrbitControls from @react-three/drei for touch gestures
  - Camera setup and scene lighting
  - Loading states (skeleton shimmer, spinner)
  - 20fps performance optimization for mobile
  - Compound component pattern: `<ModelViewer><ModelViewer.Canvas /><ModelViewer.Controls /></ModelViewer>`
  
- **Error Handling:**
  - Clear error messages for AI generation failures
  - Clear error messages for 3D rendering failures
  - Retry capability with Error Boundaries
  
- **State Management:**
  - Zustand `useGenerationStore` for generation state
  - A2A protocol task polling integration

---

### Epic 3: Brick Inventory Management
**User Outcome:** Users can photograph their brick collection to create an inventory, view and edit their bricks, use Quick Start mode to skip scanning, and have their inventory persist across sessions. Camera permission flow includes pre-explanation before requesting access.

**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR35

**Technical Scope:**
- Camera-based brick scanning component
- Browser Camera API integration (WebRTC)
- Resemblance-based brick matching (not exact identification)
- Inventory persistence in IndexedDB `bricks` table
- Quick Start mode (assumes standard brick collection)
- Inventory viewing and editing UI
- Camera permission pre-explanation screen (PWA-specific flow)
- Brick card components with counts and colors
- Error handling for scan failures
- Integration with Epic 8 camera permission UX

---

### Epic 4: Build Instructions & Guidance
**User Outcome:** Users can follow clear layer-by-layer visual instructions, navigate through build steps, see current brick requirements, track progress, and receive alerts about missing bricks before and during the build.

**FRs covered:** FR12, FR13, FR14, FR15, FR16, FR17

**Technical Scope:**
- Layer-by-layer 3D visualization (using Epic 2's viewer)
- Step navigation (forward/backward controls)
- Progress tracking UI ("Step 3 of 12")
- Current brick requirements display per step
- Missing brick count before build starts
- Real-time missing brick alerts during build
- Visual-first instruction design (minimal text for kids)
- Compound component pattern: `<LayerView><LayerView.Model /><LayerView.Progress /><LayerView.Navigation /></LayerView>`
- Scale-down option UI integration (logic from Epic 2)

---

### Epic 5: Build Progress & Management
**User Outcome:** Users can save in-progress builds for later, resume saved builds, name their completed creations, view a gallery of all their builds, and celebrate build completion with shareable moments.

**FRs covered:** FR24, FR25, FR26, FR27, FR28

**Technical Scope:**
- Save/resume functionality with IndexedDB `builds` table
- Auto-save progress to prevent data loss
- Build naming interface
- Build gallery view (card-based layout)
- Celebration modal with confetti animation
- Share card generation with creation stats
- Zustand `useBuildsStore` for build state management

---

### Epic 6: Template Discovery
**User Outcome:** Users can browse pre-designed templates organized by categories (Animals, Vehicles, Buildings), see how well each template matches their current inventory, and start building templates scaled to their available bricks.

**FRs covered:** FR21, FR22, FR23

**Technical Scope:**
- Template browsing by category
- Template card components
- Inventory match percentage calculation
- Scale-to-inventory option
- Template data storage in IndexedDB `templates` table
- Card-based scrollable layout (social media pattern)
- Integration with Epic 3 inventory data

---

### Epic 7: Onboarding & First-Time Experience
**User Outcome:** New users can complete a guided tutorial to scan their first bricks and create their first design with celebration, or skip directly to the app if they prefer to explore on their own.

**FRs covered:** FR29, FR30

**Technical Scope:**
- First-launch detection via IndexedDB `userPreferences`
- Guided tutorial flow (scan → create → build)
- Skip onboarding option
- First-Build Guarantee integration (from Epic 2)
- "Your first creation! 🎉" special celebration
- Tutorial state management in Zustand `useUIStore`

---

### Epic 8: PWA Installation & Offline Support
**User Outcome:** Users can install the app on their mobile devices (iOS Safari, Chrome Android), access saved builds and inventory while offline, and understand why camera access is needed before granting permission.

**FRs covered:** FR31, FR32, FR33

**Technical Scope:**
- PWA manifest.json configuration with Lego Builder branding
- Service Worker via next-pwa plugin
- Offline access to IndexedDB data (builds, inventory)
- Install prompts for iOS Safari and Chrome Android
- Camera permission pre-explanation screen
- Online/offline status detection (`useOnlineStatus` hook)
- Offline indicator UI
- PWA icon generation script


## Epic 1: Project Foundation & Setup

### Story 1.1: Initialize Next.js Project with TypeScript & Design System

As a developer,
I want a properly configured Next.js 16 project with TypeScript strict mode, ESLint, and Shadcn/ui foundation,
So that I can build the Lego Builder application with modern tooling and consistent code quality.

**Acceptance Criteria:**

**Given** a clean development environment
**When** I run `create-next-app@latest` with TypeScript and App Router options
**Then** the project initializes with Next.js 16, React 19, and TypeScript 5.x
**And** strict mode is enabled in `tsconfig.json`
**And** GTS (Google TypeScript Style) is installed and configured
**And** ESLint is configured with Next.js rules
**And** Shadcn/ui is initialized with `npx shadcn@latest init`
**And** Tailwind CSS 4 is installed with PostCSS
**And** The project builds successfully with `pnpm build`
**And** All linters pass with zero errors

### Story 1.2: Configure 3D Rendering Stack & State Management

As a developer,
I want Three.js, @react-three/fiber, and Zustand configured in the project,
So that I can implement 3D model visualization and application state management.

**Acceptance Criteria:**

**Given** the Next.js project from Story 1.1 is complete
**When** I install Three.js dependencies
**Then** `three@0.181.2`, `@react-three/fiber@9.4.0`, and `@react-three/drei@10.7.7` are added to `package.json`
**And** `@types/three` is added as a dev dependency
**And** `three-stdlib@2.29.4` is installed for STL loading
**And** Zustand v5.x is installed with persistence middleware
**And** `framer-motion@12.23.24` is installed for animations
**And** A basic test Canvas component renders without errors
**And** TypeScript recognizes all Three.js types correctly
**And** The project builds successfully with all new dependencies

### Story 1.3: Setup IndexedDB Schema & A2A API Client Extensions

As a developer,
I want Dexie.js configured with the 5-table schema and the A2A API client extended,
So that I can persist user data locally and communicate with the backend.

**Acceptance Criteria:**

**Given** the project has Zustand configured from Story 1.2
**When** I install Dexie.js 4.2.1
**Then** `/lib/db.ts` is created with 5 tables defined:
- `bricks` (id, type, color, quantity, createdAt)
- `builds` (id, name, modelData, currentStep, createdAt, completedAt)
- `templates` (id, category, name, modelData, inventoryMatch)
- `userPreferences` (id, key, value)
- `generationCache` (id, prompt, modelData, createdAt, expiresAt)
**And** All tables use camelCase field names
**And** Primary keys are auto-increment `id` fields
**And** The existing `/lib/api.ts` file is extended with:
- `generateLegoModel(type, prompt, images, inventory, options)` function
- `scanBricks(imageFile)` function
- `getTemplates(category)` function
**And** All API functions follow the A2A protocol pattern (sendMessage → pollTask)
**And** TypeScript interfaces are defined for all database tables
**And** The database initializes successfully on first run
**And** Unit tests verify table creation and API client functions

### Story 1.4: Implement Design System Foundation (Colors, Typography, Components)

As a developer,
I want the Lego-inspired design system configured with custom colors, typography, and base components,
So that the application has a consistent visual identity aligned with the UX specification.

**Acceptance Criteria:**

**Given** Shadcn/ui and Tailwind CSS are configured from Story 1.1
**When** I configure the design system
**Then** `app/globals.css` contains CSS custom properties for:
- Primary: 210 100% 45% (Lego blue)
- Accent: 45 100% 50% (Lego yellow)
- Destructive: 0 84% 60% (Brick red)
- Muted: 30 10% 96% (Warm gray)
**And** Google Fonts are configured for:
- Nunito (headings, weights 600-700)
- Inter (body text, weight 400)
- JetBrains Mono (stats/numbers, weight 500)
**And** Tailwind config uses 8px base spacing unit
**And** Base Shadcn/ui components are installed: Button, Card, Dialog, Input, Toast, Progress
**And** All touch targets meet 44px minimum (configured in Tailwind)
**And** Border radius values are set: 8px (SM), 12px (MD), 16px (LG)
**And** The design system renders correctly in Storybook or component preview
**And** Color contrast meets WCAG AA standards (verified)
**And** Typography scales properly across breakpoints (mobile 320px, tablet 768px, desktop 1024px)


## Epic 2: AI Model Generation & 3D Visualization

### Story 2.0: Backend - Implement Modification Mode in Coder Agent

As a developer,
I want the backend Coder agent to support code modification (not just generation),
So that users can iteratively refine their models without complete regeneration.

**Acceptance Criteria:**

**Given** the backend Coder agent currently only generates build123d code from scratch
**When** a modification request is received via the A2A protocol
**Then** the Coder agent accepts:
  - Existing build123d code (from previous generation)
  - Modification instruction prompt (e.g., "make it taller", "add wings")
  - RAG context (build123d documentation)
  - User inventory (for buildability)
**And** the Coder agent implements a new `modify_code()` function:
```python
def modify_code(self, existing_code: str, modification_prompt: str, rag_context: str) -> str:
    # Use Gemini to apply surgical edits to existing code
    # NOT generating from scratch
    prompt = f"""You are modifying existing build123d code.
    
    Current code:
    {existing_code}
    
    Modification requested: {modification_prompt}
    
    Apply ONLY the requested modification while preserving the core design.
    Return the complete modified code.
    
    Context: {rag_context}
    """
    modified_code = gemini.generate_content(prompt)
    return modified_code
```
**And** the modification preserves:
  - Core design structure
  - Variable naming conventions
  - Brick type constraints
  - Buildability rules
**And** the Coder agent validates modified code:
  - Syntax check (valid Python + build123d)
  - Structural integrity (no floating bricks)
  - Inventory compatibility
**And** the A2A endpoint `/v1/message:send` accepts a new message type:
```typescript
{ 
  type: 'modify_lego_model',
  baseModelId: number,
  baseCode: string,
  modificationPrompt: string,
  inventory: Brick[]
}
```
**And** the modification workflow follows: Control Flow → Designer (adjust concept) → Coder (modify code) → Renderer (new STL)
**And** modification failures return clear error: "Modification not possible. Try rephrasing or use regenerate."
**And** the backend logs modification requests separately from generations for analytics
**And** unit tests verify:
  - Code modification preserves structure
  - Invalid modifications are rejected
  - Modified code builds successfully

**Technical Implementation Notes:**
- Located in `/Backend/sub_agents/coder/agent.py`
- Uses Gemini API for code transformation task
- Different prompt strategy than generation (edit vs create)
- Enables Story 2.7 (frontend modification UI)
- This is NEW backend capability (not in current Forma AI)

**Enablement:**
- **Enables:** Story 2.7 (Iterative Model Modification)
- **Blocks:** Story 2.7 cannot be implemented until this is complete


### Story 2.1: Text-to-Lego Generation with Progress Storytelling

As a user,
I want to generate a Lego model from a text description,
So that I can bring my ideas to life as buildable Lego creations.

**Acceptance Criteria:**

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

**Technical Integration Notes:**
- Frontend does NOT generate models - it calls existing backend agents
- Backend agents already implemented: `/Backend/sub_agents/` (designer.py, coder.py, renderer.py)
- A2A protocol: sendMessage → pollTask → extract STL artifact
- No changes to backend agent logic required

### Story 2.2: Multi-Image Upload & Image-to-Lego Generation

As a user,
I want to upload up to 4 images to generate a Lego model that matches those images,
So that I can recreate real objects or photos as Lego builds.

**Acceptance Criteria:**

**Given** the user is on `/app/generate/page.tsx` with image mode selected
**When** the user uploads 1-4 images (max 10MB each) and optionally adds a text prompt
**Then** the frontend validates: max 4 images, each ≤10MB, supported formats (JPG, PNG, WebP)
**And** the frontend prepares FormData multipart request with images and prompt
**And** the frontend calls `generateLegoModel('image', prompt, images, inventory, options)`
**And** the API client sends multipart/form-data to **existing backend A2A endpoint** with image context
**And** the **backend agents** process multiple images (already supports multi-image context per Architecture)
**And** the frontend displays progress storytelling adapted for images: "Analyzing your images..." → "Designing from multiple angles..." → "Building your model..."
**And** the backend agents return STL file + metadata
**And** the frontend caches the result with image hashes as cache key
**And** validation errors (too many images, file too large) show clear user-friendly messages
**And** retry is available if generation fails (Story 2.4 dependency)

**Technical Integration Notes:**
- Backend already handles multi-image context (no changes needed)
- FormData structure: `{ type: 'image', images: File[], prompt?: string, inventory: Brick[] }`
- Client-side validation before sending to backend

### Story 2.3: 3D Model Viewer with Touch Controls (react-three-fiber)

As a user,
I want to view and interact with my generated Lego model in 3D,
So that I can inspect it from all angles before building.

**Acceptance Criteria:**

**Given** a generated model STL file URL is available (from Story 2.1 or 2.2)
**When** the frontend loads the STL file
**Then** a React component at `/components/viewer/model-viewer.tsx` renders the 3D model using:
  - `<Canvas>` from @react-three/fiber as the root
  - `useLoader(STLLoader)` from three-stdlib to load the STL geometry
  - `<OrbitControls>` from @react-three/drei for touch/mouse controls
**And** the user can rotate the model by dragging (touch or mouse)
**And** the user can zoom with pinch gestures (mobile) or scroll wheel (desktop)
**And** the user can pan by dragging with two fingers (mobile) or right-click drag (desktop)
**And** the camera is positioned to show the entire model on load (auto-framing)
**And** scene lighting includes: ambient light + 2 directional lights for depth
**And** the viewer maintains ≥20fps on 2019+ mobile devices (NFR2)
**And** a loading state shows skeleton shimmer while STL is loading
**And** if STL fails to load, an error boundary catches it and shows retry option
**And** the compound component pattern is implemented:
```tsx
<ModelViewer modelUrl={stlUrl}>
  <ModelViewer.Canvas />
  <ModelViewer.Controls />
  <ModelViewer.LoadingState />
</ModelViewer>
```
**And** unit tests verify STL loading and Canvas rendering (mocked Three.js)

**Technical Integration Notes:**
- Uses STL files generated by backend renderer agent
- NO iframe - direct React component using @react-three/fiber
- Performance budget: 20fps minimum per NFR2

### Story 2.4: Free Retry Mechanism & Structural Feedback

As a user,
I want to regenerate a model if it doesn't match my expectations (up to 3 free retries) and see if it has structural issues,
So that I can iterate on designs without penalty and know if my model is stable before building.

**Acceptance Criteria:**

**Given** a model has been generated (from Story 2.1 or 2.2)
**When** the user clicks "Regenerate" button
**Then** the same prompt/images are sent to the **backend agents again** via A2A
**And** the Zustand `useGenerationStore` tracks retry count (max 3)
**And** the UI shows "Try 2 of 3" or "Final try" indicator
**And** after 3 retries, the button changes to "Start Fresh" (clears prompt, resets count)
**And** each retry generates a NEW model (backend agents create different design)
**And** when the backend returns a model, it includes **structural analysis metadata**:
  - Buildability score (0-100)
  - Issues found (e.g., "Weak base layer", "Cantilever detected")
  - Recommendations (e.g., "Add support bricks here")
**And** if buildability score <70, a yellow warning badge appears: "Structural concerns - review before building"
**And** if buildability score ≥70, a green badge appears: "Structurally sound"
**And** user can tap the badge to see detailed structural feedback in a modal
**And** structural feedback is stored with the model in IndexedDB `generationCache`
**And** retry count resets when user starts a new generation

**Technical Integration Notes:**
- Backend agents already perform structural validation (coder agent checks staggered joints, gravity, cantilevers)
- Frontend displays validation results from backend metadata
- Retry logic is frontend-only (just resends same request)

### Story 2.5: First-Build Guarantee & User Profiling

As a user who has never completed a build,
I want the system to generate simpler models automatically,
So that my first experience is successful and builds my confidence.

**Acceptance Criteria:**

**Given** the user has never completed a build (checked via IndexedDB `userPreferences` table)
**When** the user generates their first model (Story 2.1 or 2.2)
**Then** the frontend reads `isFirstBuild` flag from `userPreferences` table (defaults to `true`)
**And** if `isFirstBuild === true`, the frontend sets `options.complexity = 'simple'` in the `generateLegoModel()` call
**And** the **backend coder agent** receives the complexity hint and generates a simpler model:
  - Fewer layers (max 5 layers)
  - Larger bricks (prefer 2x4, 2x3 over 1x1)
  - No tricky cantilevers or advanced techniques
**And** the UI shows a blue badge: "First-Build Mode - Simplified for success"
**And** user can tap "Advanced Mode" toggle to disable First-Build Guarantee for current generation
**And** when user completes their first build (Epic 5), `isFirstBuild` is set to `false` in `userPreferences`
**And** subsequent generations use normal complexity unless user is still learning
**And** a celebration modal appears after first build: "Your first creation! 🎉 Advanced mode unlocked"

**Technical Integration Notes:**
- Backend coder agent already supports complexity parameter (conservative vs. normal)
- Frontend manages `isFirstBuild` flag in IndexedDB
- Hook: `useFirstBuild()` returns `{ isFirstBuild, setFirstBuildComplete }`

### Story 2.6: Generation Error Handling & Recovery

As a user,
I want clear error messages and retry options when generation fails,
So that I'm never stuck and always know what to do next.

**Acceptance Criteria:**

**Given** the user has submitted a generation request (Story 2.1 or 2.2)
**When** the backend A2A task fails (network error, timeout, backend error)
**Then** the frontend `pollTask()` function detects the failure from task status
**And** an error boundary catches rendering errors in the 3D viewer (Story 2.3)
**And** the user sees a clear error message based on failure type:
  - Network error: "Connection lost. Check your internet and try again."
  - Timeout (>60s): "Generation is taking longer than expected. Try a simpler prompt."
  - Backend error: "Couldn't create your design. Try again or rephrase your prompt."
  - 3D render error: "Model couldn't be displayed. Retry generation."
**And** every error message includes a yellow "Retry" button
**And** clicking "Retry" calls the same generation function again (uses retry mechanism from Story 2.4)
**And** errors are logged to PostHog analytics with:
  - Error type
  - User prompt (first 50 chars)
  - Device ID
  - Timestamp
**And** if retry also fails, user sees: "Still having trouble? Try a different prompt or check your connection."
**And** user can always click "Start Fresh" to clear and begin new generation
**And** errors do NOT crash the entire app (Error Boundaries isolate failures)

**Technical Integration Notes:**
- Error boundaries at component level: `<GenerationErrorBoundary>` wraps generation UI
- PostHog error tracking: `posthog.capture('generation_failed', { errorType, prompt })`
- Graceful degradation per NFR11


## Epic 3: Brick Inventory Management

### Story 3.1: Camera-Based Brick Scanning with Permission Flow

As a user,
I want to photograph my brick collection using my device camera after understanding why camera access is needed,
So that the app knows which bricks I have available to build with.

**Acceptance Criteria:**

**Given** the user is on `/app/inventory/page.tsx`
**When** the user taps "Scan My Bricks" button for the first time
**Then** a pre-permission modal appears with:
- Title: "Camera Access Needed"
- Message: "We need camera access to detect your Lego bricks. Nothing is stored on our servers - all scanning happens on your device."
- Two buttons: "Allow Camera" (Primary yellow) and "Cancel" (Ghost)
**And** when user taps "Allow Camera", the browser's native camera permission prompt appears
**And** if user grants permission, the camera feed opens in `/components/camera/camera-capture.tsx`
**And** the camera component shows:
  - Live camera preview (full screen)
  - Frame guide overlay (shows ideal brick placement area)
  - "Capture" button (large, yellow, bottom center)
  - "Cancel" button (top-left)
**And** if user denies permission, recovery instructions appear:
  - "Camera access denied. To scan bricks, enable camera in your browser settings."
  - Link to "How to enable camera" help article
  - "Try Again" button to re-trigger permission
**And** on subsequent scans, pre-permission modal is skipped (goes straight to camera)
**And** permission state is stored in IndexedDB `userPreferences` table
**And** camera feed maintains <100ms latency per NFR5
**And** camera works on iOS Safari (WebRTC), Chrome Android, and desktop browsers per NFR24-27

**Technical Integration Notes:**
- Uses browser Camera API (WebRTC): `navigator.mediaDevices.getUserMedia()`
- Pre-permission screen per UX spec camera permission flow
- Integration with Epic 8 permission UX patterns

### Story 3.2: AI-Based Brick Detection with Gemini Vision

As a user,
I want the app to automatically detect and count my bricks from the photo using AI,
So that I don't have to manually input my inventory.

**Acceptance Criteria:**

**Given** the user has captured a photo of their bricks (Story 3.1)
**When** the user taps "Capture" button
**Then** the photo is sent to the backend via `scanBricks(imageFile)` from `/lib/api.ts`
**And** the backend creates a new A2A task with the image
**And** the backend calls **Gemini Vision API** with a structured prompt:
```
Analyze this image of LEGO bricks spread out on a surface.
Count and identify each visible brick by:
- Type (2x4, 2x2, 2x3, 1x2, 1x4, plate, etc.)
- Color (red, blue, yellow, green, white, black, gray, etc.)
- Quantity (count of each type/color combination)

Return only valid JSON array format:
[{"type": "2x4", "color": "red", "quantity": 12}, {"type": "2x2", "color": "blue", "quantity": 8}, ...]
```
**And** the frontend displays "Thinking..." animation with brick-themed loading indicator
**And** the frontend polls the A2A task status via `GET /v1/tasks/{taskId}`
**And** when Gemini Vision completes, the backend returns:
  - Array of detected bricks: `{type, color, quantity}[]`
  - Total brick count
  - Task completion status
**And** the frontend shows results screen with:
  - Headline: "Found 127 bricks!" (with celebration animation)
  - Grid of brick cards showing type, color, and quantity
  - Edit button for each brick card (tap to adjust quantity)
  - "Add More Bricks" button to scan additional photos and merge results
  - "Save Inventory" button (primary yellow)
**And** user can tap "Add More Bricks" to scan again (results are merged with existing)
**And** if Gemini detects zero bricks, error message appears: "No bricks detected. Try spreading them out more and capture again."
**And** scanning errors show retry option per FR35
**And** the entire scan process completes in <10 seconds

**Technical Integration Notes:**
- Uses existing Gemini API integration (same credentials as model generation)
- Backend endpoint: `/Backend/tools/brick_scanner.py` with Gemini Vision
- Gemini Vision model: `gemini-2.0-flash-exp` (multimodal)
- JSON parsing with error handling for malformed responses
- No custom computer vision needed - Gemini handles lighting, shadows, occlusions

### Story 3.3: Inventory Viewing, Editing & Persistence

As a user,
I want to view, edit, and save my brick inventory so it persists across sessions,
So that I can track what I have and use it for future builds.

**Acceptance Criteria:**

**Given** the user has scanned bricks (Story 3.2) or has existing inventory
**When** the user taps "Save Inventory" after scanning
**Then** all detected bricks are saved to IndexedDB `bricks` table with schema:
```typescript
interface Brick {
  id: number;          // auto-increment
  type: string;        // '2x4', '2x2', etc.
  color: string;       // 'red', 'blue', etc.
  quantity: number;
  createdAt: string;   // ISO 8601
}
```
**And** the inventory page (`/app/inventory/page.tsx`) shows all saved bricks in a grid layout
**And** each brick card displays:
  - Brick type (e.g., "2x4")
  - Color swatch
  - Quantity with JetBrains Mono font
  - Edit icon button
**And** when user taps edit icon, an inline editor appears allowing quantity adjustment
**And** when user adjusts quantity and confirms, the `bricks` table is updated immediately
**And** user can delete a brick by setting quantity to 0
**And** total brick count is displayed at top: "Your Collection: 127 bricks"
**And** inventory persists across browser sessions via IndexedDB per FR11, NFR15
**And** if inventory is empty, empty state appears: "Let's scan your bricks!" with camera CTA
**And** inventory data is used in generation calls (Story 2.1, 2.2) for buildability checking

**Technical Integration Notes:**
- Dexie.js for IndexedDB operations
- `useInventoryStore` Zustand store with persist middleware
- Cards use Shadcn/ui Card component with 12px border radius

### Story 3.4: Quick Start Mode (Skip Scanning)

As a user who wants to try the app without scanning,
I want to use Quick Start mode with an assumed standard brick collection,
So that I can start generating models immediately.

**Acceptance Criteria:**

**Given** the user is on `/app/inventory/page.tsx` with no scanned inventory
**When** the user sees the empty state
**Then** two options are displayed:
  - "Scan My Bricks" (primary yellow button)
  - "Quick Start" (secondary blue outline button)
**And** "Quick Start" button has subtitle: "Use standard collection to try the app"
**When** user taps "Quick Start"
**Then** a confirmation modal appears:
  - "Quick Start will assume you have a standard Lego collection (200+ mixed bricks). You can scan your real collection anytime."
  - "Continue with Quick Start" button
  - "Go Back" link
**And** when user confirms, the app populates IndexedDB `bricks` table with a standard collection:
  - 50x 2x4 bricks (mixed colors: 10 red, 10 blue, 10 yellow, 10 green, 10 white)
  - 40x 2x2 bricks (mixed colors)
  - 30x 2x3 bricks (mixed colors)
  - 80x assorted (1x2, 1x4, plates, etc.)
  - Total: 200 bricks
**And** a blue badge appears on inventory page: "Quick Start Collection - Scan real bricks anytime"
**And** user can tap "Scan Real Bricks" to replace Quick Start inventory
**And** Quick Start inventory can be edited same as scanned inventory (Story 3.3)
**And** `userPreferences` table stores `inventoryType: 'quick_start'` vs `'scanned'`
**And** generation works identically with Quick Start inventory as with scanned inventory

**Technical Integration Notes:**
- Quick Start data is hardcoded TypeScript constant: `QUICK_START_INVENTORY`
- Allows users to try generation (Epic 2) without camera hardware
- Per PRD FR10: enable users to try app immediately


## Epic 4: Build Instructions & Guidance

### Story 4.1: Layer-by-Layer 3D Instructions View

As a user,
I want to view layer-by-layer build instructions in 3D,
So that I can understand exactly how to assemble my model step by step.

**Acceptance Criteria:**

**Given** a generated model is saved (from Epic 2) with build data
**When** the user taps "Start Building" from the generation result page
**Then** the app navigates to `/app/build/[id]/page.tsx` with the build ID
**And** the page loads the model's layer data from IndexedDB `builds` table
**And** the compound `<LayerView>` component renders:
```tsx
<LayerView currentLayer={1} totalLayers={12}>
  <LayerView.Model modelUrl={stlUrl} highlightedLayer={1} />
  <LayerView.Progress current={1} total={12} />
  <LayerView.Navigation />
</LayerView>
```
**And** the 3D viewer (reused from Epic 2 Story 2.3) displays the model
**And** the current layer (Layer 1) is highlighted in yellow/accent color
**And** all other layers are dimmed/semi-transparent
**And** the view auto-rotates to the optimal viewing angle for the current layer
**And** the page uses visual-first design per UX spec:
  - Large 3D viewer (80% of screen height)
  - Minimal text (kids don't need to read)
  - Clear visual hierarchy
**And** loading states show skeleton shimmer while model loads
**And** the viewer maintains ≥20fps performance per NFR2

**Technical Integration Notes:**
- Reuses `<ModelViewer>` from Epic 2 Story 2.3
- Layer highlighting via Three.js material opacity adjustment
- Build data structure: `{ id, modelUrl, layers: [{bricks: [...], stepNumber}] }`

### Story 4.2: Step Navigation & Progress Tracking

As a user,
I want to navigate forward and backward through build steps and see my progress,
So that I can build at my own pace and track how far I've come.

**Acceptance Criteria:**

**Given** the user is viewing layer-by-layer instructions (Story 4.1)
**When** the `<LayerView.Navigation>` component renders
**Then** navigation controls appear at the bottom:
  - "Previous" button (secondary blue outline, left side)
  - Progress indicator (center): "Step 3 of 12"
  - "Next" button (primary yellow, right side)
**And** all buttons are ≥44px touch targets per NFR20
**And** when user taps "Next", the current layer increments (1 → 2)
**And** the 3D viewer transitions to the next layer with smooth animation
**And** when user taps "Previous", the current layer decrements (3 → 2)
**And** "Previous" is disabled on Layer 1 (grayed out)
**And** "Next" changes to "Complete Build" on the final layer
**And** keyboard shortcuts work:
  - Arrow Right / Space → Next layer
  - Arrow Left → Previous layer
  - Escape → Pause and return to build list
**And** progress is auto-saved to IndexedDB `builds` table after each step:
```typescript
{ id, currentStep: 3, updatedAt: '2026-01-07T13:52:00Z' }
```
**And** progress indicator uses JetBrains Mono font for numbers
**And** a progress bar (0-100%) appears above navigation buttons
**And** haptic feedback vibrates on mobile when advancing steps (optional enhancement)

**Technical Integration Notes:**
- Zustand `useBuildsStore` manages current step state
- Dexie.js persists progress for resume capability (Epic 5)
- Keyboard event listeners for navigation shortcuts

### Story 4.3: Current Brick Requirements Display

As a user,
I want to see which brick I need for the current step,
So that I can easily find it in my collection.

**Acceptance Criteria:**

**Given** the user is on a specific build step (Story 4.2)
**When** the layer view renders
**Then** a brick requirements card appears above the navigation controls showing:
  - Brick type visual (small 3D preview or icon)
  - Brick type label: "2x4 Brick"
  - Color swatch and name: "Red"
  - Quantity needed: "x3" (JetBrains Mono font)
**And** the card uses the Shadcn/ui Card component with 12px border radius
**And** if multiple brick types are needed for the current layer, they appear as a horizontal scrollable list
**And** when user taps a brick card, it expands to show:
  - Larger brick preview
  - Exact placement location highlighted in the 3D viewer
  - "Find in my collection" button (opens inventory)
**And** the brick card has a glossy/premium aesthetic per UX design direction
**And** brick requirements are extracted from the model's layer data structure
**And** if the required brick is in user's inventory, a green checkmark appears
**And** if the brick is NOT in inventory, a yellow warning icon appears (links to Story 4.4)

**Technical Integration Notes:**
- Layer data structure: `{ bricks: [{ type, color, quantity, position: {x, y, z} }] }`
- Inventory check queries IndexedDB `bricks` table
- 3D highlight uses Three.js raycasting to show exact brick position

### Story 4.4: Missing Brick Detection & Alerts

As a user,
I want to know before and during the build if I'm missing bricks,
So that I can decide whether to continue, scale down, or get more bricks.

**Acceptance Criteria:**

**Given** the user has completed generation (Epic 2) and has inventory data (Epic 3)
**When** the user taps "Start Building" on a generated model
**Then** the frontend performs a pre-build inventory check:
  - Compares model's required bricks against IndexedDB `bricks` table
  - Calculates missing bricks: `required - available`
**And** if ALL bricks are available, a green badge appears: "✓ You have all the bricks!"
**And** if some bricks are missing, a yellow modal appears before build starts:
  - Title: "Missing Bricks Detected"
  - Message: "You're missing 3 bricks. You can:"
  - Option 1: "Continue anyway" (secondary button)
  - Option 2: "Scale down model" (primary yellow button) - uses Epic 2 scale-down logic
  - Option 3: "Cancel" (ghost link)
**And** the modal lists the specific missing bricks:
  - "2x4 Red: need 5, have 2 (missing 3)"
  - "2x2 Blue: need 8, have 6 (missing 2)"
**And** if user chooses "Continue anyway", a yellow alert banner persists during build:
  - "⚠ You're building with missing bricks. Some steps may not be possible."
**And** during the build, when reaching a step requiring a missing brick:
  - A real-time missing brick alert appears: "Missing: 2x4 Red (x3)"
  - Alert is dismissible but reappears if user tries to advance
  - Option to "Skip this step" (marks as incomplete)
**And** if user chooses "Scale down model":
  - Frontend calls backend A2A endpoint to regenerate with smaller scale
  - Uses existing `generateLegoModel()` with `options.scaleDown = true`
  - User receives scaled model matching their inventory
**And** missing brick count is stored in `builds` table: `{ missingBrickCount: 3 }`

**Technical Integration Notes:**
- Pre-build check: compare arrays `modelBricks[]` vs `inventoryBricks[]`
- Real-time alerts triggered by inventory mismatch on current step
- Scale-down integration uses Epic 2 Story 2.4 retry mechanism
- Per FR16 (pre-build) and FR17 (during build)


## Epic 5: Build Progress & Management

### Story 5.1: Save and Resume Build Progress

As a user,
I want to save my in-progress build and resume it later,
So that I can take breaks without losing my place.

**Acceptance Criteria:**

**Given** the user is building a model (Epic 4)
**When** the user navigates away or closes the app
**Then** their current progress is auto-saved to IndexedDB `builds` table:
```typescript
{
  id: number,
  name: string | null,
  modelData: string,  // STL URL
  currentStep: number,
  totalSteps: number,
  createdAt: string,
  updatedAt: string,
  completedAt: string | null
}
```
**And** when user returns to `/app/builds/page.tsx`
**And** they see their in-progress build with a "Resume" badge
**And** tapping the build card navigates to `/app/build/[id]/page.tsx`
**And** the build loads at the exact step where they left off
**And** a toast notification appears: "Resuming from Step 7 of 12"
**And** auto-save triggers after each step advancement (Story 4.2)
**And** auto-save triggers every 30 seconds during idle viewing
**And** if browser closes unexpectedly, progress is still saved (last auto-save point)

**Technical Integration Notes:**
- Zustand `useBuildsStore` with persist middleware
- Dexie.js for IndexedDB operations
- Auto-save debounced to prevent excessive writes

### Story 5.2: Build Naming and Gallery View

As a user,
I want to name my completed builds and view them in a gallery,
So that I can remember what I've created and feel a sense of accomplishment.

**Acceptance Criteria:**

**Given** the user completes the final step of a build (Story 4.2)
**When** they tap "Complete Build" button
**Then** a naming modal appears:
  - Title: "Name Your Creation"
  - Text input field with placeholder: "My Rainbow Dragon"
  - "Save" button (primary yellow)
  - "Skip" link (ghost)
**And** if user enters a name and saves, `builds` table is updated:
```typescript
{ name: "My Rainbow Dragon", completedAt: "2026-01-07T14:00:00Z" }
```
**And** if user skips, a default name is generated: "Build #[number]" or "[Model Type] Build"
**And** the build is marked as complete and moves to the "Completed" section
**And** the gallery view (`/app/builds/page.tsx`) shows:
  - Tab navigation: "In Progress" | "Completed"
  - Card-based grid layout (2 columns mobile, 3 desktop)
  - Each card shows: 3D model thumbnail, name, completion date, brick count
**And** tapping a completed build card shows build details with option to "Build Again"
**And** completed builds are sorted by `completedAt` (most recent first)
**And** empty state for no builds: "Ready to build something?" with Create CTA

**Technical Integration Notes:**
- Gallery uses Shadcn/ui Card components
- 3D thumbnails generated from STL using Three.js screenshot
- Named builds support user personalization per UX emotional goals

### Story 5.3: Build Completion Celebration

As a user,
I want to see a celebration when I complete a build,
So that I feel proud of my accomplishment and want to share it.

**Acceptance Criteria:**

**Given** the user has completed the final step and named their build (Story 5.2)
**When** they tap "Save" on the naming modal
**Then** a full-screen celebration modal appears with:
  - Confetti animation (using framer-motion)
  - Headline: "🎉 Build Complete! 🎉"
  - Subtext: "You built [Build Name] with [127] bricks in [45 minutes]"
  - 3D model rotating showcase
  - Share card preview (screenshot-ready)
**And** the share card contains:
  - Build photo/3D render
  - Build name
  - Build stats: "[127] bricks • [12] steps • [45] min"
  - Footer: "Built with Lego Builder" + app logo
**And** action buttons appear:
  - "Share" (opens native share dialog - PWA share API)
  - "Save to Gallery" (dismisses modal, navigates to builds)
  - "Build Another" (dismisses modal, navigates to generate)
**And** PostHog event is captured: `build_completed` with metadata:
```typescript
{
  buildId: number,
  buildName: string,
  brickCount: number,
  stepCount: number,
  durationMinutes: number
}
```
**And** celebration includes haptic feedback (vibration pattern) on mobile
**And** confetti animation lasts 3 seconds with satisfying physics
**And** first-time build completion shows extra badge: "Your first creation! 🏆"

**Technical Integration Notes:**
- Framer-motion for confetti animation
- PWA Share API: `navigator.share()` for native sharing
- PostHog analytics integration per FR39
- Special celebration for first build (integrates with Epic 7)

## Epic 6: Template Discovery

### Story 6.1: Browse Templates by Category

As a user,
I want to browse pre-designed Lego templates organized by category,
So that I can find inspiration when I don't know what to build.

**Acceptance Criteria:**

**Given** the user navigates to `/app/templates/page.tsx`
**When** the page loads
**Then** the user sees category tabs at the top:
  - "Animals" | "Vehicles" | "Buildings" | "All"
**And** each category displays template cards in a scrollable grid (social media pattern)
**And** each template card shows:
  - 3D model thumbnail preview
  - Template name: "Red Dragon"
  - Brick count: "~85 bricks"
  - Inventory match badge (Story 6.2): "92% Match" (green), "58% Match" (yellow), "12% Match" (red)
  - "Build This" button
**And** templates are loaded from IndexedDB `templates` table:
```typescript
{
  id: number,
  category: 'animals' | 'vehicles' | 'buildings',
  name: string,
  modelData: string,  // STL URL or stored model
  estimatedBricks: number,
  createdAt: string
}
```
**And** templates are pre-populated (seeded on first app launch or fetched from backend)
**And** tapping a template card shows detail view with:
  - Large 3D preview (rotatable)
  - Full brick list
  - Inventory match breakdown
  - "Start Building" CTA
**And** empty state (no templates): "Templates coming soon!"
**And** category filtering updates instantly (client-side, no reload)

**Technical Integration Notes:**
- Templates stored in IndexedDB for offline access
- Initial template data could be bundled with app or fetched from backend
- Card layout matches UX spec: rounded corners, warm aesthetics

### Story 6.2: Inventory Match Calculation and Scaled Building

As a user,
I want to see how well each template matches my brick inventory and build scaled versions,
So that I can build templates with the bricks I already have.

**Acceptance Criteria:**

**Given** the user has inventory data (Epic 3) and is viewing templates (Story 6.1)
**When** templates are displayed
**Then** for each template, the frontend calculates inventory match percentage:
```typescript
matchPercentage = (availableBricks / requiredBricks) * 100
```
**And** match percentage is displayed as a colored badge:
  - 80-100%: Green badge "✓ 92% Match"
  - 50-79%: Yellow badge "⚠ 58% Match"
  - 0-49%: Red badge "✗ 12% Match"
**And** when user taps "Build This" on a template:
  - If match ≥80%, build starts immediately (navigate to `/app/build/[id]`)
  - If match 50-79%, modal offers: "Build scaled down?" or "Continue anyway"
  - If match <50%, modal suggests: "You're missing many bricks. Try Quick Start mode or scan more bricks."
**And** when user chooses "Build scaled down":
  - Frontend calls backend A2A endpoint: `generateLegoModel()` with template ID + inventory
  - Backend generates a scaled version matching available bricks
  - User receives scaled model and starts building
**And** match calculation ignores color mismatches (focuses on brick types)
**And** detailed breakdown shows: "You have 85 of 92 required bricks"
**And** missing bricks list appears in template detail view

**Technical Integration Notes:**
- Match calculation runs client-side for instant feedback
- Compares `templates.bricks[]` against `inventory.bricks[]`
- Scale-down uses same backend logic as Epic 2 Story 2.4
- Per FR22 (inventory match %) and FR23 (scaled building)

## Epic 7: Onboarding & First-Time Experience

### Story 7.1: First-Time Onboarding Tutorial

As a first-time user,
I want to see a guided tutorial that helps me scan bricks and create my first design,
So that I have a successful first experience and understand how the app works.

**Acceptance Criteria:**

**Given** the user opens the app for the first time
**When** the app loads at `/app/page.tsx`
**Then** the app checks IndexedDB `userPreferences` for `hasCompletedOnboarding` flag
**And** if `hasCompletedOnboarding === false` (or doesn't exist), onboarding starts
**And** a welcome screen appears with:
  - App logo + animation
  - Headline: "Welcome to Lego Builder!"
  - Subtext: "Let's scan your bricks and create something amazing together"
  - "Get Started" button (primary yellow)
  - "Skip Tutorial" link (ghost, bottom)
**And** when user taps "Get Started", a multi-step tutorial begins:

**Step 1: Scan Introduction**
  - Visual: Illustration of bricks spread out
  - Text: "First, let's see what bricks you have"
  - CTA: "Scan My Bricks"
  - Tapping CTA launches camera (Story 3.1) with guided frame overlay
  
**Step 2: Inventory Created**
  - After scan completes, celebration: "Great! Found [127] bricks"
  - Text: "You can always scan more bricks later"
  - CTA: "Next"
  
**Step 3: Create First Design**
  - Text: "Now, let's create your first Lego model"
  - Suggested prompt: "a small castle" (pre-filled)
  - Note: "We'll keep it simple for your first build"
  - CTA: "Generate" (triggers Story 2.1 with First-Build Guarantee)
  
**Step 4: Build Ready**
  - After generation, celebration: "Your first design is ready!"
  - CTA: "Start Building" (launches Story 4.1)

**And** progress dots appear at bottom showing tutorial progress (● ○ ○ ○)
**And** users can go "Back" to previous tutorial steps
**And** when tutorial completes or is skipped, `userPreferences.hasCompletedOnboarding = true`
**And** onboarding is never shown again (unless user resets in settings)

**Technical Integration Notes:**
- Onboarding screens use full-screen modals
- Tutorial state managed by Zustand `useUIStore`
- Integrates seamlessly with Epic 2 (generation) and Epic 3 (scanning)
- Per UX spec: Journey 6 - First-Time Onboarding flow

### Story 7.2: Skip Onboarding Option

As a user who wants to explore on my own,
I want to skip the tutorial and go directly to the app,
So that I'm not forced through a lengthy onboarding flow.

**Acceptance Criteria:**

**Given** the onboarding tutorial is active (Story 7.1)
**When** the user sees any tutorial screen
**Then** a "Skip Tutorial" link appears (ghost style, small, non-intrusive)
**And** tapping "Skip Tutorial" shows a confirmation modal:
  - "Skip tutorial? You can always access help from settings."
  - "Skip" button (destructive red)
  - "Continue Tutorial" button (secondary blue)
**And** when user confirms skip:
  - Tutorial closes immediately
  - App navigates to main home/dashboard page
  - `userPreferences.hasCompletedOnboarding = true` (skipped is considered "completed")
**And** the home page shows a helpful empty state:
  - "Ready to build? Scan your bricks or try Quick Start mode"
  - Two CTAs: "Scan Bricks" and "Quick Start"
**And** skipped users still get the First-Build Guarantee (Epic 2 Story 2.5)
**And** a "Tutorial" option appears in app settings to re-trigger onboarding

**Technical Integration Notes:**
- Skip option respects user autonomy per UX principles
- Per FR30: skip onboarding functionality
- Settings integration for re-access

## Epic 8: PWA Installation & Offline Support

### Story 8.1: PWA Manifest and Installation Prompts

As a user,
I want to install the Lego Builder app on my mobile device,
So that it feels like a native app and is easy to access.

**Acceptance Criteria:**

**Given** the app is built with next-pwa plugin (Epic 1 Story 1.1)
**When** the app is deployed and accessed via browser
**Then** a `manifest.json` file is served with:
```json
{
  "name": "Lego Builder",
  "short_name": "Lego Builder",
  "description": "Transform ideas into buildable Lego models",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F7F5F3",
  "theme_color": "#0066CC",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ]
}
```
**And** PWA icons are generated using `/public/icons/generate-icons.sh` script
**And** on Chrome Android, after 2-3 visits, browser shows "Add to Home Screen" prompt
**And** on iOS Safari, manual installation is possible via Share → "Add to Home Screen"
**And** when installed, the app:
  - Opens in standalone mode (no browser UI)
  - Uses custom splash screen with app icon
  - Shows app icon on device home screen
**And** a custom in-app install prompt appears (for browsers that support it):
  - Banner at top: "Install Lego Builder for the best experience"
  - "Install" button (primary yellow)
  - "Dismiss" button (ghost)
**And** Lighthouse PWA audit score is >90 per NFR4

**Technical Integration Notes:**
- next-pwa plugin handles service worker generation
- Manifest configured in `next.config.ts`
- Icon generation script required per Architecture

### Story 8.2: Offline Access to Builds and Inventory

As a user,
I want to access my saved builds and inventory while offline,
So that I can continue building even without internet connection.

**Acceptance Criteria:**

**Given** the user has previously used the app while online
**When** the user opens the app without internet connection
**Then** the service worker intercepts requests and serves cached resources
**And** the app displays an offline indicator at the top:
  - Yellow banner: "⚠ You're offline. Some features unavailable."
  - Dismissible but reappears on page refresh
**And** offline-available features work fully:
  - View builds gallery (from IndexedDB)
  - Resume in-progress builds (from IndexedDB)
  - View brick inventory (from IndexedDB)
  - View build instructions (STL files cached)
  - Navigate between pages
**And** offline-unavailable features show helpful messages:
  - Generate new models: "Connect to internet to generate new designs"
  - Scan bricks: "Connect to internet to scan bricks"
  - Templates: "Connect to internet to load templates"
**And** when connection is restored, a green toast appears: "✓ Back online!"
**And** any failed requests during offline are NOT retried automatically (user must manually retry)
**And** the `useOnlineStatus` hook detects connection state:
```typescript
const isOnline = useOnlineStatus(); // true/false
```

**Technical Integration Notes:**
- Service worker caches: HTML, CSS, JS, icons, STL files
- IndexedDB provides full offline data access per NFR13, NFR15
- Online detection: `window.addEventListener('online')` and `window.addEventListener('offline')`
- Per FR32: offline access requirement

### Story 8.3: Service Worker Caching Strategy

As a developer,
I want the service worker to cache app resources efficiently,
So that the app loads fast and works offline.

**Acceptance Criteria:**

**Given** next-pwa is configured in Epic 1
**When** the user first visits the app
**Then** the service worker registers and begins caching:
  - **Precache (install time):** HTML, CSS, JS bundles, icons, fonts
  - **Runtime cache:** STL files, API responses (with TTL)
  - **Network-first:** API calls to backend A2A endpoints
  - **Cache-first:** Static assets, STL models
**And** service worker configuration in `next.config.ts`:
```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.stl$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'stl-models',
        expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 } // 30 days
      }
    },
    {
      urlPattern: /\/api\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10
      }
    }
  ]
});
```
**And** service worker updates automatically on app deployment
**And** users see "New version available" toast with "Reload" button
**And** cache size is monitored to prevent storage quota issues
**And** old cache entries are purged based on LRU (Least Recently Used) policy

**Technical Integration Notes:**
- next-pwa handles service worker generation automatically
- Caching strategy optimized for offline performance per NFR14
- Cache TTLs align with IndexedDB generationCache (7 days)


### Story 2.7: Iterative Model Modification

As a user,
I want to modify an existing generated model with additional text prompts,
So that I can refine my design without completely regenerating from scratch.

**Acceptance Criteria:**

**Prerequisites:** Story 2.0 (Backend - Implement Modification Mode in Coder Agent) must be complete before this story can be implemented.

**Given** the user has a generated model they like (from Story 2.1 or 2.2)
**When** the user views the 3D model in the generation result screen
**Then** a "Modify This Model" button appears alongside "Regenerate" and "Start Building"
**And** when user taps "Modify This Model", a modification modal appears with:
  - Original prompt displayed (read-only): "a small red dragon"
  - Modification input field: "What changes do you want to make?"
  - Example suggestions: "make it taller", "add wings", "change color to blue", "add more details"
  - "Apply Changes" button (primary yellow)
  - "Cancel" link (ghost)
**And** when user enters modification prompt and taps "Apply Changes"
**Then** the frontend calls the extended A2A endpoint with modification mode:
```typescript
generateLegoModel('modify', modificationPrompt, [], inventory, {
  baseModelId: currentModel.id,
  baseModelData: currentModel.buildData
})
```
**And** the backend receives:
  - Base model metadata (existing design concept, build123d code, STL reference)
  - Modification instruction: "make it taller"
  - User inventory (for buildability check)
**And** the **backend agents** work in modification mode:
  - **Designer agent**: Adjusts existing design concept (doesn't create from scratch)
  - **Coder agent**: Modifies existing build123d code (e.g., scales Z-axis, adds features)
  - **Renderer agent**: Renders updated STL from modified code
**And** the frontend displays progress storytelling: "Analyzing your model... Applying changes... Rebuilding..."
**And** when modification completes, the frontend receives:
  - Updated STL file URL
  - Modified model metadata
  - Modification history: ["original prompt", "make it taller"]
**And** the modified model is saved to IndexedDB with modification chain
**And** user can apply multiple sequential modifications:
  - Original → "make it taller" → "add wings" → "change to blue"
  - Each modification builds on the previous version
**And** user can "Undo Last Modification" to revert to previous version
**And** modification count is limited to 3 per model (same as retry limit)
**And** after 3 modifications, user must choose: "Start Fresh" (new generation) or "Continue Building" (use current version)
**And** if modification fails, error message appears: "Couldn't apply changes. Try rephrasing your modification or use Regenerate for a fresh start."
**And** modification preserves the core design identity (same dragon, just modified)

**Technical Integration Notes:**
- Backend needs modification mode support in Coder agent
- Modification mode: edit existing build123d code vs. generate new
- Frontend tracks modification history for undo capability
- Modified models stored separately from originals in IndexedDB
- This is an **enhancement** beyond the 39 FRs - adds iterative design workflow
- Enables conversational design refinement: user → model → tweak → tweak → perfect

**Design Rationale:**
- **Different from Retry**: Retry = complete regeneration. Modify = refinement.
- **Better UX**: Users don't lose what they like, just adjust it
- **Leverages AI strengths**: Gemini is great at code modification tasks
- **Preserves design intent**: Core concept stays the same, details change
- **Power user feature**: Enables advanced users to iterate toward perfection

