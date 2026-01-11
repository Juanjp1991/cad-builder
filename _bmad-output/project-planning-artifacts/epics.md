---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - '_bmad-output/project-planning-artifacts/prd.md'
  - '_bmad-output/project-planning-artifacts/architecture.md'
  - '_bmad-output/project-planning-artifacts/ux-design-specification.md'
  - 'example2/'
project_name: 'Lego Builder'
user_name: 'Juan'
date: '2025-12-30'
---

# Lego Builder - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Lego Builder, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

#### Model Generation (FR1-6)
- FR1: Users can generate a Lego model from a text prompt
- FR2: Users can generate a Lego model from an uploaded 2D image
- FR3: Users can regenerate a model with the same prompt (free retry, up to 3x)
- FR4: Users can scale down a generated model when inventory doesn't fully match
- FR5: Users receive feedback if generated model has structural issues
- FR6: System recommends simpler builds for first-time users (First-Build Guarantee)

#### Brick Inventory Management (FR7-11)
- FR7: Users can photograph their brick collection to create an inventory
- FR8: System detects and counts bricks from photographs using resemblance-based matching
- FR9: Users can view their current brick inventory
- FR10: Users can use Quick Start mode without scanning (assumes standard collection)
- FR11: Users can access their inventory across sessions

#### Build Instructions (FR12-17)
- FR12: Users can view layer-by-layer build instructions for any generated model
- FR13: Users can navigate forward and backward through build instruction steps
- FR14: Users can view the current brick required at each step
- FR15: Users can see build progress (e.g., "Step 3 of 12")
- FR16: Users see missing brick count before starting a build
- FR17: Users see missing brick alert during build if specific brick is unavailable

#### 3D Viewer (FR18-20)
- FR18: Users can rotate the 3D model
- FR19: Users can zoom in/out on the 3D model
- FR20: Users can see loading states during AI generation

#### Design Discovery (FR21-23)
- FR21: Users can browse template categories (Animals, Vehicles, Buildings)
- FR22: Users can view inventory match percentage for any template
- FR23: Users can start building a template scaled to their inventory

#### Build Management (FR24-28)
- FR24: Users can save an in-progress build for later
- FR25: Users can resume a saved build
- FR26: Users can name their completed creations
- FR27: Users can view a list of their completed builds
- FR28: Users can view celebration feedback upon build completion

#### Onboarding (FR29-30)
- FR29: Users can view onboarding tutorial on first launch
- FR30: Users can skip onboarding and go directly to app

#### Application Experience (FR31-33)
- FR31: Users can install the app as a PWA on mobile devices
- FR32: Users can access saved builds and inventory while offline
- FR33: System shows pre-permission explanation before requesting camera access

#### Error Handling (FR34-37)
- FR34: Users see clear error message when AI generation fails
- FR35: Users see clear error message when brick scanning fails
- FR36: Users see clear error message when 3D rendering fails
- FR37: Users can retry after any error

#### Analytics & Tracking (FR38-39)
- FR38: System tracks device IDs for anonymous user identification
- FR39: System tracks core events (scan, generate, build start, build complete)

### NonFunctional Requirements

#### Performance
- NFR1: AI Generation Time < 1 minute (end-to-end: prompt submission → 3D model displayed)
- NFR2: 3D Viewer Frame Rate ≥ 20 fps on 2019+ mid-range devices
- NFR3: First Contentful Paint < 2 seconds
- NFR4: PWA Lighthouse Score > 90
- NFR5: Touch Response < 100ms

#### Security (MVP Minimal)
- NFR6: Data stored locally only (IndexedDB); no cloud storage in MVP
- NFR7: Anonymous user tracking; device ID for analytics only
- NFR8: Camera access used for scanning only; images not stored on servers
- NFR9: Gemini API key secured server-side (not exposed to client)
- NFR10: All network communication over HTTPS

#### Integration
- NFR11: Gemini API integration with rate limiting, response caching, graceful degradation
- NFR12: PostHog integration for anonymous analytics (free tier)

#### Reliability & Offline Support
- NFR13: Saved builds and brick inventory accessible offline
- NFR14: Service worker PWA caching for offline fallback
- NFR15: IndexedDB for local storage durability
- NFR16: All errors recoverable with retry option
- NFR17: Generated models cached locally to avoid re-generation

