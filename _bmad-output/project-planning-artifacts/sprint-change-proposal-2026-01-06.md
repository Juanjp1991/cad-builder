# Sprint Change Proposal: Replatforming to Python/build123d

**Date:** 2026-01-06  
**Project:** Lego Builder  
**Change Type:** Major Strategic Pivot - Architecture Replacement  
**Prepared By:** BMad Correct Course Workflow

---

## 1. Issue Summary

### Problem Statement
During implementation of Epic 3 (Brick Inventory Scanning), the user discovered an existing open-source solution that provides a superior technical foundation for the Lego Builder application.

### Discovery Context
- **When Discovered:** After completing Epics 1 & 2 (Foundation and AI-Powered Generation)
- **Triggering Factor:** Research into Python CAD libraries (build123d) revealed the Forma AI repositories
- **Evidence:** 
  - Backend: https://github.com/andreyka/forma-ai-service
  - Frontend: https://github.com/andreyka/forma-ai-frontend

### Current State
- Existing implementation uses Next.js + Vercel AI SDK + Gemini for text/image-to-3D generation
- Generated models use iframe-injected HTML with Three.js for visualization
- 2 epics completed (Foundation, AI Generation), 1 epic in progress (Brick Scanning)

---

## 2. Impact Analysis

### 2.1 Epic Impact Assessment

| Epic | Status | Impact | Required Action |
|------|--------|--------|----------------|
| **Epic 1: Foundation** | Done | ❌ **Complete Rewrite** | Rebuild on Python backend + Next.js frontend |
| **Epic 2: AI Generation** | Done | ❌ **Complete Rewrite** | Replace with multi-agent architecture |
| **Epic 3: Brick Scanning** | In Progress | ⚠️ **Pause & Redesign** | Halt current work, redesign for new stack |
| **Epic 4: Inventory-Aware** | Backlog | ⚠️ **Requires Redesign** | Technical implementation must change |
| **Epic 5: Onboarding** | Backlog | ✅ **Minimal Impact** | UX flows remain valid |
| **Epic 6: Build Instructions** | Backlog | ⚠️ **Requires Redesign** | Layer-by-layer logic needs architectural update |
| **Epic 7: Build Progress** | Backlog | ⚠️ **Requires Redesign** | Storage and state management needs rework |
| **Epic 8: Template Discovery** | Backlog | ⚠️ **Requires Redesign** | Template storage/retrieval needs backend design |

**Summary:** 
- ❌ 2 epics must be **completely rewritten** (but can leverage Forma AI foundation)
- ⚠️ 5 epics require **technical redesign** (functional requirements stay the same)
- ✅ 1 epic has **minimal impact** (UX-focused, mostly frontend)

### 2.2 Artifact Conflict Analysis

#### PRD (Product Requirements Document)
**Status:** ✅ **VALID - No Changes Needed**

- **Reasoning:** The "What" (features, user needs, business goals) remains unchanged
- **User Requirements:** Still want text-to-LEGO, inventory scanning, build instructions, etc.
- **MVP Scope:** Can be maintained with new technical foundation
- **Action:** **RETAIN AS-IS**

#### UX Design Specification
**Status:** ⚠️ **MOSTLY VALID - Minor Updates**

- **Reasoning:** User flows and component concepts remain the same
- **Impact Areas:**
  - 3D viewer component (now uses Three.js via React Three Fiber instead of iframe)
  - Chat interface for AI interaction (Forma AI has conversational UI patterns to reference)
- **Action:** **RETAIN with annotations** about new technical patterns

#### Architecture Document
**Status:** ❌ **INVALID - Complete Replacement Required**

- **Reasoning:** Entire technology stack is changing
- **Old Stack:** Next.js App Router, Vercel AI SDK, Gemini direct integration, iframe-based 3D viewer
- **New Stack:** 
  - **Backend:** Python/FastAPI, build123d, Multi-agent AI (Control Flow + Designer + Coder + Renderer), RAG with ChromaDB, PyVista headless rendering
  - **Frontend:** Next.js 15+, React Three Fiber, A2A protocol client
- **Action:** **COMPLETE REWRITE** required

#### Epics & Stories
**Status:** ⚠️ **PARTIAL INVALIDATION**

