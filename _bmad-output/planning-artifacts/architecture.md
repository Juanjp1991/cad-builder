---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - '_bmad-output/project-planning-artifacts/prd.md'
  - '_bmad-output/project-planning-artifacts/product-brief-lego-builder-2025-12-27.md'
  - '_bmad-output/project-planning-artifacts/ux-design-specification.md'
  - '_bmad-output/project-planning-artifacts/research/technical-2d-to-3d-voxel-research-2025-12-26.md'
  - '_bmad-output/project-planning-artifacts/research/technical-brick-identification-research-2025-12-26.md'
  - 'docs/index.md'
workflowType: 'architecture'
project_name: 'Lego builder python'
user_name: 'Juan'
date: '2026-01-06'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The project encompasses **39 functional requirements** across 10 categories:

1. **Model Generation (7 FRs)** - Core value proposition:
   - Text-to-Lego generation from natural language prompts
   - **Image-to-Lego generation with multi-image upload (up to 4 images)** - allows reference from multiple angles or concept combination
   - Free retry (3x) for regeneration with same prompt
   - Scale-down option when inventory doesn't match
   - Structural validation feedback (buildability checks)
   - First-Build Guarantee (conservative first designs for new users)

2. **Brick Inventory Management (5 FRs)**:
   - Camera-based brick scanning with resemblance-based matching
   - Inventory persistence across sessions
   - Quick Start mode (assumes standard collection, skips scanning)
   - Inventory viewing and editing

3. **Build Instructions (6 FRs)**:
   - Layer-by-layer 3D visualization
   - Forward/backward navigation through steps
   - Build progress tracking ("Step 3 of 12")
   - Missing brick alerts before and during build
   - Current brick requirements per step

4. **3D Viewer (3 FRs)**:
   - Rotate, zoom, pan interactions (touch-first)
   - Loading states during AI generation
   - WebGL 2.0 rendering at 20fps minimum

5. **Design Discovery (3 FRs)**:
   - Template category browsing (Animals, Vehicles, Buildings)
   - Inventory match percentage for templates
   - Scale-to-inventory option

6. **Build Management (5 FRs)**:
   - Save/resume in-progress builds (critical for AFOL journeys)
   - Name completed creations
   - Build gallery (completed builds list)
   - Celebration feedback on completion

7. **Onboarding (2 FRs)**:
   - First-launch tutorial
   - Skippable onboarding flow

8. **PWA Experience (3 FRs)**:
   - Mobile installation capability
   - Offline access to saved builds and inventory
   - Camera permission pre-permission explanation

9. **Error Handling (4 FRs)**:
   - Clear error messages (AI failure, scan failure, render failure)
   - Retry capability after any error
   - Graceful degradation patterns

10. **Analytics (2 FRs)**:
    - Anonymous device ID tracking
    - Core event logging (scan, generate, build start, build complete)

**Non-Functional Requirements:**

Critical NFRs that will drive architectural decisions:

- **Performance**:
  - AI Generation: <1 minute end-to-end (prompt → 3D model displayed)
  - 3D Viewer: 20fps on 2019+ mid-range devices (Snapdragon 6-series, Apple A12 equivalent)
  - First Contentful Paint: <2 seconds
  - Touch Response: <100ms UI feedback
  - PWA Lighthouse Score: >90

- **Browser Compatibility**:
  - Primary: Chrome 90+, Safari 15+ (WebGL 2.0 + Camera API required)
  - Secondary: Edge 90+, Firefox 90+
  - Device baseline: 2019+ devices

- **Offline Capabilities**:
  - Saved builds accessible offline (IndexedDB)
  - Brick inventory cached locally
  - Build instructions cached after first load
  - New AI generation requires network
  - Service Worker for PWA caching

- **Security (MVP - Minimal)**:
  - Local-only storage (IndexedDB, no cloud sync in MVP)
  - Anonymous users (device ID only)
  - Camera access: scanning only, no server storage
  - Gemini API keys secured server-side
  - HTTPS required for all network communication

- **Accessibility (Basic)**:
  - Keyboard navigation for all interactive elements
  - WCAG AA color contrast (4.5:1 for text)
  - 44px minimum touch targets
  - Screen reader labels for buttons/icons
  - Focus states for navigation
  - Reduced motion CSS media query support

- **Reliability**:
  - All errors recoverable with retry option
  - Auto-save progress for builds
  - Generation result caching (avoid re-generation)
  - Graceful fallbacks (scale-down, template suggestions)

**Scale & Complexity:**

- **Primary domain**: Full-stack Progressive Web Application (PWA)
- **Complexity level**: **Medium-High**
  - Sophisticated AI integration (text + multi-image → 3D model)
  - Real-time 3D rendering with touch interactions
  - Native device APIs (camera, storage, installation)
  - Offline-first architecture with sync implications
  - Physics-aware buildability validation (novel algorithm)

- **Estimated architectural components**: 15-20 major components
  - AI Generation Pipeline (text/image processing)
  - Multi-image Upload Handler (up to 4 images)
  - Buildability Validation Engine
  - 3D Model Viewer (Three.js/React Three Fiber)
  - Camera Scanning System
  - Brick Inventory Management
  - Instructions System (layer-by-layer)
  - Template Library
  - Build Progress Tracker
  - Local Storage Layer (IndexedDB)
  - Analytics Integration (PostHog)
  - Error Recovery System
  - Celebration/Share Components
  - PWA Service Worker
  - Onboarding Flow

### Technical Constraints & Dependencies

**Existing System to Leverage (Forma AI Backend):**

- **Python FastAPI service** with build123d CAD library
- **Multi-agent architecture**: Control Flow → Designer → Coder → Renderer agents
- **RAG system**: ChromaDB with build123d documentation for AI context
- **A2A protocol**: Async task management (SUBMITTED → WORKING → COMPLETED)
- **Output formats**: STEP/STL file generation
- **Headless rendering**: PyVista for 2D previews

**Architectural Gap Analysis:**

The existing Forma AI system is designed for **generic parametric CAD generation**. The new Lego Builder requires:

1. **Lego-Specific Generation**:
   - Current: Generic 3D CAD models
   - Needed: Buildable with standard Lego brick sizes/types
   - Gap: Lego brick library, snap-fit constraints, color palette

2. **Image-to-Lego Conversion**:
   - Current: Text-only prompts
   - Needed: **Multi-image upload (up to 4 images)**, 2D photo → 3D voxel model
   - Gap: Image processing pipeline, voxelization algorithm, multi-image context handling

3. **Brick Inventory System**:
   - Current: No inventory concept
   - Needed: Camera scanning, brick matching, buildability validation
   - Gap: Entire inventory management subsystem

4. **Mobile PWA Frontend**:
   - Current: Desktop chat UI
   - Needed: Mobile-first PWA with camera, offline, installation
   - Gap: Complete frontend rewrite with PWA capabilities

