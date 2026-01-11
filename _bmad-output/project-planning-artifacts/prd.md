---
stepsCompleted: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - '_bmad-output/project-planning-artifacts/product-brief-lego-builder-2025-12-27.md'
  - '_bmad-output/project-planning-artifacts/ux-design-specification.md'
  - '_bmad-output/project-planning-artifacts/research/technical-2d-to-3d-voxel-research-2025-12-26.md'
  - '_bmad-output/project-planning-artifacts/research/technical-brick-identification-research-2025-12-26.md'
  - '_bmad-output/analysis/brainstorming-session-2025-12-26.md'
workflowType: 'prd'
lastStep: 11
status: 'complete'
documentCounts:
  briefs: 1
  research: 2
  brainstorming: 1
  ux: 1
  projectDocs: 0
project_name: 'Lego Builder'
user_name: 'Juan'
date: '2025-12-28'
---

# Product Requirements Document - Lego Builder

**Author:** Juan
**Date:** 2025-12-28

---

## Executive Summary

**Lego Builder** is an AI-powered Progressive Web App that transforms how families experience their Lego collections. By combining image-to-model generation with real-time inventory awareness, users can turn any picture or idea into buildable Lego instructions — using only the bricks they already own.

**Vision:** Create special moments where parents and kids build unique designs together, from scratch.

**The Magic:** The combination of AI-generated custom designs AND inventory-first awareness creates an experience no competitor offers. Users don't just get instructions — they get instructions that actually work with what they have.

**The Aha Moment:** "Thought becomes reality" — when a user's imagination transforms into a physical Lego creation they can hold, designed uniquely for them, buildable with their own bricks.

### What Makes This Special