- **Reasoning:** Epics 1 & 2 implementation details are now obsolete
- **Impact:**
  - Epic 1 stories: All technical implementation stories invalid
  - Epic 2 stories: All AI generation stories invalid
  - Epic 3-8 stories: **Not yet generated**, will be created with new architecture
- **Action:** **Archive existing stories**, **regenerate** Epic 1 & 2 stories based on Forma AI foundation

---

## 3. Recommended Approach

### Selected Path: **MVP REVIEW + FOUNDATION RESET**

This is not a simple "Direct Adjustment" or "Rollback". This is a **strategic replatforming** that requires:

1. **Transition to Brownfield Methodology**
2. **Foundation Reset** using Forma AI repositories as base
3. **Requirement Preservation** (PRD/UX remain valid)
4. **Architecture Rebuild** from scratch

### Rationale

#### Why This Approach?

**Advantages of Forma AI Foundation:**
- ✅ **Production-grade CAD generation** using build123d (parametric, engineering-grade geometry)
- ✅ **Multi-agent architecture** with self-correction and visual feedback loops
- ✅ **Proven technology stack** (already implemented and working)
- ✅ **Headless rendering** (PyVista) for server-side 3D preview generation
- ✅ **Standard CAD formats** (STEP/STL) for manufacturing and 3D printing
- ✅ **RAG system** with build123d documentation for accurate code generation

**Disadvantages of Current Implementation:**
- ❌ Uses LLM to generate HTML/Three.js code (not CAD-grade geometry)
- ❌ No self-correction or quality feedback loops
- ❌ Limited to visual representation (not manufacturing-ready)
- ❌ Would require significant research to achieve Forma AI's capabilities

**Business Impact:**
- 🎯 **Better Product:** CAD-grade models vs. visual approximations
- 🎯 **Faster Development:** Leverage existing, proven architecture
- 🎯 **Manufacturing Ready:** STEP/STL formats enable real-world use cases
- 🎯 **Reduced Risk:** Building on tested foundation vs. experimental approach

**Effort Comparison:**
- Continuing current path: HIGH effort to reach Forma AI's capabilities
- Replatforming: MEDIUM effort to adapt Forma AI to Lego Builder requirements
- **Winner:** Replatforming is more efficient

---

## 4. Detailed Transition Plan

### Phase 1: Repository Consolidation (Monorepo Setup)

**Objective:** Create unified repository structure

**Structure:**
```
lego-builder/
├── backend/           # Clone forma-ai-service
├── frontend/          # Clone forma-ai-frontend  
├── _bmad-output/      # Preserve all planning artifacts
│   ├── project-planning-artifacts/
│   │   ├── prd.md                    # ✅ RETAIN
│   │   ├── ux-design-specification.md # ⚠️ RETAIN with notes
│   │   ├── epics.md                  # ⚠️ ARCHIVE old, update with new
│   │   └── architecture.md           # ❌ REPLACE
│   └── implementation-artifacts/
│       └── [archive old stories]     # ❌ ARCHIVE
├── docs/              # New brownfield documentation
├── README.md
└── docker-compose.yml # Unified orchestration
```

**Actions:**
1. Create new directory: `lego-builder-monorepo/`
2. Clone backend repo into `backend/` subdirectory
3. Clone frontend repo into `frontend/` subdirectory
4. Copy `_bmad-output/` from current project to preserve planning
5. Initialize git repository for the monorepo
6. Create unified `docker-compose.yml` for full-stack development

#### File Migration Guide

**✅ Must Copy (Critical Planning Documents)**

From `_bmad-output/project-planning-artifacts/`:
1. **`prd.md`** - Your product requirements (fully valid, no changes needed)
2. **`ux-design-specification.md`** - Your UX design (mostly valid, minor technical updates only)
3. **`epics.md`** - Your epic descriptions (user value unchanged)
4. **`sprint-change-proposal-2026-01-06.md`** - This replatforming plan

**📋 Should Copy (Valuable Context)**

From `_bmad-output/project-planning-artifacts/`:
5. **`product-brief-lego-builder-2025-12-27.md`** - Product vision and strategy
6. **`research/`** folder (entire directory) - Your 2D-to-3D research (still relevant for understanding domain)

**❌ Do NOT Copy (Will Be Replaced or Obsolete)**