**Key Technical Dependencies:**

- **AI/ML**: Google Gemini SDK (text/multi-image → Lego model generation)
- **Frontend Framework**: Next.js 14+ with App Router
- **UI Library**: React 19
- **Design System**: Shadcn/ui + Tailwind CSS 4
- **3D Rendering**: Three.js via React Three Fiber
- **PWA**: next-pwa plugin for service worker
- **Camera**: Browser Camera API (WebRTC)
- **Local Storage**: IndexedDB (Dexie.js or similar wrapper)
- **Analytics**: PostHog (free tier)
- **Backend**: Python FastAPI (existing), build123d (existing)

**Platform Constraints:**

- **iOS Safari PWA quirks**: Camera permission flow, installation flow, storage limits
- **Chrome Android**: Different permission models, installation prompts
- **WebGL 2.0 requirement**: Limits older devices (pre-2019)
- **Camera API**: Requires HTTPS and user permission
- **IndexedDB limits**: ~50MB typical, up to 1GB with user approval

### Cross-Cutting Concerns Identified

These architectural concerns will affect multiple components and require coordinated design:

1. **Error Recovery & Graceful Degradation**:
   - Free retry mechanism (3x attempts)
   - Scale-down option when inventory doesn't match
   - Template fallback when AI generation fails
   - Camera scan retry with guidance
   - Affects: AI pipeline, UI components, state management

2. **Camera Permission UX**:
   - Pre-permission explanation screens
   - Platform-specific permission flows (iOS vs Android)
   - Permission denied recovery instructions
   - Affects: Onboarding, scanning flow, settings

3. **Progress & Loading States**:
   - "Progress storytelling" during AI wait ("Imagining... Finding... Building...")
   - Loading animations for all async operations
   - Skeleton screens for content loading
   - Affects: All user-facing components, UX feel

4. **Offline/Online State Management**:
   - Sync strategy (local-first, MVP is local-only)
   - Network status detection
   - Queue AI requests when offline
   - Cache invalidation strategy
   - Affects: Data layer, service worker, UI feedback

5. **Analytics & Tracking**:
   - Anonymous device ID generation (no auth in MVP)
   - Event tracking across user journeys
   - Privacy-first approach (no PII, no server-side image storage)
   - Affects: All user interactions, business intelligence

6. **Accessibility & Inclusivity**:
   - All-ages design (8 to 45 years old)
   - WCAG AA compliance (keyboard nav, contrast, labels)
   - Touch-first with 44px minimum targets
   - Reduced motion support
   - Affects: All UI components, interaction patterns

7. **Multi-Image Handling**:
   - Image upload (up to 4 images per generation request)
   - Image preview/reorder UI
   - Temporary storage and cleanup
   - Multi-image context for AI (primary + references)
   - Affects: Upload component, AI pipeline, storage management

8. **Buildability Validation**:
   - Physics-aware structural checks (staggered joints, gravity, cantilevers)
   - Real-time inventory matching
   - Constraint propagation (if scaled down, recalculate layer counts)
   - Affects: AI generation, instructions rendering, user feedback

9. **Celebration & Shareability**:
   - Build completion moments
   - Share card generation (creation name, stats, screenshot)
   - Social sharing integration (v1.2 feature, but architecture should plan for it)
   - Affects: Build state management, UI components, future community features

10. **First-Build Guarantee Philosophy**:
    - Conservative first designs for new users
    - User profiling (first-time vs returning)
    - Progressive complexity unlock
    - Affects: AI prompt engineering, template selection, user state tracking

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack Progressive Web Application (PWA)** - Monorepo with:
- Frontend: Next.js 16+ (React 19, TypeScript, Tailwind CSS 4)
- Backend: Python FastAPI (existing Forma AI service)

### Monorepo Structure Decision

**Single Monorepo** with workspace organization:
```
lego-builder-python/
├── frontend/          # Next.js PWA
├── backend/           # Python FastAPI (existing)
├── shared/            # Shared types/configs (optional)
├── docs/              # Project documentation
├── pnpm-workspace.yaml
└── package.json       # Root workspace config
```

### Package Manager Selection

**pnpm** - Chosen for:
- Superior monorepo workspace support
- 30-50% faster than npm
- Disk space efficiency (critical for large dependencies like Three.js)
- Stable and widely adopted

### Starter Options Considered

**Option 1: Comprehensive PWA Starter Templates**
- `AjayKanniyappan/nextjs-pwa-template` - Full PWA with 100% Lighthouse
- `skolldev/nextjs-tailwind-typescript-starter` - PWA-focused with Tailwind
- **Verdict**: ❌ Not chosen - potential version lag, unnecessary features, harder to customize

**Option 2: Official Next.js CLI + Manual Configuration** ✅
- `create-next-app@latest` as foundation
- Manual addition of PWA, Shadcn/ui, Three.js, domain-specific libraries
- **Verdict**: ✅ **Selected** - Latest versions, full control, easier maintenance

### Selected Approach: Hybrid Setup

**Rationale for Selection:**

1. **Latest Technology Guaranteed**: Official Next.js CLI always uses current versions (Next.js 16, React 19)
2. **Full Architectural Control**: Add exactly what's needed for Lego Builder's unique requirements
3. **Better Understanding**: Solo developer benefits from building up vs. stripping down
4. **Unique Requirements**: Camera API, multi-image upload, 3D inventory matching aren't in generic starters
5. **Maintainability**: Following official patterns makes updates straightforward
6. **Time Efficient**: ~2-3 hours setup is negligible in 8-12 week project

**Party Mode Consensus:** Winston (Architect), Barry (Quick Flow Solo Dev), and Amelia (Developer) unanimously agreed on the hybrid approach, emphasizing that unique project requirements don't fit generic starters, and solo developers benefit from full understanding over quick start.

**Initialization Sequence:**