1. **AI-Generated Designs** — Infinite possibilities vs. limited catalog (unlike Brickit's pre-made library)
2. **2D Image → Lego Model** — Core differentiator; competitors can't do this
3. **Inventory-First Approach** — Shows what's buildable NOW and what's missing
4. **Optimized for Buildability** — Structural integrity, staggered joints, layer-by-layer assembly
5. **Family Bonding Focus** — "WE made this!" moments designed into the core experience

## Project Classification

**Technical Type:** web_app (Progressive Web App)
**Domain:** Consumer/Creative Tech
**Complexity:** Medium
**Project Context:** Greenfield - new project

**Key Technical Signals:**
- PWA for mobile-first, installable experience
- Camera integration for brick scanning
- AI/ML image processing (Gemini SDK)
- Three.js 3D visualization
- Freemium subscription model ($5-10/mo)

---

## Success Criteria

### User Success

| Metric | Target | Description |
|--------|--------|-------------|
| Build Completion Rate | >60% | Percentage of generated models users finish building |
| Time to First Build | <30 min | From signup to completed first model |
| Return Builder Rate | >40% | Users who come back for a 2nd project |
| Social Shares | Track growth | Creations shared to community or external platforms |

**Aha Moment:** "Thought becomes reality" — when a user's imagination transforms into a physical Lego model they can hold.

### Business Success

| Timeframe | Focus | Metric |
|-----------|-------|--------|
| 3 Months | User Growth | Total registered users |
| 6 Months | Engagement | Weekly active builders |
| 12 Months | Monetization | Premium conversion rate, MRR |

**KPIs:** MAU, Models Generated per User, Build Completion Rate, Free→Premium Conversion, Viral Coefficient

### Technical Success

| Metric | Target | Rationale |
|--------|--------|-----------|
| Generation Time | <1 minute | Image/text → Lego model generation |
| Brick Matching | Resemblance-based | Not exact identification; good enough matching |
| 3D Viewer Performance | 20 fps | Smooth interaction on mid-range mobile devices |
| PWA Lighthouse Score | >90 | Performance, accessibility, best practices |

### Measurable Outcomes

**MVP Success Threshold:** Users can generate a buildable model from text or image, scan bricks, and complete at least one physical build with 60%+ completion rate.

**Core Validation:** "This actually works with MY bricks!" — user recognition that inventory matching delivers value.

---

## Product Scope

### MVP - Minimum Viable Product

| Feature | Description |
|---------|-------------|
| Text → Lego Model | Generate buildable Lego model from text prompt |
| Image → Lego Model | Convert 2D photo into Lego model (core differentiator) |
| Layer-by-Layer Instructions | Step-by-step build guide with brick counts |
| Brick Scanning | Photograph bricks to create inventory |
| Quick Start Mode | Skip scanning; assumes "standard collection" for generation |
| Missing Brick Alerts | Notify users which bricks are needed but not in inventory |
| Scale-Down Option | Generate smaller version when inventory doesn't fully match |
| Save/Resume Builds | Save progress and resume later (critical for AFOL experience) |
| Free Retry (3x) | Regenerate design if it doesn't match expectations |
| Template Categories | Browse Animals, Vehicles, Buildings for inspiration |

### Growth Features (Post-MVP)

| Feature | Target Release |
|---------|----------------|
| Brick Substitution | v1.1 |
| Social Sharing / Community | v1.2 |
| Family Accounts | v1.2 |
| Google Auth + Stripe | v1.1 |

### Vision (Future)

| Feature | Target Release |
|---------|----------------|
| STL/OBJ → Lego Model | v2.0 |
| Minecraft Import (.schematic) | v2.0 |
| Hollow/Infill Options | v2.0 |
| Community Marketplace | v2.0+ |

---

## User Journeys

### Journey 1: The Gonzalez Family - Saturday Morning Magic
**Personas:** Carlos (42, parent) + Maya (8, child)

Carlos opens Lego Builder and snaps a photo of bricks spread across the living room floor. "Found 347 bricks!" Maya types "dragon" and a colorful 3D dragon appears. Green badge: "You can build this!"

Layer by layer, they work together. Forty-five minutes later, they're holding a dragon they designed together.

**Error Recovery:** If the dragon doesn't match Maya's vision, they tap "Try Again" — free regeneration with the same prompt creates a different interpretation.

**Requirements:** Scanning, generation, matching, instructions, free retry

---

### Journey 2: Alex Chen - The AFOL's Unique Creation
**Persona:** Alex (34, AFOL)

Alex uploads a photo of his cat, Whiskers. The app generates a detailed model. Inventory check shows yellow: "Missing 12 bricks. Scale down?"

Alex taps "Save for Later" to order missing bricks, then resumes the build when they arrive. One-of-a-kind Whiskers sculpture complete.

**Requirements:** Image→Lego, save/resume, missing alerts, scale-down

---

### Journey 3: Sofia - The Independent Builder
**Persona:** Sofia (11, experienced kid)

Sofia uses **Quick Start Mode** — she skips brick scanning and the app assumes a "standard collection" of common bricks for generation guidance.

"Flying car with jet engines" generates. Yellow warning: "Some bricks may not match your collection." She taps "Scale Down" for a smaller version likely to work with any collection.

She builds it and names it "The Sofia Striker." *(Community sharing available in v1.2)*

**Requirements:** Quick Start (assumed inventory), scale-down, naming creations

---

### Journey 4: First-Time Onboarding
**Personas:** New users

Quick tutorial → photo → "Found 89 bricks!" → "race car" → Green: "You can build this!" → Build complete → "First Creation! 🎉" badge.

**Requirements:** Tutorial, celebrations, badges

---

### Journey 5: Browse Ideas (Template Categories)
**Note:** Community feed is v1.2. For MVP, users browse template categories instead.

Maria browses Animals category, taps "Penguin", sees "Your inventory: 72% match", taps "Scale to My Bricks" → builds her version.

**Requirements:** Template categories (MVP), community feed (v1.2)

---

### Journey 6: Build Instructions + Error Recovery
**The Core Loop:**
"Start Building →" → Layer 1 highlighted → tap to advance → "Step 3/12" → final layer → confetti → "You built this!"

**Generation Failure Recovery:**
If AI returns unexpected results, user sees: "Not quite right? Try again!" — free retry generates alternative interpretation. After 3 retries, offer template suggestions.

**Requirements:** Layer instructions, navigation, progress, celebrations, free retry (3x)

---

### Journey Requirements Summary

| Capability | Status | Journeys |
|------------|--------|----------|
| Camera Brick Scanning | MVP | Family, AFOL, Onboarding |
| Text → Lego Generation | MVP | Family, Kid, Onboarding |
| Image → Lego Generation | MVP | AFOL |
| Quick Start Mode | MVP | Kid |
| Scale-Down Option | MVP | AFOL, Kid, Browse |
| Save/Resume Builds | MVP | AFOL |
| Free Retry (3x) | MVP | Family, Build |
| Layer-by-Layer Instructions | MVP | All builds |
| Template Categories | MVP | Browse Ideas |
| Community Feed/Sharing | v1.2 | Kid, Browse |

---

## Innovation & Novel Patterns

### Strategic Innovation Position

**Core Value Proposition:** Lego Builder is a "creativity unlock" platform that transforms dormant assets (dusty brick boxes) into active creative tools — like Airbnb for Lego creativity.

**Jobs-to-be-Done:** The real job isn't "build Lego." It's **"create a bonding moment with my kid RIGHT NOW with what we already have."**

**Competitive Moat:** The combination of Buildability AI + inventory-first data creates defensibility:
- More users building → Better AI understanding of what works
- Inventory data across users → Smarter generation for common collections
- Buildability validation → Proprietary physics-aware Lego engineering

### Detected Innovation Areas

**Core Innovation: Buildability AI™**
AI-generated custom Lego designs from ANY 2D image with physics-aware structural validation:
- Staggered joints (no weak vertical seams)
- Layer-by-layer stability
- Connection point verification
- This is genuinely novel in the consumer Lego space

**Unique Combination:** Generative AI + Inventory Awareness
- Not just AI generation, but generation constrained by what you actually own
- Real-time buildability validation + scale-down option

**Novel UX Pattern:** "Think it → See it → Build it"
- Unified experience from imagination to physical creation

### Market Context & Competitive Landscape

| Competitor | Approach | Limitation | Why They Can't Copy |
|------------|----------|------------|---------------------|
| Brickit | Pre-made library | Can't generate custom | Would need full AI pipeline + buildability validation |
| Official Lego | Digital instructions | Requires new sets | Business model conflict (sells sets, not creativity) |
| YouTube MOCs | Community designs | No inventory matching | Not a product; no technology platform |

**Key Assumption Challenged:** "You need expensive official sets to have creative Lego experiences"

### First-Build Guarantee Philosophy

The FIRST generated design should be **conservative and simple** to ensure success:
- First build: suggest smaller, proven-buildable models
- Build user confidence before offering complex designs
- One bad first experience = lost trust forever

**Implementation:** First-time users get "Recommended for You" designs pre-validated against common brick collections.

### Validation Approach

| Validation Area | Method | Failure Threshold |
|----------------|--------|-------------------|
| AI Output Quality | Structural buildability checks | <80% buildable = iterate AI |
| User Satisfaction | Free retry (3x) + template fallback | >30% retry rate = investigate |
| Build Completion | Target 60%+ completion | <40% = critical pivot needed |

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| AI generates unbuildable designs | Buildability AI validation (staggered joints, gravity, cantilevers) |
| First-time user fails | First-Build Guarantee (conservative first design) |
| Output doesn't match expectation | Free retry (3x) + scale-down option |
| Inventory scanning inaccurate | Resemblance-based matching (graceful degradation) |

---

## Web App Specific Requirements

### Project-Type Overview

**Architecture:** Hybrid SPA (Next.js 14+ App Router)
- SPA-like experience for in-app interactions (3D viewer, navigation)
- Server-rendered pages for marketing/landing (SEO-optimized)
- PWA capabilities for mobile-first, installable experience

### Browser Support Matrix

| Browser | Version | Priority | Requirements |
|---------|---------|----------|--------------|
| Chrome | 90+ | Primary | WebGL 2.0, Camera API |
| Safari | 15+ | Primary | WebGL 2.0, Camera API (PWA permission handling) |
| Edge | 90+ | Secondary | WebGL 2.0, Camera API |
| Firefox | 90+ | Secondary | WebGL 2.0, Camera API |

**Technical Requirements:**
- WebGL 2.0 required for Three.js 3D viewer
- Camera API for brick scanning (with PWA-specific permission flow)
- Device baseline: 2019+ devices (Snapdragon 6-series / A12 chip equivalent)

### Responsive Design

From UX Specification:
- Mobile-first approach with 8px grid system
- Breakpoints: Mobile (0-767px), Tablet (768-1023px), Desktop (1024px+)
- 44px minimum touch targets
- Floating bottom navigation on mobile

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| AI Generation | <1 minute | End-to-end: prompt → 3D model displayed |
| 3D Viewer FPS | 20 fps | On 2019+ mid-range devices |
| PWA Lighthouse | >90 | Core Web Vitals compliance |
| First Contentful Paint | <2s | Fast perceived load |

### SEO Strategy

| Area | SEO Priority | Approach |
|------|--------------|----------|
| Landing/Marketing | High | Server-rendered, meta tags, structured data |
| App Experience | None | Authenticated; no indexing needed |
| Shared Creations | Future (v1.2) | Public URLs when community launches |

### Offline Capabilities

| Feature | Offline Behavior |
|---------|------------------|
| Saved Builds | ✅ Accessible (IndexedDB) |
| Brick Inventory | ✅ Cached locally |
| New AI Generation | ❌ Requires network |
| Build Instructions | ✅ Cached after first load |

**Sync Strategy (MVP):** Local-only storage. Cross-device sync deferred to v1.1 with auth.

### Accessibility (Basic — Low Effort)

**Included in MVP (nearly free via Shadcn/ui):**
- Keyboard navigation for all interactive elements
- Color contrast meeting WCAG AA standards
- Screen reader labels for buttons/icons
- Focus states for navigation

**Deferred:** Full WCAG 2.1 AA audit and remediation

### Camera Permission UX

**First-Time Scan Flow:**
1. User taps "Scan Bricks"
2. App shows pre-permission screen: "We need camera access to detect your Lego bricks. Nothing is stored on our servers."
3. User taps "Allow Camera"
4. Browser permission popup appears
5. If denied → Show recovery instructions

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP
- Deliver the core "Think it → See it → Build it" experience
- Focus on the magical moment where imagination becomes buildable reality
- Prioritize user delight over feature breadth

**Core Value Thesis:** If users can scan bricks, generate a model, and follow instructions to build it — MVP is validated.

**Resource Requirements:**
- Team Size: Solo developer
- Estimated Timeline: 8-12 weeks for full MVP
- Key Skills: Next.js, AI integration (Gemini), Three.js, PWA

### MVP Feature Prioritization

**Tier 1 — Absolute Core (Minimum Shippable Product ~Week 5):**
| Feature | Why Essential |
|---------|---------------|
| AI Generation (Text/Image → Lego) | Core value proposition |
| Brick Scanning | Inventory-first differentiator |
| Layer-by-Layer Instructions | Enables physical build completion |
| Error Handling & Edge Cases | Graceful failures prevent user frustration |

**Tier 2 — Essential Experience (Full MVP ~Week 8-12):**
| Feature | Why Important |
|---------|---------------|
| Quick Start Mode | Removes friction for first-time users |
| Missing Brick Alerts | Prevents frustration mid-build |
| Scale-Down Option | Graceful fallback when inventory doesn't match |
| Basic Analytics | Track device IDs, core events (PostHog free tier) |

**Tier 3 — Enhanced Experience:**
| Feature | Why Included |
|---------|--------------|
| Save/Resume Builds | AFOL journey critical |
| Free Retry (3x) | Error recovery for AI mismatch |
| Template Categories | Discovery/inspiration path |

### Phased Development Roadmap

**Milestone: Minimum Shippable Product (MSP) — Week 5**
- Tier 1 features only
- Can demo end-to-end flow
- Ship-early option if needed

**Phase 1: MVP (v1.0)** — Weeks 6-12
- All Tier 1 + Tier 2 + Tier 3 features
- Local-only storage (IndexedDB)
- Anonymous usage with device ID tracking

**Phase 2: Growth (v1.1-1.2)** — Post-launch
| Version | Features |
|---------|----------|
| v1.1 | Google Auth, Stripe payments, Brick Substitution |
| v1.2 | Community Sharing, Family Accounts |

**Phase 3: Expansion (v2.0+)** — Future
| Version | Features |
|---------|----------|
| v2.0 | STL/OBJ → Lego Model, Minecraft Import, Hollow/Infill Options |
| v2.0+ | Community Marketplace |

### Timeline Risk Factors

| Risk Area | Impact | Mitigation |
|-----------|--------|------------|
| AI Prompt Engineering | +2-3 weeks | Start early; use simple prompts first |
| 3D Performance Optimization | +1-2 weeks | Start with simpler models; progressive LOD |
| iOS Safari PWA Quirks | +1 week | Test early and often on real devices |
| Scope Creep | Variable | This PRD is the contract |

### Risk Mitigation Strategy

**Technical Risks:**
| Risk | Mitigation |
|------|------------|
| AI generation quality | First-Build Guarantee + Free Retry (3x) |
| 3D performance on mobile | 20fps target; progressive complexity; simpler first models |
| Gemini API costs/latency | Rate limiting; local caching of generated models |
| Error states unhandled | Explicit error handling in Tier 1 scope |

**Market Risks:**
| Risk | Mitigation |
|------|------------|
| Users don't complete builds | Track completion via analytics; iterate on instruction UX |
| Competition from Brickit | Differentiate on AI generation (they can't do this) |

**Resource Risks:**
| Risk | Mitigation |
|------|------------|
| Solo dev bandwidth | MSP at week 5 gives ship-early option |
| Scope creep | This PRD is the contract; stick to MVP features |

### Launch Criteria

**MVP is ready when:**
- [ ] User can scan bricks and see inventory count
- [ ] User can generate model from text or image
- [ ] User can view layer-by-layer build instructions
- [ ] Error states handled gracefully (AI failure, scan failure, render failure)
- [ ] Camera permission flow works on iOS Safari PWA
- [ ] Loading states shown during AI generation
- [ ] 60%+ test builds complete successfully
- [ ] PWA installable on iOS Safari + Chrome Android
- [ ] Basic analytics tracking events firing

### Explicit Deferrals (Not in MVP)

| Feature | Deferred To | Rationale |
|---------|-------------|-----------|
| User Authentication | v1.1 | Reduces complexity; anonymous works for MVP |
| Cloud Sync | v1.1 | Local-only is fine for validation |
| Payments/Subscription | v1.1 | Validate free experience first |
| Community Features | v1.2 | Need user base before community |
| WCAG Full Compliance | v1.1+ | Basic accessibility included; full audit later |

---

## Functional Requirements

### Model Generation

- FR1: Users can generate a Lego model from a text prompt
- FR2: Users can generate a Lego model from an uploaded 2D image
- FR3: Users can regenerate a model with the same prompt (free retry, up to 3x)
- FR4: Users can scale down a generated model when inventory doesn't fully match
- FR5: Users receive feedback if generated model has structural issues
- FR6: System recommends simpler builds for first-time users (First-Build Guarantee)

### Brick Inventory Management

- FR7: Users can photograph their brick collection to create an inventory
- FR8: System detects and counts bricks from photographs using resemblance-based matching
- FR9: Users can view their current brick inventory
- FR10: Users can use Quick Start mode without scanning (assumes standard collection)
- FR11: Users can access their inventory across sessions

### Build Instructions

- FR12: Users can view layer-by-layer build instructions for any generated model
- FR13: Users can navigate forward and backward through build instruction steps
- FR14: Users can view the current brick required at each step
- FR15: Users can see build progress (e.g., "Step 3 of 12")
- FR16: Users see missing brick count before starting a build
- FR17: Users see missing brick alert during build if specific brick is unavailable

### 3D Viewer

- FR18: Users can rotate the 3D model
- FR19: Users can zoom in/out on the 3D model
- FR20: Users can see loading states during AI generation

### Design Discovery

- FR21: Users can browse template categories (Animals, Vehicles, Buildings)
- FR22: Users can view inventory match percentage for any template
- FR23: Users can start building a template scaled to their inventory

### Build Management

- FR24: Users can save an in-progress build for later
- FR25: Users can resume a saved build
- FR26: Users can name their completed creations
- FR27: Users can view a list of their completed builds
- FR28: Users can view celebration feedback upon build completion

### Onboarding

- FR29: Users can view onboarding tutorial on first launch
- FR30: Users can skip onboarding and go directly to app

### Application Experience

- FR31: Users can install the app as a PWA on mobile devices
- FR32: Users can access saved builds and inventory while offline
- FR33: System shows pre-permission explanation before requesting camera access

### Error Handling

- FR34: Users see clear error message when AI generation fails
- FR35: Users see clear error message when brick scanning fails
- FR36: Users see clear error message when 3D rendering fails
- FR37: Users can retry after any error

### Analytics & Tracking (MVP)

- FR38: System tracks device IDs for anonymous user identification
- FR39: System tracks core events (scan, generate, build start, build complete)

---

## Non-Functional Requirements

### Performance

| Metric | Target | Measurement Context |
|--------|--------|---------------------|
| AI Generation Time | <1 minute | End-to-end: prompt submission → 3D model displayed |
| 3D Viewer Frame Rate | 20 fps | On 2019+ mid-range devices (Snapdragon 6-series / A12) |
| First Contentful Paint | <2 seconds | Initial page load |
| PWA Lighthouse Score | >90 | Performance, accessibility, best practices |
| Touch Response | <100ms | UI feedback on user interactions |

### Security (MVP Minimal)

| Requirement | Specification |
|-------------|---------------|
| Data Storage | Local only (IndexedDB); no cloud storage in MVP |
| User Data | Anonymous; device ID for analytics only |
| Camera Access | Used for scanning only; images not stored on servers |
| API Keys | Gemini API key secured server-side (not exposed to client) |
| HTTPS | All network communication over HTTPS |

### Integration

| System | Purpose | Requirements |
|--------|---------|--------------|
| Gemini API | Text/Image → Lego model generation | Rate limiting; response caching; graceful degradation on failure |
| PostHog | Anonymous analytics | Free tier; device ID tracking; core event logging |

### Reliability & Offline Support

| Requirement | Specification |
|-------------|---------------|
| Offline Access | Saved builds and brick inventory accessible offline |
| Service Worker | PWA caching for offline fallback |
| Data Persistence | IndexedDB for local storage durability |
| Error Recovery | All errors recoverable with retry option |
| Generation Caching | Generated models cached locally to avoid re-generation |

### Accessibility (Basic)

| Requirement | Specification |
|-------------|---------------|
| Keyboard Navigation | All interactive elements accessible via keyboard |
| Color Contrast | Meets WCAG AA contrast ratios |
| Touch Targets | Minimum 44px for all interactive elements |
| Focus States | Visible focus indicators for navigation |
| Screen Reader | Labels on buttons/icons for assistive technology |

*Full WCAG 2.1 AA audit deferred to v1.1+*