- `architecture.md` - Old Next.js architecture (invalid for Python stack)
- `_bmad-output/implementation-artifacts/` - All old stories (obsolete technical implementation)
- `project-context.md` - Old tech stack rules (will regenerate for Python/build123d)
- `bmm-workflow-status.yaml` - Old workflow tracking (will reset to brownfield track)

**Final New Project Structure:**

```
lego-builder/
├── backend/                          # Clone from forma-ai-service
│   ├── agents/
│   ├── api/
│   ├── rag/
│   ├── renderer/
│   └── ...
├── frontend/                         # Clone from forma-ai-frontend
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
├── _bmad/                            # BMAD workflows (copy from BMAD installer)
│   ├── bmm/
│   ├── core/
│   └── ...
├── _bmad-output/
│   └── project-planning-artifacts/
│       ├── prd.md                              ← COPY ✅
│       ├── ux-design-specification.md          ← COPY ✅
│       ├── epics.md                            ← COPY ✅
│       ├── sprint-change-proposal-2026-01-06.md ← COPY ✅
│       ├── product-brief-lego-builder-2025-12-27.md ← COPY 📋
│       └── research/                           ← COPY 📋
│           ├── technical-2d-to-3d-voxel-research-2025-12-26.md
│           └── ...
├── docs/                             # Will be created during brownfield workflow
├── README.md
└── docker-compose.yml                # Unified orchestration
```

**Migration Steps:**

1. **Create monorepo directory:**
   ```bash
   mkdir lego-builder
   cd lego-builder
   ```

2. **Clone repositories:**
   ```bash
   git clone https://github.com/andreyka/forma-ai-service.git backend
   git clone https://github.com/andreyka/forma-ai-frontend.git frontend
   ```

3. **Copy planning documents:**
   ```bash
   # From your old project location
   mkdir -p _bmad-output/project-planning-artifacts
   cp /path/to/old/_bmad-output/project-planning-artifacts/prd.md _bmad-output/project-planning-artifacts/
   cp /path/to/old/_bmad-output/project-planning-artifacts/ux-design-specification.md _bmad-output/project-planning-artifacts/
   cp /path/to/old/_bmad-output/project-planning-artifacts/epics.md _bmad-output/project-planning-artifacts/
   cp /path/to/old/_bmad-output/project-planning-artifacts/sprint-change-proposal-2026-01-06.md _bmad-output/project-planning-artifacts/
   cp /path/to/old/_bmad-output/project-planning-artifacts/product-brief-lego-builder-2025-12-27.md _bmad-output/project-planning-artifacts/
   cp -r /path/to/old/_bmad-output/project-planning-artifacts/research/ _bmad-output/project-planning-artifacts/
   ```

4. **Install BMAD workflows:**
   ```bash
   # Copy _bmad/ directory from BMAD installer or previous project
   cp -r /path/to/_bmad .
   ```