```bash
# 1. Initialize pnpm workspace root
mkdir lego-builder-python && cd lego-builder-python
pnpm init
echo "packages:\n  - 'frontend'\n  - 'backend'" > pnpm-workspace.yaml

# 2. Create Next.js frontend
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

# 3. Setup Shadcn/ui design system
cd frontend
npx shadcn@latest init

# 4. Add PWA support
pnpm add next-pwa
# Configure next.config.ts, public/manifest.json, public/icons

# 5. Add 3D rendering dependencies
pnpm add three @react-three/fiber @react-three/drei three-stdlib

# 6. Add domain-specific dependencies
pnpm add dexie                    # IndexedDB wrapper
pnpm add posthog-js               # Analytics
pnpm add @types/three --save-dev  # Three.js TypeScript types

# 7. Backend remains in existing /backend directory
# No changes needed to existing Python FastAPI setup
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- **TypeScript 5.x** with strict mode enabled
- **Next.js 16** with App Router (React Server Components)
- **React 19** with latest concurrent features
- **Node.js 20.9+** runtime requirement

**Styling Solution:**
- **Tailwind CSS 4.0** with PostCSS
- **Shadcn/ui** component library (Radix UI primitives)
- **CSS Modules** available for component-scoped styles
- **8px grid system** via Tailwind spacing scale
- **Lego color palette** via CSS custom properties

**Build Tooling:**
- **Turbopack** for development (Next.js default)
- **Webpack** for production builds (Next.js optimized)
- **SWC** for TypeScript/JSX compilation (fast Rust-based)
- **PWA** service worker generation via next-pwa

**Testing Framework:**
- **Vitest** for unit testing (from UX spec requirements)
- **React Testing Library** for component tests
- **Playwright** for E2E tests (optional, mentioned in docs)

**Code Organization:**
```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── ui/          # Shadcn/ui primitives
│   │   ├── chat/        # Chat-specific components
│   │   └── model-viewer/ # 3D viewer components
│   └── lib/             # Utilities, API client, hooks
├── public/              # Static assets, PWA manifest
└── __tests__/           # Test files
```

**Development Experience:**
- **Hot Module Replacement** via Turbopack
- **TypeScript** type checking on save
- **ESLint** with Next.js rules
- **Prettier** for code formatting (via Shadcn/ui setup)
- **PWA development** with service worker hot reload

**Environment Configuration:**
- `.env.local` for development secrets
- `.env.production` for production config
- `NEXT_PUBLIC_*` prefix for client-exposed vars
- `NEXT_PUBLIC_API_URL` for backend URL configuration

**Integration Points:**
- **Backend API**: Via `/src/lib/api.ts` client (already documented in brownfield docs)
- **PWA Manifest**: `/public/manifest.json` with Lego Builder branding
- **Service Worker**: Auto-generated by next-pwa for offline support
- **Camera API**: Browser-native via `navigator.mediaDevices.getUserMedia()`

**Note:** Frontend initialization using this sequence should be **Story 0** (setup task) in the epics implementation, before any feature development begins.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- State Management: Zustand v5.x
- IndexedDB Schema: Dexie.js v4.2.1 with 5-table design
- Data Sync Strategy: Local-first, no sync (MVP)
- API Client Architecture: Extend existing `/lib/api.ts`
- API Key Management: Next.js API Routes (server-side)

**Important Decisions (Shape Architecture):**
- Component Architecture: Compound Components pattern
- Multi-Image Upload: FormData (multipart) for up to 4 images
- Deployment Platform: Vercel (frontend)

**Deferred Decisions (Post-MVP):**
- Cloud Sync: Deferred to v1.1 with authentication
- Advanced CI/CD: Basic pipeline (lint, build, test) sufficient for MVP
- Monitoring: PostHog analytics only, defer error tracking to v1.1

### Data Architecture

**State Management: Zustand v5.x**
- **Version:** 5.x (latest stable, Jan 2026)
- **Rationale:** Minimal boilerplate, excellent TypeScript support, built-in persistence middleware for offline-first PWA, optimized re-renders critical for 3D viewer and camera performance
- **Implementation:** Separate stores for inventory, builds, UI state with zustand/middleware for IndexedDB persistence
- **Affects:** All frontend components, offline data sync, user state management

**IndexedDB Schema: Dexie.js v4.2.1**
- **Version:** Dexie.js 4.2.1 + dexie-react-hooks 4.2.0
- **Schema Design:** 5 tables - `bricks`, `builds`, `templates`, `userPreferences`, `generationCache`
- **Key Decisions:**
  - Image storage: Base64 in JSON (MVP), migrate to Blobs if needed
  - Cache TTL: 7 days for AI generation cache
  - Build instructions: Embedded in Build record for fast offline access
- **Rationale:** Balanced schema supporting offline-first PWA, clear domain separation, optimized for common query patterns
- **Affects:** Offline data persistence, build resume functionality, brick inventory management, template browsing
- **Action Item (Winston):** Implement cache cleanup background job to purge expired `generationCache` entries

**Data Sync Strategy: Local-First, No Sync (MVP)**
- **Approach:** All data persists to IndexedDB only, no cloud sync in MVP
- **Network Boundary:** Only AI generation requires network (Gemini API calls)
- **Online Detection:** React hook (`useOnlineStatus`) for network status
- **Offline Capabilities:**
  - ✅ Browse saved builds, continue building, view inventory, cached templates
  - ❌ Generate new models, camera processing (requires backend)
- **Future:** Cloud sync deferred to v1.1 with authentication and conflict resolution
- **Rationale:** Aligns with PRD MVP scope, simpler implementation, faster time-to-market, clear network boundary
- **Affects:** PWA offline experience, AI generation flow, user expectations, future sync complexity

### API & Communication Patterns

**API Client Architecture: Extend Existing `/lib/api.ts`**
- **Approach:** Build on existing brownfield A2A protocol client with Lego-specific wrappers
- **Key Functions:**
  - `generateLegoModel(type, prompt, images, inventory, options)` - Wrapper for text/image generation
  - `scanBricks(imageFile)` - Camera scan endpoint
  - `getTemplates(category)` - Template library
- **Error Handling:** Structured `APIError` with `code`, `message`, `retryable` flag
- **Rationale:** Leverages documented A2A protocol, existing TypeScript types, minimal code duplication
- **Affects:** AI generation, camera scanning, template fetching, error recovery UI
- **Action Item (Amelia):** Add request/response interceptors for auth headers (v1.1), automatic retry on 429 rate limit, request ID logging

**Multi-Image Upload Protocol: FormData (Multipart)**
- **Approach:** HTTP multipart/form-data for up to 4 images
- **Implementation:**
  ```typescript
  const formData = new FormData()
  formData.append('prompt', prompt)
  images.forEach((img, i) => formData.append(`image_${i}`, img))
  formData.append('inventory', JSON.stringify(inventory))
  ```
- **Validation:** Client-side checks (max 4 images, 10MB per image) + server-side validation
- **Rationale:** Standard HTTP protocol, efficient binary transfer, backend-compatible
- **Alternative Rejected:** Base64 in JSON (33% size increase, slower for large images)
- **Affects:** Image-to-Lego generation, upload UI, backend integration

**Task Polling Strategy: A2A Protocol (Existing)**
- **Approach:** Use existing A2A async task management
- **Flow:** `POST /v1/message:send` → Poll `GET /v1/tasks/{taskId}` → `COMPLETED` status
- **Polling:** Exponential backoff (existing implementation in `/lib/api.ts`)
- **Rationale:** Brownfield protocol already handles long-running AI tasks
- **Affects:** AI generation UX, progress storytelling, loading states

### Frontend Architecture

**Component Architecture: Compound Components Pattern**
- **Pattern:** Shadcn/ui style composable components
- **Example:**
  ```tsx
  <LayerView>
    <LayerView.Model />
    <LayerView.Progress step={3} total={12} />
    <LayerView.Navigation />
  </LayerView>
  ```
- **Rationale:** Matches Shadcn/ui design system, flexible composition for complex components (3D viewer, camera, instructions), clear API surface
- **Affects:** 3D Model Viewer, Layer Instruction View, Camera Scanning, all custom components
- **Action Item (Amelia):** Document component composition patterns with examples for future developers and AI agents

**Route Structure: Next.js App Router**
- **Structure:**
  ```
  app/
  ├── page.tsx              # Home (onboarding or dashboard)
  ├── generate/page.tsx     # AI generation (text/image mode)
  ├── build/[id]/page.tsx   # Layer-by-layer instructions
  ├── inventory/page.tsx    # Brick inventory management
  ├── templates/page.tsx    # Browse templates
  └── api/
      └── generate/route.ts # Server-side Gemini API calls
  ```
- **Rationale:** App Router leverages React Server Components, clear URL structure for PWA navigation
- **Affects:** Navigation, deep linking, SEO (landing pages), route-level data loading

**Error Boundaries: Component-Level**
- **Strategy:** Error boundaries for each major feature (3D viewer, camera, generation)
- **Fallback UI:** Graceful degradation with retry option
- **Global Boundary:** Root layout catches catastrophic errors
- **Rationale:** Isolated failures don't crash entire app, better UX for partial failures
- **Affects:** Fault tolerance, user experience during errors, debugging

### Security

**API Key Management: Next.js API Routes (Server-Side)**
- **Approach:** Gemini API calls via `/app/api/generate/route.ts` - keys never exposed to client
- **Environment:** `GOOGLE_API_KEY` in `.env.local` (dev) and Vercel secrets (prod)
- **Client Flow:** Frontend → Next.js API Route → Gemini API → Response
- **Rationale:** Standard Next.js pattern, prevents key exposure, CORS handled server-side, cost control (prevents key scraping)
- **Affects:** AI generation security, API key rotation, deployment configuration

**Image Upload Security: Basic Validation (MVP)**
- **File Type:** Validate MIME type (image/jpeg, image/png, image/webp)
- **File Size:** 10MB per image maximum (4 images = 40MB total)
- **Sanitization:** Basic client-side validation, backend performs final validation
- **Rationale:** MVP baseline security, prevents obvious abuse, backend does final validation
- **Affects:** Upload component, error messaging, backend integration

### Infrastructure & Deployment

**Deployment Platform: Vercel (Frontend)**
- **Frontend:** Next.js PWA hosted on Vercel
- **Backend:** Existing Python FastAPI deployment (separate, unchanged)
- **Rationale:** Vercel optimized for Next.js, zero-config PWA support, generous free tier, preview deployments
- **Monorepo:** Frontend deployed separately from backend (independent release cycles)
- **Affects:** CI/CD, preview environments, production deployment

**CI/CD Pipeline: GitHub Actions + Vercel Auto-Deploy**
- **GitHub Actions:**
  ```yaml
  - Lint (ESLint)
  - Type-check (TypeScript)
  - Unit tests (Vitest)
  - Build test (pnpm build)
  ```
- **Quality Gates:** 80%+ code coverage, 0 TypeScript errors, 0 ESLint errors, successful build
- **Vercel:** Auto-deploy on push to main, preview deployments on PRs
- **Rationale:** Industry standard, free for open source, fast feedback loop
- **Affects:** Code quality gates, deployment automation, team workflows
- **Action Item (Murat):** Add E2E PWA tests (Playwright) to CI/CD pipeline before v1.0 launch

### Decision Impact Analysis

**Implementation Sequence:**
1. **Setup:** pnpm workspace, create-next-app, Shadcn/ui init (Story 0)
2. **Data Layer:** Zustand stores + Dexie.js schema (Foundation)
3. **API Client:** Extend `/lib/api.ts` with Lego functions (Integration)
4. **API Routes:** `/app/api/generate/route.ts` for secure Gemini calls (Security)
5. **Core Features:** Build on data + API foundation (Features)

**Cross-Component Dependencies:**
- **Zustand** ← **Dexie.js** (persistence middleware)
- **API Client** ← **API Routes** (server-side key management)
- **Components** ← **Zustand** (state subscription)
- **PWA Service Worker** ← **Dexie.js** (offline data caching)

**Party Mode Validation:**
- **Winston (Architect):** Approved data architecture, API strategy, infrastructure. Low risk, proven technology.
- **Amelia (Developer):** Confirmed implementability, TypeScript strict null checks required, request interceptors needed.
- **Murat (Test Architect):** Architecture is testable, E2E PWA tests critical for launch, clear testing strategy defined.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 18 areas where AI agents could make different implementation choices

**Pattern Coverage:**
- Naming Patterns (6 categories)
- Structure Patterns (4 categories)
- Format Patterns (4 categories)
- Communication/State Patterns (4 categories)

### Naming Patterns

**Database Naming Conventions (Dexie.js):**
- **Tables:** `camelCase`, plural for collections (`bricks`, `builds`, `templates`, `userPreferences`, `generationCache`)
- **Fields:** `camelCase` (`userId`, `createdAt`, `modelUrl`, `inventoryMatch`)
- **Primary Keys:** `id` (auto-increment, optional in TypeScript interface)
- **Foreign Keys:** `[entity]Id` format (`userId`, `buildId`)
- **Indexes:** Defined in `.stores()` schema as comma-separated list

**Example:**
```typescript
// CORRECT
export interface Build {
  id?: number;
  name: string;
  createdAt: Date;
  currentStep: number;
}