#### Accessibility (Basic)
- NFR18: Keyboard navigation for all interactive elements
- NFR19: Color contrast meets WCAG AA ratios
- NFR20: Touch targets minimum 44px
- NFR21: Visible focus indicators for navigation
- NFR22: Screen reader labels on buttons/icons

### Additional Requirements

#### From Architecture Document
- **Starter Template:** Use `create-next-app@latest` with Next.js 15, TypeScript, Tailwind CSS, ESLint, App Router, src directory
- **UI Framework:** Shadcn/ui with CSS variables for theming
- **PWA Support:** next-pwa package
- **AI Integration:** Vercel AI SDK with @ai-sdk/google for multi-provider abstraction
- **Testing Infrastructure:** Vitest + Testing Library + Playwright from project initialization
- **3D Integration:** Three.js via iframe injection (MVP), react-three-fiber migration (v2)
- **State Management:** React useState (MVP), Zustand when complexity grows
- **Local Storage:** idb-keyval for IndexedDB wrapper
- **API Routes:** /api/generate (POST: text/image → model), /api/scan (POST: image → inventory)
- **Error Handling:** Unified error boundary + toast pattern, 3 free retries with exponential backoff
- **Deployment:** Vercel primary, portable

#### From UX Design Specification
- **Visual Design:** Warm & Balanced direction (playful but not childish)
- **Typography:** Nunito (headings), Inter (body), JetBrains Mono (stats/numbers)
- **Color System:** Primary blue (#0066CC), Accent yellow (#FFB800), Success green (#22C55E)
- **Spacing:** 8px grid system, 44px minimum touch targets
- **Glass Morphism:** For overlay components
- **Button Hierarchy:** Primary (yellow fill), Secondary (blue outline), Ghost (text only)
- **Navigation:** Bottom tab bar (Home, Inventory, Create, Profile) + Floating Action Button
- **Loading States:** Progress storytelling ("Imagining... Finding... Building...")
- **Celebration Moments:** Confetti + "WE made this!" on build completion
- **Responsive Strategy:** Mobile-first with breakpoints at 768px (tablet) and 1024px (desktop)

#### From example2 Reference Implementation
- **Gemini SDK Pattern:** Use @google/genai with streaming responses and thought extraction
- **3D Scene Generation:** AI generates complete Three.js HTML that renders in iframe
- **State Machine:** idle | generating_image | generating_voxels | error
- **Drag & Drop File Upload:** For image uploads with file type validation
- **Progress Feedback:** Streaming "thinking" text during generation
- **View Toggle:** Switch between source image and generated 3D scene

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Text → Lego model |
| FR2 | Epic 2 | Image → Lego model |
| FR3 | Epic 2 | Free retry (3x) |
| FR4 | Epic 4 | Scale-down option |
| FR5 | Epic 2 | Structural feedback |
| FR6 | Epic 2 | First-Build Guarantee |
| FR7 | Epic 3 | Camera brick scanning |
| FR8 | Epic 3 | Brick detection/counting |
| FR9 | Epic 3 | View inventory |
| FR10 | Epic 4 | Quick Start mode |
| FR11 | Epic 3 | Cross-session inventory |
| FR12 | Epic 6 | Layer-by-layer instructions |
| FR13 | Epic 6 | Step navigation |
| FR14 | Epic 6 | Current brick display |
| FR15 | Epic 6 | Progress indicator |
| FR16 | Epic 4 | Missing brick count |
| FR17 | Epic 6 | Missing brick alerts |
| FR18 | Epic 1 | 3D rotate (infrastructure) |
| FR19 | Epic 1 | 3D zoom (infrastructure) |
| FR20 | Epic 1 | Loading states (infrastructure) |
| FR21 | Epic 8 | Template categories |
| FR22 | Epic 8 | Inventory match % |
| FR23 | Epic 8 | Build from template |
| FR24 | Epic 7 | Save in-progress |
| FR25 | Epic 7 | Resume build |
| FR26 | Epic 7 | Name creation |
| FR27 | Epic 7 | View completed builds |
| FR28 | Epic 7 | Celebration feedback |
| FR29 | Epic 5 | Onboarding tutorial |
| FR30 | Epic 5 | Skip onboarding |
| FR31 | Epic 1 | PWA installation |
| FR32 | Epic 7 | Offline access |
| FR33 | Epic 3 | Camera permission UX |
| FR34 | Epic 2 | AI error messages (integrated) |
| FR35 | Epic 3 | Scan error messages (integrated) |
| FR36 | Epic 1 | Render error messages (integrated) |
| FR37 | Epic 2 | Retry after error (integrated) |
| FR38 | Epic 1 | Device ID tracking |
| FR39 | Epic 1 | Event tracking |

## Epic List

### Epic 1: Project Foundation & Core Infrastructure
Users/developers have a working PWA foundation with 3D viewer, testing infrastructure, AI integration, and error handling ready, enabling all future user-facing features.
**FRs covered:** FR18, FR19, FR20, FR31, FR36, FR38, FR39
**Includes:** Testing infrastructure (Vitest + Playwright), 3D Viewer component, error boundary, PostHog analytics

### Epic 2: AI-Powered Model Generation
Users can transform text prompts or images into 3D Lego models with retry, structural feedback, and proper error handling.
**FRs covered:** FR1, FR2, FR3, FR5, FR6, FR34, FR37
**Includes:** AI generation errors integrated with retry mechanism

### Epic 3: Brick Inventory Scanning
Users can photograph bricks to create/update their collection inventory with persistent storage, camera permission UX, and scan error handling.
**FRs covered:** FR7, FR8, FR9, FR11, FR33, FR35
**Includes:** Scan errors integrated with recovery flow

### Epic 4: Inventory-Aware Generation & Scale-Down
Users see what's buildable NOW and can scale down when bricks are missing.
**FRs covered:** FR4, FR10, FR16

### Epic 5: First-Time User Onboarding
New users get a guided first experience leading to their first successful build using the scan → generate → match loop.
**FRs covered:** FR29, FR30
**Note:** Moved earlier (per Party Mode) to optimize first-time user conversion

### Epic 6: Layer-by-Layer Build Instructions
Users can follow step-by-step visual instructions to complete their build with missing brick alerts.
**FRs covered:** FR12, FR13, FR14, FR15, FR17

### Epic 7: Build Progress & Completion
Users can save progress, resume builds, name creations, view gallery, celebrate completion, and access offline.
**FRs covered:** FR24, FR25, FR26, FR27, FR28, FR32

### Epic 8: Template Discovery & Browsing
Users can browse template categories and find inspiration when uncertain what to build.
**FRs covered:** FR21, FR22, FR23

---

## Party Mode Adjustments Applied

| Change | Rationale | Agent |
|--------|-----------|-------|
| 3D Viewer (FR18-20) → Epic 1 | Infrastructure reused by all epics | Winston (Architect) |
| Error handling → Parent epics | Self-contained epics, no trust-breaking | John (PM) |
| Onboarding → Epic 5 | Earlier in flow, after core loop works | Sally (UX) |
| Testing infra → Epic 1 | Required from project start | Murat (Test Architect) |
| Epic 9 eliminated | Error FRs distributed to parent epics | Consensus |

---

## Epic 1: Project Foundation & Core Infrastructure

Developers have a working PWA foundation with 3D viewer, testing infrastructure, AI integration, and error handling ready, enabling all future user-facing features.

### Story 1.1: Initialize Next.js Project with PWA Support

As a developer,
I want a Next.js 15 project initialized with PWA capabilities,
So that I have a foundation for building an installable mobile-first app.

**Acceptance Criteria:**

**Given** no project exists
**When** the initialization commands are run
**Then** a Next.js 15 project with TypeScript, Tailwind CSS, App Router, and src directory is created
**And** Shadcn/ui is initialized with CSS variables
**And** next-pwa is configured for PWA support
**And** the app is installable on mobile devices (FR31)

---

### Story 1.2: Configure Testing Infrastructure

As a developer,
I want Vitest and Playwright configured,
So that I can write unit and E2E tests from the start.

**Acceptance Criteria:**

**Given** the project is initialized
**When** testing dependencies are installed
**Then** Vitest + Testing Library runs unit tests with `npm test`
**And** Playwright runs E2E tests with `npm run test:e2e`
**And** test folders are structured per Architecture spec

---

### Story 1.3: Implement 3D Model Viewer Component

As a user,
I want to view, rotate, and zoom 3D Lego models,
So that I can explore generated designs from any angle.

**Acceptance Criteria:**

**Given** a Three.js HTML scene is provided
**When** the ModelViewer component renders
**Then** the scene displays in an iframe (FR18, FR19)
**And** users can rotate the model via touch/mouse drag
**And** users can pinch-zoom or scroll-wheel to zoom
**And** the viewer maintains 20 fps on mid-range devices
**And** render errors show a friendly message with retry option (FR36)

---

### Story 1.4: Add Loading States and Progress Storytelling

As a user,
I want to see engaging loading states during AI operations,
So that wait times feel like progress rather than delay.

**Acceptance Criteria:**

**Given** an AI operation is in progress
**When** the loading component is active
**Then** progress storytelling displays ("Imagining... Finding... Building...") (FR20)
**And** a skeleton/shimmer shows in the 3D viewer area
**And** the loading state is accessible (screen reader announcements)

---

### Story 1.5: Configure PostHog Analytics

As a product owner,
I want anonymous analytics tracking,
So that I can measure user behavior without compromising privacy.

**Acceptance Criteria:**

**Given** PostHog is configured
**When** the app loads
**Then** a device ID is assigned for anonymous tracking (FR38)
**And** core events can be tracked (FR39)
**And** the PostHog key is stored in environment variables
**And** tracking respects user privacy (no PII collected)

---

## Epic 2: AI-Powered Model Generation

Users can transform text prompts or images into 3D Lego models with retry, structural feedback, and proper error handling.

### Story 2.1: Create Gemini API Proxy Route

As a developer,
I want a secure API route that proxies Gemini requests,
So that the API key is never exposed to the client.

**Acceptance Criteria:**

**Given** a POST request to `/api/generate`
**When** the request includes a text prompt or image
**Then** the Gemini API is called server-side with the secure key
**And** the response is streamed back to the client
**And** rate limiting prevents abuse
**And** errors return standardized error response format

---

### Story 2.2: Implement Text-to-Lego Model Generation

As a user,
I want to type a description and get a buildable Lego model,
So that I can turn my ideas into physical creations.

**Acceptance Criteria:**

**Given** a user enters a text prompt (e.g., "dragon")
**When** they submit the prompt
**Then** progress storytelling shows during generation
**And** a 3D Lego model appears in the viewer within 1 minute (FR1)
**And** the model is optimized for buildability (staggered joints)
**And** AI generation errors display a friendly message (FR34)

---

### Story 2.3: Implement Image-to-Lego Model Generation

As a user,
I want to upload a photo and get a Lego interpretation,
So that I can build real-world objects from images.

**Acceptance Criteria:**

**Given** a user uploads an image (PNG, JPEG, WEBP, HEIC)
**When** they submit the image
**Then** the AI analyzes the image and generates a Lego model (FR2)
**And** drag-and-drop file upload is supported (per example2)
**And** invalid file types show a clear error message
**And** the generation respects the same performance targets

---

### Story 2.4: Add Free Retry Mechanism

As a user,
I want to regenerate a design if it doesn't match my vision,
So that I can get a result I'm happy with.

**Acceptance Criteria:**

**Given** a model has been generated
**When** the user taps "Try Again"
**Then** a new model is generated with the same prompt (FR3)
**And** up to 3 free retries are allowed per prompt
**And** after 3 retries, template suggestions are offered (FR37)
**And** retry count is displayed to the user

---

### Story 2.5: Implement First-Build Guarantee

As a first-time user,
I want my first design to be simple and likely to succeed,
So that I have a positive first experience.

**Acceptance Criteria:**

**Given** a user has never completed a build (first-time flag)
**When** they generate their first model
**Then** the system recommends simpler, proven-buildable designs (FR6)
**And** the first model is conservative in complexity
**And** the user can opt out and request advanced designs

---

### Story 2.6: Add Structural Feedback for Generated Models

As a user,
I want to know if my generated model has structural issues,
So that I can adjust before starting to build.

**Acceptance Criteria:**

**Given** a model is generated
**When** it has potential structural weaknesses
**Then** the user sees a warning about buildability concerns (FR5)
**And** suggestions for improvement are offered
**And** the user can proceed anyway or regenerate

---

## Epic 3: Brick Inventory Scanning

Users can photograph bricks to create/update their collection inventory with persistent storage, camera permission UX, and scan error handling.

### Story 3.1: Implement Camera Permission Flow

As a user,
I want a clear explanation before granting camera access,
So that I understand why and trust the app.

**Acceptance Criteria:**

**Given** the user taps "Scan Bricks" for the first time
**When** camera permission hasn't been granted
**Then** a pre-permission screen explains the purpose (FR33)
**And** the explanation states images aren't stored on servers
**And** tapping "Allow Camera" triggers the browser permission popup
**And** if denied, recovery instructions are shown

---

### Story 3.2: Create Brick Scanning API Route

As a developer,
I want an API route that processes brick images,
So that brick detection happens securely server-side.

**Acceptance Criteria:**

**Given** a POST request to `/api/scan` with an image
**When** the image is processed
**Then** Gemini analyzes the image for brick detection
**And** the response includes brick types, colors, and counts
**And** scan errors return a friendly message (FR35)

---

### Story 3.3: Implement Brick Scanning UI

As a user,
I want to photograph my brick collection,
So that the app knows what I have available.

**Acceptance Criteria:**

**Given** camera permission is granted
**When** the user points at spread-out bricks and captures
**Then** a "Thinking..." animation shows during processing (FR7)
**And** the result shows "Found X bricks!" with a count
**And** resemblance-based matching is used (not exact identification) (FR8)
**And** scan failure shows "Add more bricks?" prompt, not error

---

### Story 3.4: Display and Edit Brick Inventory

As a user,
I want to view and adjust my detected inventory,
So that I can correct any scanning mistakes.

**Acceptance Criteria:**

**Given** bricks have been scanned
**When** the inventory view is displayed
**Then** brick types are shown with images, counts, and colors (FR9)
**And** users can manually adjust counts
**And** users can add/remove brick types
**And** changes are saved immediately

---

### Story 3.5: Persist Inventory with IndexedDB

As a user,
I want my inventory saved across sessions,
So that I don't have to rescan every time.

**Acceptance Criteria:**

**Given** an inventory exists
**When** the user closes and reopens the app
**Then** the inventory is restored from IndexedDB (FR11)
**And** idb-keyval is used as the storage wrapper
**And** inventory updates are persisted immediately

---

## Epic 4: Inventory-Aware Generation & Scale-Down

Users see what's buildable NOW and can scale down when bricks are missing.

### Story 4.1: Implement Quick Start Mode

As a user without scanned bricks,
I want to generate models assuming a standard collection,
So that I can start building immediately without scanning.

**Acceptance Criteria:**

**Given** a user has no inventory or selects Quick Start
**When** they generate a model
**Then** the system assumes a "standard collection" of common bricks (FR10)
**And** a yellow warning indicates "Some bricks may not match your collection"
**And** Quick Start is clearly labeled as an option on the create screen

---

### Story 4.2: Display Missing Brick Count Before Build

As a user,
I want to see how many bricks I'm missing before starting,
So that I can decide whether to build or adjust.

**Acceptance Criteria:**

**Given** a model is generated and inventory exists
**When** the inventory is compared to model requirements
**Then** missing brick count is displayed prominently (FR16)
**And** green badge shows "You can build this!" if 100% match
**And** yellow badge shows "Missing X bricks" if partial match
**And** red badge shows "Many bricks missing" if <50% match

---

### Story 4.3: Implement Scale-Down Option

As a user with insufficient bricks,
I want to generate a smaller version of my design,
So that I can still build something with what I have.

**Acceptance Criteria:**

**Given** a model has missing bricks (yellow/red status)
**When** the user taps "Scale Down" or "Scale to My Bricks"
**Then** a smaller version is generated that fits available inventory (FR4)
**And** the scaled model maintains the essential design features
**And** the new brick requirements are recalculated
**And** users can try multiple scale levels

---

## Epic 5: First-Time User Onboarding

New users get a guided first experience leading to their first successful build using the scan → generate → match loop.

### Story 5.1: Create Onboarding Welcome Flow

As a first-time user,
I want a quick tutorial showing how to use the app,
So that I understand the core workflow.

**Acceptance Criteria:**

**Given** a user opens the app for the first time
**When** the onboarding screen loads
**Then** a friendly welcome message greets them (FR29)
**And** the tutorial highlights: Scan → Generate → Build
**And** visuals are kid-friendly and parent-approved
**And** the tutorial is under 30 seconds to complete

---

### Story 5.2: Implement Skip Onboarding Option

As a returning or impatient user,
I want to skip onboarding and go directly to the app,
So that I don't waste time on a tutorial I don't need.

**Acceptance Criteria:**

**Given** the onboarding screen is displayed
**When** the user taps "Skip"
**Then** they go directly to the main app (FR30)
**And** skip preference is persisted (don't show again)
**And** users can re-enable onboarding from settings later

---

### Story 5.3: Guide First Scan and Generation

As a first-time user,
I want guided prompts through my first scan and generation,
So that I succeed on my first attempt.

**Acceptance Criteria:**

**Given** onboarding is complete or skipped
**When** the user hasn't completed their first build
**Then** helpful tooltips guide them through first scan
**And** the first generation uses First-Build Guarantee (simple models)
**And** a "First Creation! 🎉" badge is awarded upon completion

---

## Epic 6: Layer-by-Layer Build Instructions

Users can follow step-by-step visual instructions to complete their build with missing brick alerts.

### Story 6.1: Implement Layer-by-Layer Instruction View

As a user,
I want to see my model broken down into buildable layers,
So that I can assemble it step by step.

**Acceptance Criteria:**

**Given** a user taps "Start Building →"
**When** the instruction view loads
**Then** the 3D model highlights the current layer (FR12)
**And** completed layers are shown in a different visual state
**And** upcoming layers are dimmed or hidden
**And** the view focuses on the active layer for clarity

---

### Story 6.2: Add Step Navigation Controls

As a user,
I want to navigate forward and backward through build steps,
So that I can work at my own pace or revisit a step.

**Acceptance Criteria:**

**Given** the instruction view is active
**When** the user taps "Next" or "Previous"
**Then** the viewer advances or retreats one layer (FR13)
**And** swipe gestures also navigate between layers
**And** keyboard arrow keys work for accessibility

---

### Story 6.3: Display Current Brick Requirements

As a user,
I want to see which brick is needed for the current step,
So that I can find it in my collection.

**Acceptance Criteria:**

**Given** a layer is displayed
**When** the user views the step
**Then** the current brick type, color, and count are shown (FR14)
**And** a visual thumbnail of the brick is displayed
**And** the brick is highlighted in the 3D view

---

### Story 6.4: Show Build Progress Indicator

As a user,
I want to see my progress through the build,
So that I know how far I've come and how much remains.

**Acceptance Criteria:**

**Given** the instruction view is active
**When** the user is on any layer
**Then** progress shows "Step X of Y" (FR15)
**And** a progress bar visualizes completion percentage
**And** estimated time remaining is optionally displayed

---

### Story 6.5: Add Missing Brick Alerts During Build

As a user,
I want to be warned if the current step needs a brick I don't have,
So that I can find a substitute or skip ahead.

**Acceptance Criteria:**

**Given** the user reaches a layer requiring a missing brick
**When** that layer is displayed
**Then** a missing brick alert appears (FR17)
**And** the alert suggests alternatives or substitutions
**And** the user can skip the step or mark as "improvised"

---

## Epic 7: Build Progress & Completion

Users can save progress, resume builds, name creations, view gallery, celebrate completion, and access offline.

> **📝 Serialization Note:** For v1.2 community sharing, builds should be stored as compact brick instruction JSON (not full 3D HTML). This enables small file sizes (~5-15KB) and free client-side 3D regeneration without additional API costs.

### Story 7.1: Save In-Progress Build

As a user,
I want to save my build progress mid-way,
So that I can continue later without losing my place.

**Acceptance Criteria:**

**Given** a user is in the build instruction view
**When** they leave or tap "Save for Later"
**Then** the current layer/step is persisted to IndexedDB (FR24)
**And** progress is auto-saved on each step advancement
**And** a confirmation shows "Progress saved!"

---

### Story 7.2: Resume Saved Build

As a user,
I want to continue a previously saved build,
So that I can pick up right where I left off.

**Acceptance Criteria:**

**Given** a user has saved progress on a build
**When** they return to the app or tap "Resume"
**Then** the build loads at the last saved layer (FR25)
**And** a "Welcome back!" message confirms restoration
**And** build context (model, progress) is fully restored

---

### Story 7.3: Name Completed Creations

As a user,
I want to give my creation a custom name,
So that it feels personal and I can find it later.

**Acceptance Criteria:**

**Given** a build is completed
**When** the celebration screen appears
**Then** the user is prompted to name their creation (FR26)
**And** a default name is suggested (e.g., "Dragon #1")
**And** the name is saved with the build record

---

### Story 7.4: View Completed Builds Gallery

As a user,
I want to see all my completed creations,
So that I can revisit and admire my work.

**Acceptance Criteria:**

**Given** the user navigates to their gallery
**When** the gallery view loads
**Then** all completed builds are displayed as cards (FR27)
**And** each card shows: name, thumbnail, completion date
**And** tapping a card opens the 3D viewer for that model

---

### Story 7.5: Celebration on Build Completion

As a user,
I want to be celebrated when I finish building,
So that I feel proud of my accomplishment.

**Acceptance Criteria:**

**Given** the user completes the final layer
**When** the build is marked complete
**Then** confetti animation plays (FR28)
**And** "WE made this!" message appears (family-friendly)
**And** share options are prominently displayed
**And** haptic feedback triggers on mobile

---

### Story 7.6: Enable Offline Access to Saved Builds

As a user,
I want to view my saved builds and inventory offline,
So that I can build even without internet.

**Acceptance Criteria:**

**Given** builds and inventory are in IndexedDB
**When** the user is offline
**Then** saved builds are accessible (FR32)
**And** inventory is viewable
**And** new AI generation shows "Requires internet" message
**And** service worker caches necessary assets

---

## Epic 8: Template Discovery & Browsing

Users can browse template categories and find inspiration when uncertain what to build.

### Story 8.1: Create Template Categories Page

As a user who isn't sure what to build,
I want to browse categories of design templates,
So that I can find inspiration.

**Acceptance Criteria:**

**Given** the user navigates to Browse/Templates
**When** the page loads
**Then** categories are displayed (Animals, Vehicles, Buildings) (FR21)
**And** each category shows a preview thumbnail
**And** categories are tappable to expand/filter

---

### Story 8.2: Display Template Cards with Inventory Match

As a user,
I want to see how well each template matches my inventory,
So that I can pick one I can actually build.

**Acceptance Criteria:**

**Given** the user views templates in a category
**When** templates are displayed
**Then** each template shows inventory match percentage (FR22)
**And** green/yellow/red badges indicate buildability
**And** "72% match" or "You can build this!" labels are shown

---

### Story 8.3: Build Template Scaled to Inventory

As a user,
I want to start building a template adjusted for my bricks,
So that I can build something even with a partial match.

**Acceptance Criteria:**

**Given** a user selects a template
**When** they tap "Build This" or "Scale to My Bricks"
**Then** the template is adapted to their inventory (FR23)
**And** the build instructions view opens
**And** missing brick count is shown before starting

---

## Story Creation Summary

| Epic | Title | Stories | FRs Covered |
|------|-------|---------|-------------|
| 1 | Project Foundation & Core Infrastructure | 5 | FR18-20, FR31, FR36, FR38-39 |
| 2 | AI-Powered Model Generation | 6 | FR1-3, FR5-6, FR34, FR37 |
| 3 | Brick Inventory Scanning | 5 | FR7-9, FR11, FR33, FR35 |
| 4 | Inventory-Aware Generation & Scale-Down | 3 | FR4, FR10, FR16 |
| 5 | First-Time User Onboarding | 3 | FR29-30 |
| 6 | Layer-by-Layer Build Instructions | 5 | FR12-15, FR17 |
| 7 | Build Progress & Completion | 6 | FR24-28, FR32 |
| 8 | Template Discovery & Browsing | 3 | FR21-23 |

**Total: 8 Epics, 36 Stories covering all 39 Functional Requirements**

