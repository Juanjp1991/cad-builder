---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - '_bmad-output/analysis/brainstorming-session-2025-12-26.md'
  - '_bmad-output/project-planning-artifacts/research/technical-2d-to-3d-voxel-research-2025-12-26.md'
  - '_bmad-output/project-planning-artifacts/research/technical-brick-identification-research-2025-12-26.md'
workflowType: 'product-brief'
lastStep: 0
project_name: 'Lego Builder'
user_name: 'Juan'
date: '2025-12-27'
---

# Product Brief: Lego Builder

## Executive Summary

**Lego Builder** is an AI-powered web application that transforms how families experience their Lego collections. By combining brick scanning technology with generative AI, users can turn any image or idea into buildable Lego instructions—using only the bricks they already own.

**Vision:** Create special moments where parents and kids build unique designs together, from scratch.

**Elevator Pitch:** *"Turn any picture or idea into step-by-step Lego instructions—using YOUR bricks."*

**Business Model:** Freemium with premium subscription ($5-10/mo)  
**Platform:** Progressive Web App (PWA) → Android via TWA

---

## Core Vision

### Problem Statement

Millions of households have boxes of random Lego bricks gathering dust. Parents and children want to build together but face a creativity gap—they don't know what's possible with their specific collection.

### Problem Impact

- Unused Lego collections = wasted potential and money
- Missed parent-child bonding opportunities
- Frustration when builds require unavailable pieces

### Why Existing Solutions Fall Short

| Solution | Limitation |
|----------|------------|
| **Brickit** | Pre-made instruction library only—no custom AI generation |
| **YouTube MOCs** | Require specific bricks; no inventory matching |
| **Official Lego sets** | Expensive; ignores existing brick collections |

### Proposed Solution

AI-generated custom Lego models from text prompts and images, with inventory awareness that tells users what's buildable and what's missing.

### Key Differentiators

1. **AI-Generated Designs** — Infinite possibilities vs. limited catalog
2. **2D Image → Lego Model** — Core unique feature competitors lack
3. **Inventory-First Approach** — Shows what's buildable AND what's missing
4. **Optimized for Buildability** — Models follow real Lego engineering:
   - Structural integrity (every brick connects)
   - Staggered joints (no weak vertical seams)
   - Sequenced assembly order (layer-by-layer instructions)
5. **Parent-Child Focus** — Designed for family bonding moments
6. **Social Sharing** — Share creations with likes and community

---

## Target Users

### Core Psychographic: Creative Builders

People who want **original creations**, not copies of what everyone else has built. They value unique designs and creative ownership over following standard instructions.

### Primary User Segments

#### 1. Family Builders 👨‍👩‍👧

**Persona:** Parent (30-45) + Child (5-12)

- **Use Case:** Weekend bonding, rainy day activity, shared creative projects
- **Pain Point:** Has a box of random bricks but no idea what to build together
- **Success Moment:** "Look what WE made!" — shared pride in a finished creation
- **Needs:** Quick Start mode for fast setup with impatient kids
- **Account Type:** Family Account — parent billing, kid profiles

#### 2. Adult Enthusiasts (AFOLs) 🧱

**Persona:** Solo adult builder (25-55)

- **Use Case:** Unique display pieces, office desk art, personal projects
- **Pain Point:** Wants custom designs, not pre-made instructions everyone has
- **Success Moment:** "I built something truly unique" — one-of-a-kind creation
- **Needs:** Detailed brick inventory, complex model generation
- **Account Type:** Individual premium subscription

#### 3. Experienced Kids 🎮

**Persona:** Independent child builder (8-14) with Lego experience

- **Use Case:** After-school creative play, YouTube-inspired projects
- **Pain Point:** Outgrown official sets, wants to design their own creations
- **Success Moment:** "I designed this myself!" — creative ownership
- **Needs:** Easy interface, inspiration prompts, guided complexity
- **Account Type:** Child profile under Family Account

### User Journey

| Stage | Experience |
|-------|------------|
| **Discovery** | Sees shared creation on social media or friend recommendation |
| **Onboarding** | Quick Start (skip scanning) OR detailed brick inventory scan |
| **First Build** | Generates model from prompt, follows layer-by-layer instructions |
| **Aha Moment** | "This actually works with MY bricks!" |
| **Habit Formation** | Returns whenever they want a new build idea |
| **Advocacy** | Shares creation → attracts new users |

---

## Success Metrics

### User Success Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Build Completion Rate** | % of generated models that users finish building | >60% |
| **Time to First Build** | Minutes from signup to completed first model | <30 min |
| **Return Builder Rate** | % of users who come back for a 2nd project | >40% |
| **Social Shares** | Creations shared to community or external platforms | Track growth |

### Aha Moment

> **"Thought becomes reality"** — The moment a user's idea transforms into a physical Lego model they can hold in their hands.

**Proxy Metric:** Time from prompt input → build completion (target: under 2 hours for simple models)

### Business Objectives

| Timeframe | Focus | Metric |
|-----------|-------|--------|
| **3 Months** | User Growth | Total registered users |
| **6 Months** | Engagement | Weekly active builders |
| **12 Months** | Monetization | Premium conversion rate, MRR |

### Key Performance Indicators (KPIs)

1. **Monthly Active Users (MAU)** — Primary growth indicator
2. **Models Generated per User** — Engagement depth
3. **Build Completion Rate** — Value delivery confirmation
4. **Free → Premium Conversion** — Business viability
5. **Viral Coefficient** — Shares leading to new signups

---

## MVP Scope

### Core Features (Must Have)

| Feature | Description |
|---------|-------------|
| **Text → Lego Model** | Generate buildable Lego model from text prompt |
| **Image → Lego Model** | Convert 2D photo into Lego model (core differentiator) |
| **Layer-by-Layer Instructions** | Step-by-step build guide with brick counts |
| **Brick Scanning** | Photograph bricks to create inventory |
| **Quick Start Mode** | Skip scanning for fast onboarding |
| **Missing Brick Alerts** | Notify users which bricks are needed but not in inventory |

### Out of Scope for MVP

| Feature | Target Release |
|---------|----------------|
| Social Sharing / Community | v1.2 |
| Family Accounts | v1.2 |
| Google Auth + Stripe | v1.1 |
| STL/OBJ → Lego Model | v2.0 |
| Hollow/Infill Options | v2.0 |

### MVP Success Criteria

- Users can generate a buildable model from text or image
- Users can scan bricks and see what's missing for a build
- 60%+ of users complete at least one physical build
- Positive feedback: "This actually works with MY bricks!"

### Future Vision

**Phase 2 (v1.1-1.2):** Social sharing, family accounts, Google Auth, Stripe payments
**Phase 3 (v2.0):** STL/OBJ conversion, hollow/infill options, community marketplace