// INCORRECT - snake_case, capitalized
export interface Build {
  ID?: number;
  build_name: string;
  created_at: Date;
}
```

**API Naming Conventions:**
- **Endpoints:** `/api/lowercase` with hyphens for multi-word (`/api/generate`, `/api/scan-bricks`, `/api/templates`)
- **Route Parameters:** `[id]` format in Next.js App Router (`/build/[id]/page.tsx`)
- **Query Parameters:** `camelCase` (`?category=animals&inventoryMatch=true`)
- **HTTP Methods:** Standard REST (GET, POST, PUT, DELETE)

**Example:**
```typescript
// CORRECT
POST /api/generate
GET /api/templates?category=animals
GET /build/[id]

// INCORRECT - camelCase URLs, snake_case params
POST /api/generateModel
GET /api/templates?category_name=animals
```

**Code Naming Conventions:**
- **Files:** `kebab-case.tsx` for components (`brick-inventory.tsx`, `model-viewer.tsx`, `use-online-status.ts`)
- **Components:** `PascalCase` (`BrickInventory`, `ModelViewer`, `LayerView`)
- **Functions:** `camelCase` verbs (`getUserData`, `addBrick`, `generateModel`)
- **Variables:** `camelCase` nouns (`brickCount`, `isOnline`, `currentBuild`)
- **Constants:** `UPPER_SNAKE_CASE` (`MAX_IMAGES`, `CACHE_TTL_DAYS`)
- **Types/Interfaces:** `PascalCase` (`Build`, `Brick`, `APIError`)

**Example:**
```typescript
// CORRECT
const MAX_IMAGES = 4;
const brickCount = inventory.length;
function addBrick(brick: Brick) { ... }
interface BuildMetadata { ... }