5. **Initialize git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Lego Builder replatforming with Forma AI foundation"
   ```

6. **Ready to start brownfield workflow:**
   ```bash
   # Open in your AI IDE and run:
   # /bmad-bmm-workflows-document-project
   ```

### Phase 2: Document Existing Codebase (Brownfield Workflow)

**Objective:** Understand the Forma AI codebase thoroughly

**Workflow:** `/bmad-bmm-workflows-document-project`

**Deliverables:**
- `docs/brownfield-analysis.md` - Complete codebase analysis
- `docs/architecture-decisions.md` - Understanding design patterns
- `_bmad-output/project-context.md` - Updated context for AI agents

**Key Areas to Document:**
- **Backend:**
  - Multi-agent control flow architecture
  - Designer, Coder, Renderer agent responsibilities
  - RAG system integration with ChromaDB
  - A2A protocol implementation
  - build123d code generation patterns
  - PyVista rendering pipeline
  
- **Frontend:**
  - Next.js project structure
  - React Three Fiber 3D viewer implementation
  - A2A protocol client
  - Chat interface patterns
  - Model download/preview flows

### Phase 3: Architecture Document Replacement

**Objective:** Create new Architecture document based on Forma AI stack

**Workflow:** `/bmad-bmm-workflows-create-architecture`

**Required Decisions:**
| Decision Area | Current (Forma AI) | Lego Builder Adaptation |
|---------------|-------------------|-------------------------|
| **Backend Framework** | Python/FastAPI | ✅ Keep |
| **CAD Library** | build123d | ✅ Keep |
| **AI Orchestration** | Multi-agent (Designer+Coder+Renderer) | ⚠️ Adapt for LEGO-specific generation |
| **AI Provider** | Gemini 3.0 Pro (via LiteLLM) | ⚠️ Evaluate options (keep LiteLLM flexibility) |
| **RAG System** | ChromaDB + build123d docs | ⚠️ Add LEGO brick specifications |
| **3D Rendering** | PyVista (headless) | ✅ Keep |
| **Frontend Framework** | Next.js 15+ | ✅ Keep |
| **3D Viewer** | React Three Fiber | ✅ Keep |
| **Protocol** | A2A (Agent-to-Agent) | ✅ Keep |
| **Storage** | Stateless (files only) | ⚠️ Add IndexedDB for inventory |
| **PWA** | Not implemented | ➕ Add (from original plan) |

**New Sections Required:**
- Brick Inventory Storage (IndexedDB integration)
- LEGO-specific constraints in CAD generation
- Build instructions generation from 3D model
- Offline-first PWA architecture

### Phase 4: Epic & Story Regeneration

**Objective:** Create implementation-ready stories for new architecture

**Actions:**

1. **Update Epics Document:**
   - ✅ Keep Epic descriptions (user value unchanged)
   - ⚠️ Update Epic 1 (Foundation) for Python/Next.js stack
   - ⚠️ Update Epic 2 (AI Generation) for multi-agent architecture
   - Keep Epics 3-8 as-is (not yet implemented)

2. **Regenerate Stories:**
   - Run `/bmad-bmm-workflows-create-epics-and-stories` for Epic 1
   - Run `/bmad-bmm-workflows-create-epics-and-stories` for Epic 2
   - Stories will now reference:
     - Python/FastAPI backend setup
     - build123d integration
     - Multi-agent AI architecture
     - React Three Fiber 3D viewer
     - A2A protocol implementation

### Phase 5: Sprint Planning Reset

**Objective:** Create new sprint plan starting from Epic 1

**Workflow:** `/bmad-bmm-workflows-sprint-planning`

**New Sprint Status:**
```yaml
epic-1: backlog  # Reset to backlog
epic-2: backlog  # Reset to backlog
epic-3: backlog  # Not started yet
# ... etc
```

---

## 5. Artifacts Requiring Updates

### Documents to RETAIN:
- ✅ `prd.md` - Product requirements are still valid
- ✅ `ux-design-specification.md` - UX flows are still valid (with minor notes)
- ✅ `epics.md` - Epic descriptions remain valid (technical stories will change)

### Documents to REPLACE:
- ❌ `architecture.md` - Complete rewrite for Python/build123d stack
- ❌ `project-context.md` - New rules for Python/build123d patterns

### Documents to ARCHIVE (Historical Reference):
- 📦 `implementation-artifacts/1-*.md` - Epic 1 stories (Next.js-only implementation)
- 📦 `implementation-artifacts/2-*.md` - Epic 2 stories (Vercel AI SDK implementation)
- 📦 `implementation-artifacts/3-1-*.md` - Story 3-1 (camera permissions - can be adapted later)

### New Documents to CREATE:
- ➕ `docs/brownfield-analysis.md` - Forma AI codebase understanding
- ➕ `docs/migration-plan.md` - Detailed migration steps
- ➕ `docs/lego-specific-adaptations.md` - How to adapt Forma AI for LEGO use case

---

## 6. Implementation Handoff

### Change Scope Classification: **MAJOR**

This is a **fundamental replan** requiring PM/Architect involvement.

### Handoff Recipients & Responsibilities

#### Product Manager (PM)
**Responsibilities:**
- Approve this Sprint Change Proposal
- Validate that PRD requirements can still be met with new architecture
- Confirm MVP scope is achievable with replatforming timeline

#### Solution Architect
**Responsibilities:**
- Review Forma AI architecture
- Execute `document-project` workflow on both repositories
- Create new `architecture.md` document
- Define LEGO-specific adaptations needed

#### Scrum Master (SM)
**Responsibilities:**
- Archive current sprint status
- Reset sprint planning to Epic 1 (backlog state)
- Generate new stories based on new architecture

#### Development Team
**Responsibilities:**
- Set up monorepo structure
- Clone and configure Forma AI repositories
- Execute new stories once architecture is finalized

---

## 7. Success Criteria

### Must Have (Blocking)
- [ ] User approves this Sprint Change Proposal
- [ ] Monorepo structure created and functional
- [ ] Both Forma AI repositories cloned and running locally
- [ ] `document-project` workflow completed on brownfield code
- [ ] New `architecture.md` document created and approved
- [ ] Epic 1 & 2 stories regenerated
- [ ] New sprint plan created

### Should Have (Non-Blocking)
- [ ] Git commit history from Forma AI repos preserved
- [ ] Docker Compose orchestration working end-to-end
- [ ] First story from new Epic 1 started

### Success Metrics
- ✅ Can generate CAD-grade 3D models from text prompts
- ✅ 3D viewer displays models in browser
- ✅ STEP/STL files are downloadable
- ✅ All PRD requirements still achievable

---

## 8. Timeline Estimate

| Phase | Estimated Effort | Risk Level |
|-------|-----------------|------------|
| Repository Consolidation | 1-2 hours | Low |
| Document Brownfield Code | 2-3 hours | Medium |
| Architecture Replacement | 3-4 hours | Medium |
| Epic/Story Regeneration | 2-3 hours | Low |
| Sprint Planning Reset | 1 hour | Low |
| **TOTAL** | **9-13 hours** | **Medium** |

**Comparison to Alternative:**
- Building build123d integration from scratch: ~40-60 hours
- Implementing multi-agent architecture: ~30-40 hours
- Creating headless rendering: ~20-30 hours
- **Total if continuing current path: ~90-130 hours**

**ROI of Replatforming:** Saves ~80-120 development hours

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Forma AI code is poorly documented | Medium | High | Use `document-project` workflow to analyze thoroughly |
| LEGO-specific requirements don't fit Forma AI | Low | High | PRD analysis shows good alignment, brick constraints are additions |
| Multi-agent architecture is complex | Medium | Medium | Start with simple use case, iterate gradually |
| Team unfamiliar with Python/build123d | High | Medium | Leverage existing code, add learning tasks to stories |
| Migration takes longer than estimated | Medium | Medium | Phased approach allows partial rollback if needed |

---

## 10. Open Questions

### For User (PM) Decision:
1. **Commit History:** Do you want to preserve git history from Forma AI repos, or start fresh?
2. **Licensing:** Have you reviewed Forma AI's MIT license for compatibility?
3. **Timeline:** Are you comfortable with ~9-13 hours of planning/setup before resuming development?
4. **MVP Scope:** Any PRD features you want to deprioritize given this change?

### For Architecture Phase:
1. How to adapt Designer Agent prompts for LEGO brick constraints?
2. Should we add a "Brick Inventory Validator" agent to the control flow?
3. How to generate build instructions from the STEP/STL output?
4. What LEGO-specific data needs to be in the RAG system?

---

## 11. Recommendation

**I RECOMMEND PROCEEDING with this replatforming.**

### Why:
1. ✅ **Superior Product:** CAD-grade geometry vs. visual approximations
2. ✅ **Proven Foundation:** Working multi-agent architecture with self-correction
3. ✅ **Time Savings:** ~80-120 hours saved vs. building from scratch
4. ✅ **Requirements Preserved:** PRD and UX remain valid
5. ✅ **Manufacturing Ready:** STEP/STL formats enable real-world use

### Next Steps if Approved:
1. **User approves this proposal** ✋ **(BLOCKING)**
2. Create monorepo structure
3. Run `/bmad-bmm-workflows-document-project` on Forma AI repos
4. Run `/bmad-bmm-workflows-create-architecture` to rebuild architecture doc
5. Run `/bmad-bmm-workflows-create-epics-and-stories` to regenerate stories
6. Run `/bmad-bmm-workflows-sprint-planning` to reset sprint
7. Begin development on new Epic 1, Story 1

---

**Prepared by:** Correct Course Workflow  
**Date:** 2026-01-06  
**Status:** 🟡 Awaiting User Approval