// INCORRECT - mixed conventions
const maxImages = 4;
const BrickCount = inventory.length;
function AddBrick(brick: Brick) { ... }
```

**Zustand Store Naming:**
- **Store Files:** `use[Domain]Store.ts` (`useInventoryStore.ts`, `useBuildsStore.ts`, `useUIStore.ts`)
- **Store Hook:** `use[Domain]Store` exported function
- **Actions:** `camelCase` verbs (`addBrick`, `removeBrick`, `updateBuild`, `setLoading`)
- **Selectors:** `camelCase` getters (`getBricksByColor`, `getActiveBuild`)

**Example:**
```typescript
// CORRECT - useInventoryStore.ts
export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      bricks: [],
      addBrick: (brick) => set((state) => ({ bricks: [...state.bricks, brick] })),
      getBricksByColor: (color) => get().bricks.filter(b => b.color === color),
    }),
    { name: 'brick-inventory' }
  )
)

// INCORRECT - wrong file name, action names
// inventory_store.ts
export const InventoryStore = create(() => ({
  add_brick: (brick) => { ... }
}))
```

### Structure Patterns

**Project Organization:**
- **Tests:** Co-located with source files (`brick-inventory.tsx` + `brick-inventory.test.tsx`)
- **Test Directory:** `__tests__/` only for integration/E2E tests, not unit tests
- **Components:** Organized by feature under `/components/[feature]/`
  - `/components/inventory/` - Brick inventory components
  - `/components/viewer/` - 3D model viewer components
  - `/components/instructions/` - Build instruction components
  - `/components/camera/` - Camera scanning components
  - `/components/ui/` - Shadcn/ui primitives (special case)
- **Utilities:** `/lib/utils/` for shared utilities, `/components/[feature]/utils/` for feature-specific
- **Hooks:** `/lib/hooks/` for shared hooks (`use-online-status.ts`), `/components/[feature]/hooks/` for feature-specific
- **Stores:** `/lib/stores/` for all Zustand stores
- **API:** `/lib/api.ts` (existing client) + `/app/api/` for Next.js API Routes

**File Structure Pattern:**
```
frontend/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx               # Home
│   │   ├── generate/page.tsx      # AI generation
│   │   ├── build/[id]/page.tsx    # Instructions
│   │   └── api/
│   │       └── generate/route.ts  # Server-side Gemini
│   ├── components/
│   │   ├── inventory/
│   │   │   ├── brick-inventory.tsx
│   │   │   ├── brick-inventory.test.tsx
│   │   │   ├── brick-card.tsx
│   │   │   └── utils/
│   │   ├── viewer/
│   │   │   ├── model-viewer.tsx
│   │   │   ├── model-viewer.test.tsx
│   │   │   └── controls.tsx
│   │   └── ui/                    # Shadcn/ui
│   └── lib/
│       ├── api.ts                 # Extended API client
│       ├── db.ts                  # Dexie.js schema
│       ├── stores/
│       │   ├── useInventoryStore.ts
│       │   ├── useBuildsStore.ts
│       │   └── useUIStore.ts
│       ├── hooks/
│       │   └── use-online-status.ts
│       └── utils/
│           ├── formatting.ts
│           └── validation.ts
├── public/
│   ├── manifest.json              # PWA manifest
│   └── icons/                     # PWA icons
└── __tests__/
    └── e2e/                       # Playwright E2E tests
```

**Static Asset Organization:**
- **PWA Assets:** `/public/manifest.json`, `/public/icons/`
- **Images:** `/public/images/` for static images
- **Fonts:** Loaded via Next.js font optimization (not public)

### Format Patterns

**API Response Formats:**
- **Success Response:** Direct payload, no wrapper
  ```typescript
  // CORRECT
  { modelUrl: "https://...", taskId: "abc123" }
  
  // INCORRECT - wrapped
  { data: { modelUrl: "..." }, success: true }
  ```
- **Error Response:** Standard structure
  ```typescript
  {
    code: "GENERATION_FAILED" | "NETWORK_ERROR" | "VALIDATION_ERROR",
    message: "User-friendly error message",
    retryable: true | false,
    details?: any  // Optional technical details
  }
  ```
- **Pagination:** Not needed for MVP (local-first, all data in IndexedDB)

**Data Exchange Formats:**
- **JSON Fields:** `camelCase` everywhere (TypeScript/JavaScript convention)
- **Dates:** ISO 8601 strings (`"2026-01-07T00:00:00Z"`) for API/JSON, `Date` objects in TypeScript
- **Booleans:** `true`/`false` (not `1`/`0` or strings)
- **Null Handling:** Use `null` for absent values, `undefined` for optional properties
- **Arrays:** Always use arrays for collections, even single items (`images: [file]` not `image: file`)

**Example:**
```typescript
// CORRECT
interface Build {
  id: number;
  name: string;
  createdAt: string;  // ISO 8601 in JSON
  completedAt: string | null;  // null if not completed
  images: string[];  // Always array
}

// INCORRECT - mixed formats
interface Build {
  build_id: number;
  BuildName: string;
  created_at: 1704585600000;  // Unix timestamp
  completed_at: "";  // Empty string instead of null
  image?: string;  // Single optional
}
```

### Communication Patterns

**Zustand State Management Patterns:**
- **State Updates:** ALWAYS immutable (spread operators, no direct mutations)
  ```typescript
  // CORRECT - immutable
  addBrick: (brick) => set((state) => ({
    bricks: [...state.bricks, brick]
  })),
  
  // INCORRECT - mutation
  addBrick: (brick) => set((state) => {
    state.bricks.push(brick);  // ❌ Direct mutation
    return state;
  }),
  ```
- **Action Naming:** Verbs describing the change (`addBrick`, `removeBrick`, `updateBuild`, `setLoading`)
- **Selectors:** Separate functions or computed in `get()` calls, not stored in state
- **Persist Configuration:** Use `zustand/middleware` persist for offline data
  ```typescript
  persist(
    (set, get) => ({ /* store */ }),
    { name: 'storage-key' }  // IndexedDB key
  )
  ```

**Event/Analytics Patterns:**
- **PostHog Events:** `snake_case` event names (PostHog convention)
  ```typescript
  posthog.capture('brick_scanned', { color: 'red', type: '2x4' })
  posthog.capture('build_completed', { buildId: 123, stepCount: 12 })
  ```
- **Event Properties:** `camelCase` property keys (JavaScript objects)

### Process Patterns

**Error Handling Patterns:**
- **Component-Level Errors:** Error boundaries for major features (3D viewer, camera, generation)
- **Global Errors:** Root layout error boundary catches unhandled exceptions
- **User-Facing Messages:** Clear, actionable, avoid technical jargon
  ```typescript
  // CORRECT
  "Camera access denied. Please enable camera in your browser settings."
  
  // INCORRECT
  "navigator.mediaDevices.getUserMedia() failed with NotAllowedError"
  ```
- **Retry Logic:** All retryable errors include retry button/option
- **Error Logging:** Console errors for debugging, PostHog for production tracking

**Loading State Patterns:**
- **Naming:** `isLoading`, `isGenerating`, `isScanning` (boolean flags)
- **Granular States:** Feature-specific loading states, not global
  ```typescript
  // CORRECT - per-feature
  const useGenerationStore = create((set) => ({
    isGenerating: false,
    isPolling: false,
  }))
  
  // INCORRECT - global
  const useGlobalStore = create((set) => ({
    loading: true,  // What's loading?
  }))
  ```
- **UI Feedback:** Always show loading state for operations >200ms
- **Progress Storytelling:** Use descriptive loading messages ("Imagining your creation...")

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow naming conventions exactly (camelCase DB/JSON, kebab-case files, PascalCase components)
- Use co-located tests (`*.test.tsx` next to source)
- Organize components by feature under `/components/[feature]/`
- Return direct API responses (no wrappers)
- Use immutable state updates in Zustand stores
- Implement error boundaries for major features
- Include retry logic for all retryable errors
- Use ISO 8601 date strings in JSON/API
- Export Zustand stores as `use[Domain]Store` hooks

**Pattern Violations:**
- Must be flagged in code review (manual or automated)
- ESLint + TypeScript will catch many violations automatically
- Documented in issue tracker if pattern needs updating

**Pattern Updates:**
- Propose via architecture document amendments
- Requires team consensus (or user approval for solo dev)
- Update all related code when pattern changes

### Pattern Examples

**Good Example - Component with Store:**
```typescript
// components/inventory/brick-inventory.tsx
import { useInventoryStore } from '@/lib/stores/useInventoryStore'

export function BrickInventory() {
  const bricks = useInventoryStore((state) => state.bricks)
  const addBrick = useInventoryStore((state) => state.addBrick)
  
  return (
    <div className="grid gap-4">
      {bricks.map(brick => (
        <BrickCard key={brick.id} brick={brick} />
      ))}
    </div>
  )
}
```

**Good Example - API Route with Error Handling:**
```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, images } = await request.json()
    
    // Gemini API call
    const result = await generateModel(prompt, images)
    
    // Direct response (no wrapper)
    return NextResponse.json({
      modelUrl: result.url,
      taskId: result.id
    })
    
  } catch (error) {
    // Structured error
    return NextResponse.json({
      code: 'GENERATION_FAILED',
      message: 'Failed to generate model. Please try again.',
      retryable: true
    }, { status: 500 })
  }
}
```

**Anti-Patterns (Avoid These):**

```typescript
// ❌ WRONG - snake_case file name
// components/inventory/brick_inventory.tsx

// ❌ WRONG - capitalized table name
export interface User {  // Should be lowercase for Dexie
  ID: number;  // Should be id
}

// ❌ WRONG - wrapped API response
return { data: { modelUrl }, success: true }

// ❌ WRONG - state mutation
updateBrick: (id, data) => set((state) => {
  const brick = state.bricks.find(b => b.id === id);
  brick.quantity = data.quantity;  // Direct mutation!
  return state;
})

// ❌ WRONG - non-co-located test
// __tests__/components/brick-inventory.test.tsx
// Should be: components/inventory/brick-inventory.test.tsx

// ❌ WRONG - generic loading state
const { loading } = useGlobalStore()  // What's loading?
// Should be: const { isGenerating } = useGenerationStore()
```

### Pattern Rationale Summary

These patterns prevent common AI agent conflicts by:
- **Naming consistency** prevents "the same thing with different names" bugs
- **Structural consistency** prevents "I can't find the file" issues
- **Format consistency** enables interoperability between components/APIs
- **State management consistency** prevents race conditions and stale data
- **Error handling consistency** provides uniform UX across features

All patterns align with industry standards (Next.js, React, TypeScript, Zustand) to maximize ecosystem compatibility and developer familiarity.

## Project Structure & Boundaries

### Complete Project Directory Structure

```
lego-builder-python/
├── README.md
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml             # pnpm workspace definition
├── .gitignore
│
├── frontend/                       # Next.js PWA
│   ├── README.md
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── next.config.ts              # Next.js + PWA config (next-pwa)
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── components.json             # Shadcn/ui config
│   ├── .env.local
│   ├── .env.example
│   ├── .gitignore
│   │
│   ├── .github/
│   │   └── workflows/
│   │       └── ci.yml              # GitHub Actions (lint, test, build)
│   │
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx          # Root layout + global error boundary
│   │   │   ├── page.tsx            # Home (onboarding or dashboard)
│   │   │   │
│   │   │   ├── generate/
│   │   │   │   └── page.tsx        # AI generation (text/image mode)
│   │   │   │
│   │   │   ├── build/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Layer-by-layer instructions
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   └── page.tsx        # Brick inventory management
│   │   │   │
│   │   │   ├── templates/
│   │   │   │   └── page.tsx        # Browse templates
│   │   │   │
│   │   │   ├── builds/
│   │   │   │   └── page.tsx        # Build gallery (saved builds)
│   │   │   │
│   │   │   └── api/
│   │   │       └── generate/
│   │   │           └── route.ts    # Server-side Gemini API calls
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                 # Shadcn/ui primitives
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── generation/         # AI generation feature
│   │   │   │   ├── text-mode.tsx
│   │   │   │   ├── text-mode.test.tsx
│   │   │   │   ├── image-mode.tsx
│   │   │   │   ├── image-mode.test.tsx
│   │   │   │   ├── image-upload.tsx
│   │   │   │   ├── image-upload.test.tsx
│   │   │   │   ├── retry-button.tsx
│   │   │   │   └── generation-progress.tsx
│   │   │   │
│   │   │   ├── inventory/          # Brick inventory
│   │   │   │   ├── brick-inventory.tsx
│   │   │   │   ├── brick-inventory.test.tsx
│   │   │   │   ├── brick-card.tsx
│   │   │   │   ├── brick-scanner.tsx
│   │   │   │   └── utils/
│   │   │   │       └── brick-matching.ts
│   │   │   │
│   │   │   ├── viewer/             # 3D Model Viewer
│   │   │   │   ├── model-viewer.tsx
│   │   │   │   ├── model-viewer.test.tsx
│   │   │   │   ├── controls.tsx
│   │   │   │   ├── camera-setup.ts
│   │   │   │   └── lighting.ts
│   │   │   │
│   │   │   ├── instructions/       # Build instructions
│   │   │   │   ├── layer-view.tsx
│   │   │   │   ├── layer-view.test.tsx
│   │   │   │   ├── step-navigation.tsx
│   │   │   │   ├── progress-tracker.tsx
│   │   │   │   └── missing-brick-alert.tsx
│   │   │   │
│   │   │   ├── templates/          # Template browsing
│   │   │   │   ├── template-grid.tsx
│   │   │   │   ├── template-card.tsx
│   │   │   │   └── category-filter.tsx
│   │   │   │
│   │   │   ├── camera/             # Camera scanning
│   │   │   │   ├── camera-capture.tsx
│   │   │   │   ├── camera-permissions.tsx
│   │   │   │   └── scan-preview.tsx
│   │   │   │
│   │   │   ├── onboarding/         # First-time user flow
│   │   │   │   ├── welcome-screen.tsx
│   │   │   │   ├── tutorial-steps.tsx
│   │   │   │   └── skip-button.tsx
│   │   │   │
│   │   │   └── builds/             # Build management
│   │   │       ├── build-gallery.tsx
│   │   │       ├── build-card.tsx
│   │   │       └── celebration-modal.tsx
│   │   │
│   │   └── lib/
│   │       ├── api.ts              # Extended A2A protocol client
│   │       ├── api.test.ts
│   │       ├── db.ts               # Dexie.js schema
│   │       ├── db.test.ts
│   │       ├── analytics.ts        # PostHog integration
│   │       │
│   │       ├── stores/             # Zustand stores
│   │       │   ├── useInventoryStore.ts
│   │       │   ├── useInventoryStore.test.ts
│   │       │   ├── useBuildsStore.ts
│   │       │   ├── useBuildsStore.test.ts
│   │       │   ├── useUIStore.ts
│   │       │   └── useGenerationStore.ts
│   │       │
│   │       ├── hooks/              # Custom React hooks
│   │       │   ├── use-online-status.ts
│   │       │   ├── use-online-status.test.ts
│   │       │   ├── use-first-build.ts
│   │       │   └── use-camera-permissions.ts
│   │       │
│   │       └── utils/              # Shared utilities
│   │           ├── formatting.ts
│   │           ├── validation.ts
│   │           └── cn.ts           # Tailwind class merging
│   │
│   ├── public/
│   │   ├── manifest.json           # PWA manifest
│   │   ├── robots.txt
│   │   ├── icons/                  # PWA icons
│   │   │   ├── generate-icons.sh   # Icon generation script
│   │   │   ├── icon-192x192.png
│   │   │   ├── icon-512x512.png
│   │   │   └── apple-touch-icon.png
│   │   └── images/                 # Static images
│   │
│   └── __tests__/
│       ├── e2e/                    # Playwright E2E tests
│       │   ├── playwright.config.ts
│       │   ├── generation.spec.ts
│       │   ├── inventory.spec.ts
│       │   └── pwa.spec.ts
│       ├── integration/            # Vitest integration tests
│       │   ├── offline-sync.test.ts
│       │   ├── generation-flow.test.ts
│       │   └── camera-flow.test.ts
│       └── setup/
│           └── test-utils.tsx      # Render helpers, mock providers
│
├── backend/                        # Python FastAPI (existing, unchanged)
│   ├── README.md
│   ├── requirements.txt
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── .env.example
│   ├── main.py
│   ├── config.py
│   ├── routes/
│   │   └── a2a.py
│   ├── agents/
│   │   ├── control_flow.py
│   │   ├── designer.py
│   │   ├── coder.py
│   │   └── renderer.py
│   ├── rag/
│   │   └── rag_system.py
│   └── utils/
│
├── docs/                           # Project documentation (existing)
│   ├── index.md
│   ├── project-overview.md
│   ├── architecture-backend.md
│   ├── architecture-frontend.md
│   ├── integration-architecture.md
│   ├── development-guide-backend.md
│   └── development-guide-frontend.md
│
└── _bmad-output/                   # BMAD workflow artifacts
    └── planning-artifacts/
        └── architecture.md         # This document
```

### Architectural Boundaries

**API Boundaries:**
- **Frontend → Backend:** HTTP REST via A2A protocol
  - `POST /v1/message:send` - Submit AI generation task
  - `GET /v1/tasks/{taskId}` - Poll task status
  - `GET /download/{filename}` - Download STEP/STL files
- **Frontend → Gemini API:** Via Next.js API Routes (server-side only)
  - `/app/api/generate/route.ts` - Proxy for Gemini calls
  - Prevents API key exposure to client
- **Component → State:** Zustand stores (reactive subscriptions)
- **Component → Data:** Dexie.js IndexedDB (async queries)

**Component Boundaries:**
- **Feature Components:** Self-contained with local state + global store integration
  - `/components/inventory/` - Owns brick data, consumes `useInventoryStore`
  - `/components/viewer/` - Owns 3D rendering, consumes model data from props
  - `/components/generation/` - Owns generation UI, consumes `useGenerationStore`
- **Compound Components:** Internal communication via React Context
  - `<LayerView>` with `<LayerView.Model>`, `<LayerView.Progress>`, `<LayerView.Navigation>`
- **Error Boundaries:** Isolate failures per feature
  - Generation errors don't crash inventory
  - 3D viewer errors don't crash instructions

**Service Boundaries:**
- **Frontend Services:**
  - `/lib/api.ts` - A2A protocol client (HTTP layer)
  - `/lib/db.ts` - IndexedDB access (data layer)
  - `/lib/analytics.ts` - PostHog tracking (telemetry layer)
- **Backend Services:** (existing, unchanged)
  - Agent orchestration (control_flow, designer, coder, renderer)
  - RAG system (build123d documentation)

**Data Boundaries:**
- **Client-Side Storage (IndexedDB):**
  - `bricks` table - User's brick inventory
  - `builds` table - Saved builds and progress
  - `templates` table - Cached templates
  - `userPreferences` table - Settings, first-time flags
  - `generationCache` table - AI response cache (7-day TTL)
- **Server-Side Storage:** Backend handles temporary task files, no persistence needed from frontend

### Requirements to Structure Mapping

**Feature/Epic Mapping:**

**Model Generation (7 FRs):**
- Components: `/components/generation/`
- Pages: `/app/generate/page.tsx`
- API Routes: `/app/api/generate/route.ts`
- Store: `/lib/stores/useGenerationStore.ts`
- Tests: `/components/generation/*.test.tsx`, `__tests__/e2e/generation.spec.ts`

**Brick Inventory (5 FRs):**
- Components: `/components/inventory/`
- Pages: `/app/inventory/page.tsx`
- Store: `/lib/stores/useInventoryStore.ts`
- Database: Dexie.js `bricks` table in `/lib/db.ts`
- Tests: `/components/inventory/*.test.tsx`, `__tests__/e2e/inventory.spec.ts`

**Build Instructions (6 FRs):**
- Components: `/components/instructions/`
- Pages: `/app/build/[id]/page.tsx`
- Store: `/lib/stores/useBuildsStore.ts`
- Database: Dexie.js `builds` table
- Tests: `/components/instructions/*.test.tsx`

**3D Viewer (3 FRs):**
- Components: `/components/viewer/`
- Libraries: Three.js, React Three Fiber (dependencies)
- Tests: `/components/viewer/*.test.tsx`

**Design Discovery (3 FRs):**
- Components: `/components/templates/`
- Pages: `/app/templates/page.tsx`
- Database: Dexie.js `templates` table
- Tests: `/components/templates/*.test.tsx`

**Build Management (5 FRs):**
- Components: `/components/builds/`
- Pages: `/app/builds/page.tsx`
- Store: `/lib/stores/useBuildsStore.ts`
- Database: Dexie.js `builds` table
- Tests: `/components/builds/*.test.tsx`

**Onboarding (2 FRs):**
- Components: `/components/onboarding/`
- Entry Point: `/app/page.tsx` (conditionally renders onboarding)
- Store: `/lib/stores/useUIStore.ts` (tutorial state)
- Tests: `/components/onboarding/*.test.tsx`

**PWA Experience (3 FRs):**
- Config: `/next.config.ts` (next-pwa setup)
- Manifest: `/public/manifest.json`
- Icons: `/public/icons/` (generated via script)
- Service Worker: Auto-generated by next-pwa
- Tests: `__tests__/e2e/pwa.spec.ts`

**Error Handling (4 FRs):**
- Error Boundaries: Per-feature in component folders
- Global Error: `/app/layout.tsx` (root error boundary)
- Retry Logic: In `/lib/api.ts` (exponential backoff)
- Tests: Error scenarios in each feature test suite

**Analytics (2 FRs):**
- Service: `/lib/analytics.ts` (PostHog wrapper)
- Events: Tracked from components via `analytics.capture()`
- Tests: Mock PostHog in tests

**Cross-Cutting Concerns:**

**Authentication (v1.1 - deferred):**
- Future: `/lib/auth.ts`, `/app/api/auth/`, middleware
- MVP: No auth, anonymous device ID only

**Camera Scanning:**
- Components: `/components/camera/`
- Hooks: `/lib/hooks/use-camera-permissions.ts`
- Integration: With `/components/inventory/brick-scanner.tsx`
- Tests: `__tests__/integration/camera-flow.test.ts`

**Offline/Online State:**
- Hook: `/lib/hooks/use-online-status.ts`
- UI Indicator: Global component in `/app/layout.tsx`
- Sync Logic: In Zustand stores (queue operations when offline)

### Integration Points

**Internal Communication:**
- **Component → Store:** Zustand subscriptions
  ```typescript
  const bricks = useInventoryStore((state) => state.bricks)
  const addBrick = useInventoryStore((state) => state.addBrick)
  ```
- **Store → IndexedDB:** Zustand persist middleware
  ```typescript
  persist((set, get) => ({ ... }), { name: 'brick-inventory' })
  ```
- **Component → API:** Direct function calls
  ```typescript
  import { generateLegoModel } from '@/lib/api'
  const result = await generateLegoModel('text', prompt, [], inventory)
  ```

**External Integrations:**
- **Gemini API:** Via `/app/api/generate/route.ts` server-side route
- **Forma AI Backend:** Via `/lib/api.ts` A2A protocol client
- **PostHog Analytics:** Via `/lib/analytics.ts` wrapper

**Data Flow:**
```
User Action
    ↓
Component Event Handler
    ↓
Zustand Store Action
    ↓ (if API needed)
API Client (/lib/api.ts)
    ↓
Backend (A2A Protocol) or Next.js API Route (Gemini)
    ↓ (poll for result)
API Response
    ↓
Zustand Store Update
    ↓
Zustand Persist Middleware → IndexedDB
    ↓
Component Re-render (reactive subscription)
    ↓
UI Update
```

### File Organization Patterns

**Configuration Files:**
- **Root:** `pnpm-workspace.yaml`, `package.json`
- **Frontend:** `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `components.json`
- **Environment:** `.env.local` (dev), `.env.example` (template)
- **CI/CD:** `.github/workflows/ci.yml`
- **PWA:** `public/manifest.json`

**Source Organization:**
- **Pages by Route:** `/app/[route]/page.tsx`
- **Components by Feature:** `/components/[feature]/`
- **Utilities by Scope:** `/lib/utils/` (shared), `/components/[feature]/utils/` (feature-specific)
- **Stores Centralized:** `/lib/stores/`
- **Hooks Centralized:** `/lib/hooks/` (shared hooks)

**Test Organization:**
- **Unit Tests:** Co-located `*.test.tsx` next to source files
- **Integration Tests:** `__tests__/integration/`
- **E2E Tests:** `__tests__/e2e/`
- **Test Utilities:** `__tests__/setup/test-utils.tsx`

**Asset Organization:**
- **PWA Icons:** `/public/icons/` (with generation script)
- **Static Images:** `/public/images/`
- **Dynamic Assets:** Generated at runtime, cached in IndexedDB

### Development Workflow Integration

**Development Server Structure:**
- **Start:** `pnpm dev` (runs Next.js dev server with Turbopack)
- **Hot Reload:** Automatic for all file changes
- **Type Checking:** `pnpm type-check` (runs TypeScript compiler)
- **Linting:** `pnpm lint` (ESLint)

**Build Process Structure:**
- **Build:** `pnpm build` (Next.js production build)
- **Output:** `.next/` directory (gitignored)
- **PWA:** Service worker generated during build
- **Type Safety:** TypeScript errors block build

**Deployment Structure:**
- **Frontend:** Vercel (auto-deploy from `main` branch)
- **Backend:** Existing deployment (unchanged)
- **Preview:** Vercel creates preview URLs for PRs
- **Environment:** Secrets managed in Vercel dashboard

### Party Mode Validation Summary

**Agent Consensus:**
- **Winston (Architect):** Approved monorepo structure, frontend feature-based organization
- **Amelia (Developer):** Approved with requirement for `.test.ts` files in `/lib/`
- **Murat (Test Architect):** Approved with addition of `__tests__/integration/` directory

**Action Items Incorporated:**
1. ✅ Added `public/icons/generate-icons.sh` script
2. ✅ Added `.test.ts` files for all `/lib/` files (api, db, stores, hooks)
3. ✅ Added `__tests__/integration/` directory with test files

**Structure Ready for Implementation.**
