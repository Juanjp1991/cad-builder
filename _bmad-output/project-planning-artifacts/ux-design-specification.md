---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - '_bmad-output/project-planning-artifacts/product-brief-lego-builder-2025-12-27.md'
  - '_bmad-output/analysis/brainstorming-session-2025-12-26.md'
  - '_bmad-output/project-planning-artifacts/research/technical-2d-to-3d-voxel-research-2025-12-26.md'
  - '_bmad-output/project-planning-artifacts/research/technical-brick-identification-research-2025-12-26.md'
workflowType: 'ux-design'
lastStep: 0
project_name: 'Lego Builder'
user_name: 'Juan'
date: '2025-12-27'
---

# UX Design Specification: Lego Builder

**Author:** Juan
**Date:** 2025-12-27

---

## Executive Summary

### Project Vision

Lego Builder transforms any image or idea into buildable Lego instructions using only the bricks users already own. The app creates "aha moments" when a thought becomes a physical creation families can build together.

### Target Users

- **Family Builders** — Parents (30-45) and children (5-12) seeking weekend bonding activities
- **Adult Enthusiasts (AFOLs)** — Solo adults (25-55) wanting unique custom display pieces
- **Experienced Kids** — Independent builders (8-14) who've outgrown official sets

**Unifying trait:** Creative Builders who value original creations over following standard instructions.

### Key Design Challenges

1. **Mobile-First Touch Design** — Primary devices are phones/tablets; camera integration is essential
2. **All-Ages Accessibility** — Interface must work for 8-year-olds and adults alike
3. **Variable Session Handling** — Support both quick scans and deep design sessions
4. **Complex Feature Density** — Many features (scan, design, instructions, inventory) must feel unified and simple
5. **Progress Preservation** — Users may pause mid-build and need seamless resume

### Design Opportunities

1. **Camera-Native Magic** — Scanning should feel like magic, not a technical process
2. **Visual-First Instructions** — 3D layer visualizations over text for kid accessibility
3. **Celebratory Completion** — Share-worthy "look what we built!" moments
4. **Progressive Disclosure** — Simple defaults for kids, depth for power users
5. **Natural Touch 3D** — Intuitive rotate/zoom gestures for model exploration

---

## Core User Experience

### Defining Experience

**Core Action:** Design Generation — transforming an idea into a buildable Lego model with step-by-step instructions.

**Primary Flow:** Inventory-First — scan your bricks first, then discover what you can build with what you have.

**The Magic Moment:** When a user's imagination becomes a physical Lego creation they can hold — designed uniquely for them, buildable with their own bricks.

**Experience Promise:** "Think it → See it → Build it" — effortless from imagination to reality.

**Entry Point Tone:** Playful and inviting — "What do you feel like building today?" not cold task-oriented language.

### Platform Strategy

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Platform** | PWA (Progressive Web App) | Works on all devices, camera access, installable |
| **Primary Device** | Mobile/Tablet | Touch-first, camera-native scanning |
| **Input Mode** | Touch-first | Large targets, swipe gestures, pinch-zoom 3D |
| **Connectivity** | Always connected (MVP) | Simplifies AI processing architecture |
| **Camera Access** | Essential | Core to scanning feature |

### Effortless Interactions

These interactions MUST feel completely natural:

1. **Build Instructions** — Tap through layers visually, no reading required
2. **Design Generation** — Describe or upload image → see result with animated "building" feedback
3. **3D Model Exploration** — Pinch, rotate, zoom with natural gestures
4. **Inventory Matching** — Instant "you can build this" / "you need X" feedback
5. **Brick Scanning** — "Thinking" animation while AI processes

### Graceful Recovery

When things don't go perfectly, guide users forward:

| Scenario | Recovery UX |
|----------|-------------|
| **Design doesn't match expectation** | Free retry — regenerate without penalty |
| **Not enough bricks** | Offer to scale model smaller automatically |
| **Scan incomplete** | "Add more bricks?" prompt, not error |

### Critical Success Moments

| Moment | User Feeling | UX Implication |
|--------|--------------|----------------|
| **Scan Complete** | "It recognized my bricks!" | "Thinking" animation → count reveal |
| **Design Generated** | "That's what I imagined!" | "Building" animation → model appears |
| **Inventory Match** | "I can build this NOW!" | Clear green/yellow/red buildability |
| **First Instruction Step** | "This is so clear" | 3D layer highlight, minimal text |
| **Build Complete** | "WE made this!" | Celebration, easy sharing |

### Experience Principles

These principles guide ALL UX decisions:

1. **Visual Over Verbal** — Show, don't tell. Kids don't need to read.
2. **Inventory-First Flow** — Know what you have before dreaming big (MVP primary)
3. **Graceful Recovery** — Free retries, scale-down options, no dead-ends
4. **Instant Gratification** — Every tap produces visible feedback
5. **Forgiving Flexibility** — Easy to pause, resume, restart, or change mind
6. **Playful Entry** — Warm inviting language, not task-oriented
7. **Celebration Built-in** — Make completion moments special and shareable

---

## Desired Emotional Response

### Primary Emotional Goals

The four core emotions Lego Builder should evoke:

1. **Curiosity** — "What can I make? What will it create?"
2. **Pride** — "I made this! Look what WE built!"
3. **Excitement** — "This is amazing! I can't wait to build!"
4. **Connection** — "WE did this together" (family bonding)

### Emotional Journey Mapping

| Stage | Primary Emotion | Trigger |
|-------|-----------------|---------|
| **First Open** | Curiosity | Playful "What do you feel like building?" |
| **Scanning Bricks** | Anticipation + Suspense | "Thinking" animation, count reveal |
| **Inventory Check** | Tension → Victory | Drumroll effect, "YES, you can build this!" |
| **Design Generated** | Excitement + Surprise | "Building" animation, model appears |
| **During Build** | Flow + Connection | Clear visual instructions, parent-child moment |
| **Build Complete** | Pride + Connection | Celebration screen, share prompt |

**Key Shareable Moment:** The completed build celebration — photo-ready "WE made this!" screen.

### Micro-Emotions

| Positive (Target) | Negative (Avoid) | Prevention Strategy |
|-------------------|------------------|---------------------|
| **Confidence** | Confusion | Visual-first design, minimal text |
| **Trust** | Skepticism | Quick first success, accurate scanning |
| **Excitement** | Anxiety | Inventory-first flow, scale-down options |
| **Delight** | Just-satisfied | Surprising AI interpretations, celebration moments |

### Design Implications

| Emotion | UX Design Approach |
|---------|-------------------|
| **Curiosity** | Discovery-driven UI, progressive reveal, "What if?" prompts |
| **Pride** | Ownership language ("YOUR creation"), shareable screens, build gallery |
| **Excitement** | Fast feedback, anticipation animations, high-quality 3D previews |
| **Connection** | "WE" language for families, co-builder acknowledgment |

### Community & Engagement Features

| Feature | Emotional Purpose |
|---------|-------------------|
| **World Counter** | "47M bricks placed by builders worldwide!" — collective pride, belonging |
| **Personal Stats** | Your creations count, total bricks placed — self-pride, progress |
| **Creation Spotlight** | Featured community builds — curiosity, inspiration |
| **Named Creations** | "Juan's Rainbow Dragon" not "Model #47" — ownership, identity |
| **Build Stories** | Auto-generated: "Built X using 127 bricks in 45 mins" — shareable narrative |

### Emotional Design Principles

1. **Every Interaction Sparks Curiosity** — Design for discovery, not just task completion
2. **Make Pride Shareable** — Build celebration screens worth screenshotting
3. **Sustain Excitement** — Never break flow; progress storytelling bridges wait times ("Analyzing... Finding... Building...")
4. **Prevent Negative Emotions** — Graceful recovery before frustration sets in
5. **Celebrate the Journey** — Small wins throughout, not just at the end
6. **Build Connection** — Acknowledge co-builders, use "WE" language for families

---

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

#### Brickit
- **Warm aesthetic** — friendly colors, rounded corners, soft shadows
- **Social media familiarity** — scrolling feeds, card layouts, familiar gestures
- **Visual focus** — images over text, icon-first navigation
- **Minimal text** — labels only when needed, icons do the heavy lifting
- **Clear workflow** — linear step-by-step, obvious "what's next"

#### Lego Builder Android App
- **Playful UI** — Lego-inspired colors, chunky buttons, fun animations
- **Kid-friendly** — large touch targets, forgiving interactions
- **Brand alignment** — feels authentically "Lego" (primary colors, brick aesthetics)

### Transferable UX Patterns

| Pattern | Application |
|---------|-------------|
| **Card-based layouts** | Designs displayed as browsable, tappable cards |
| **Icon-first navigation** | Scan, Create, Build, Profile — visual tabs |
| **Warm color palette** | Lego DNA — yellows, reds, bright blues |
| **Step indicators** | "Step 1/5" during multi-step flows |
| **Familiar gestures** | Swipe, scroll, pinch — social-media muscle memory |
| **Feed-style discovery** | Browse community creations like social posts |
| **Floating quick-action button** | One-tap access to camera/create (Instagram/TikTok pattern) |
| **Micro-interactions** | Satisfying animations on key actions (scan pulse, design reveal) |

### Color Palette Strategy

| Role | Color | Usage |
|------|-------|-------|
| **Primary** | Deep saturated blue | Trust, calm, main UI elements |
| **Accent** | Lego yellow | CTAs, highlights, attention-grabbing |
| **Secondary** | Brick red | Alerts, progress indicators |
| **Neutral** | Warm grays | Backgrounds, body text |

### Layout & Grid System

- **8px design grid** — Consistent spacing, faster development
- **44px minimum touch targets** — Large, forgiving tap areas
- **Table mode support** — Layouts that work on flat tablet for family co-viewing

### Anti-Patterns to Avoid

| Anti-Pattern | Risk | Prevention |
|--------------|------|------------|
| **Dense text instructions** | Kids skip/ignore | Visual-first, icons over words |
| **Complex nested menus** | Confusion, lost users | Flat navigation, max 2 levels |
| **Small touch targets** | Frustration on mobile | 44px minimum tap areas |
| **Cold/corporate aesthetic** | Kills playfulness | Warm colors, rounded shapes |
| **Ambiguous icons** | User confusion | Pair with short labels initially |

### Design Inspiration Strategy

**Adopt:**
- Card-based layouts for design browsing
- Icon-first navigation bar
- Warm, Lego-inspired color palette
- Step progress indicators
- Floating quick-action button

**Adapt:**
- Brickit's social feed → our Creation Spotlight
- Lego Builder's playfulness → progressive disclosure for adult AFOLs
- TikTok-style micro-interactions → contextual animations

**Avoid:**
- Text-heavy interfaces
- Deep navigation hierarchies
- Corporate/sterile aesthetics
- Small, hard-to-tap elements

---

## Design System Foundation

### Design System Choice

**Stack:** Next.js 14+ + React 19 + Shadcn/ui + Tailwind CSS + TypeScript

| Technology | Purpose |
|------------|---------|
| **Next.js 14+** | Framework, App Router, API routes, PWA support |
| **React 19** | UI library, functional components, hooks |
| **Shadcn/ui** | Pre-built accessible components (Radix primitives) |
| **Tailwind CSS** | Utility-first styling, custom theming |
| **TypeScript** | Type safety, better DX |

### Rationale for Selection

1. **Next.js** — PWA support via `next-pwa`, API routes for secure Gemini calls, file-based routing
2. **React 19** — Matches existing example app, modern hooks, large ecosystem
3. **Shadcn/ui** — Fully customizable, copy-paste ownership, accessible by default
4. **Tailwind CSS** — Matches existing example, supports 8px grid system, easy theming
5. **TypeScript** — Type safety, matches existing example app

### Implementation Approach

| Component | Approach |
|-----------|----------|
| **3D Viewer** | Three.js via iframe injection (existing pattern) |
| **UI Components** | Shadcn/ui (Button, Card, Dialog, Form, Toast) |
| **Navigation** | Next.js App Router + icon-first tab bar |
| **Theming** | Tailwind CSS variables (Lego color palette) |
| **PWA** | `next-pwa` plugin |
| **AI Integration** | Gemini SDK → Next.js API routes (secure keys server-side) |

### Customization Strategy

**Color Theming (globals.css):**
```css
:root {
  --primary: 210 100% 45%;           /* Lego blue */
  --primary-foreground: 0 0% 100%;
  --accent: 45 100% 50%;             /* Lego yellow */
  --destructive: 0 84% 60%;          /* Brick red */
  --muted: 30 10% 96%;               /* Warm gray */
}
```

**Component Customization:**
- 8px grid system with Tailwind spacing
- 44px minimum touch targets
- Rounded corners (playful aesthetic)
- Custom 3D viewer component
- Floating action button component
- Celebration/share modal components

---

## Defining Core Experience

### The One-Liner

**"Think it → See it → Build it → Share it"**

Imagine something, watch it become a Lego design, build it with your bricks, share your creation.

### User Mental Model

**How users currently solve this:**
- Google "Lego MOC instructions" → find designs needing bricks they don't have
- Use Brickit → see what existing designs match their bricks (no custom generation)
- YouTube MOC tutorials → follow someone else's design

**What users expect from Lego Builder:**
- "I describe/upload → I see a 3D model → I build it"
- Magic happens in the middle (AI does the hard work)
- Their specific bricks are considered

**Where users get confused:**
- "Will it understand what I want?"
- "Do I have the right bricks?"
- "How complicated are the instructions?"

### Success Criteria

| Criteria | Indicator |
|----------|----------|
| **Works first time** | Design matches user intent on first try (70%+) |
| **Feels fast** | Progress storytelling makes wait feel shorter |
| **Buildable** | At least scaled-down option always available |
| **Clear instructions** | Kids complete build without help |
| **Pride moment** | Users share completed builds |

### Experience Mechanics

**1. Initiation:**
- Floating action button → "Create"
- Playful prompt: "What do you feel like building today?"
- App positioned as "family creative partner"

**2. Interaction:**
- Type description OR upload image
- Progress storytelling: "Imagining... Finding possibilities... Building your design..."
- Magical reveal animation (brick cascade/particles)

**3. Feedback:**
- Immediate: Progress storytelling animation
- Success: Green "You can build this!" with celebration
- Partial: Yellow "Scale down?" option

**4. Completion:**
- Clear "Start Building →" CTA
- Celebration on build complete  
- Frictionless share prompt: "Look what we made!"

### Novel vs. Established Patterns

| Aspect | Pattern Type | Details |
|--------|--------------|----------|
| **Text/image → 3D** | Novel | AI generation is magical |
| **Inventory matching** | Novel | Real-time brick availability |
| **Progress storytelling** | Novel | Perceived faster wait |
| **Layer instructions** | Established | Like Lego official app |
| **3D model viewer** | Established | Pinch/rotate gestures |
| **Card-based browsing** | Established | Social media patterns |
| **Share flow** | Established | Social media patterns |

---

## Visual Design Foundation

### Color System

| Role | HSL Value | Hex | Usage |
|------|-----------|-----|-------|
| **Primary** | 210 100% 45% | #0066CC | Main UI, navigation, trust |
| **Primary Foreground** | 0 0% 100% | #FFFFFF | Text on primary |
| **Accent** | 45 100% 50% | #FFB800 | CTAs, highlights, celebration |
| **Accent Soft** | 45 100% 90% | #FFF4CC | Accent backgrounds |
| **Destructive** | 0 84% 60% | #E53935 | Brick red, errors, alerts |
| **Muted** | 30 10% 96% | #F7F5F3 | Warm gray backgrounds |
| **Success** | 142 76% 36% | #22C55E | "You can build this!" |

**Accessibility:** All color combinations meet WCAG 2.1 AA contrast requirements.

**Implementation:** CSS custom properties for easy theming and future dark mode:
```css
:root {
  --primary: 210 100% 45%;
  --accent: 45 100% 50%;
  --accent-soft: 45 100% 90%;
  --destructive: 0 84% 60%;
}
```

### Typography System

| Role | Font | Weight | Size |
|------|------|--------|------|
| **H1** | Nunito | Bold (700) | 32px / 2rem |
| **H2** | Nunito | SemiBold (600) | 24px / 1.5rem |
| **H3** | Nunito | SemiBold (600) | 20px / 1.25rem |
| **Body** | Inter | Regular (400) | 16px / 1rem |
| **Body Small** | Inter | Regular (400) | 14px / 0.875rem |
| **Caption** | Inter | Medium (500) | 12px / 0.75rem |
| **Stats/Numbers** | JetBrains Mono | Medium (500) | 16px / 1rem |

**Rationale:**
- **Nunito** — Rounded terminals, playful and kid-friendly for headings
- **Inter** — Excellent readability for body text on all screens
- **JetBrains Mono** — Technical credibility for brick counts and stats

### Spacing & Layout Foundation

| Property | Value | Usage |
|----------|-------|-------|
| **Base unit** | 8px | All spacing derived from this |
| **Touch targets** | 44px minimum | WCAG compliance |
| **Border radius SM** | 8px | Small components |
| **Border radius MD** | 12px | Cards, buttons |
| **Border radius LG** | 16px | Modals, large containers |
| **Content max-width** | 640px mobile, 1200px desktop | Optimal reading |

**Layout Density:** Spacious and airy — approachable for all ages.

### Visual Effects

**Glass Morphism (for overlays):**
```css
.overlay {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

**Component Styling:**
- Rounded corners (playful aesthetic)
- 3D model viewer keeps sharp edges (technical contrast)
- Subtle shadows for depth

### Accessibility Considerations

- ✅ 44px minimum touch targets
- ✅ WCAG AA contrast ratios (4.5:1 for text)
- ✅ 16px minimum body text
- ✅ Clear visual hierarchy
- ✅ Color not sole indicator (icons + text)
- ✅ Reduced motion CSS media query support

---

## Design Direction Decision

### Design Directions Explored

| Direction | Description | Target Audience |
|-----------|-------------|-----------------|
| **A: Playful Bricks** | Heavy Lego colors, brick-shaped UI | Kids-forward |
| **B: Modern Minimal** | Clean whites, accent colors only | AFOL-forward |
| **C: Warm & Balanced** | Warm grays + strategic color pops | Universal |

### Chosen Direction: Warm & Balanced

**Core Philosophy:** Playful but not childish — sophistication that kids can enjoy and adults appreciate.

**Visual Characteristics:**
- Warm gray (#F7F5F3) as primary background
- Lego blue for navigation and primary actions
- Lego yellow for CTAs and celebration moments
- Brick red for alerts and progress states
- Generous white space, spacious layout

**Component Style:**
- Card-based content browsing
- Rounded corners (12px) for playfulness
- Glass morphism overlays for premium feel
- Icon-first navigation with text labels
- Floating action button for Create

### Design Rationale

1. **Universal Appeal** — Works for 8-year-olds and 45-year-old AFOLs
2. **Brand Alignment** — Lego-inspired without being themed
3. **Emotional Goals** — Warm tones support curiosity and pride
4. **Technical Clarity** — 3D viewer stands out against warm backgrounds
5. **Accessibility** — Contrast meets WCAG AA, touch targets 44px+

### Implementation Approach

- Base theme on Shadcn/ui default with custom CSS variables
- Apply Lego color palette via globals.css
- Use Nunito for headings, Inter for body, JetBrains Mono for stats
- 8px grid system for consistent spacing
- Mobile-first responsive breakpoints

---

## User Journey Flows

### Journey 1: Scan Brick Inventory

**Goal:** Know what bricks I have available

| Step | Action | Feedback |
|------|--------|----------|
| 1 | Tap floating camera button | Camera opens |
| 2 | Point at spread-out bricks | Frame guide |
| 3 | Capture | "Thinking..." animation |
| 4 | AI processes | "Found 127 bricks!" |
| 5 | Review/edit inventory | Edit modal |
| 6 | Save to profile | Confirmation |

**Skip Option:** Use previous inventory (for returning users)

**Error Recovery:** "Add more bricks?" prompt if scan incomplete

---

### Journey 2: Create Design

**Goal:** Get a buildable Lego idea from my imagination

| Step | Action | Feedback |
|------|--------|----------|
| 1 | Tap "Create" FAB | Create modal |
| 2 | See prompt: "What do you feel like building?" | Playful entry |
| 3 | Type description OR upload image | Input accepted |
| 4 | Submit | "Imagining... Finding... Building..." |
| 5 | AI generates | Magical reveal animation |
| 6 | Explore 3D model | Rotate/zoom |
| 7 | Inventory check | Green/Yellow status |

**Skip Option:** Browse templates (animals, vehicles, buildings)

**Error Recovery:** Free retry if design doesn't match

---

### Journey 3: Build Instructions

**Goal:** Build step-by-step without confusion

| Step | Action | Feedback |
|------|--------|----------|
| 1 | Tap "Start Building →" | Instructions view |
| 2 | See Layer 1 highlighted | 3D layer focus |
| 3 | Tap to advance | Layer 2...3...N |
| 4 | Progress shown | "Step 3/12" indicator |
| 5 | Final layer complete | Celebration! |
| 6 | Share prompt | "WE made this!" |

**Pause/Resume:** Auto-save progress, resume anytime

---

### Journey 4: Share Creation

**Goal:** Show off what we built

| Step | Action | Feedback |
|------|--------|----------|
| 1 | Build complete | Celebration screen |
| 2 | See share card | Creation name, stats |
| 3 | Share to social OR save | Options |
| 4 | Return to home | "+ Build Another" option |

---

### Journey 5: Browse Ideas (Discovery Mode)

**Goal:** Find inspiration when I don't know what to build

| Step | Action | Feedback |
|------|--------|----------|
| 1 | Open app | Home shows Creation Spotlight |
| 2 | Scroll community creations | Card-based feed |
| 3 | Tap interesting design | Detail view |
| 4 | "Build This" CTA | Inventory check |
| 5 | Match confirmed | Begin build flow |

---

### Journey 6: First-Time Onboarding

**Goal:** Special experience for new users

| Step | Action | Feedback |
|------|--------|----------|
| 1 | First open | "Welcome! Let's scan your bricks together" |
| 2 | Guided scan | Friendly tutorial |
| 3 | First inventory saved | Celebration |
| 4 | "Create your first design!" | Prompted creation |
| 5 | First build complete | "Your first creation! 🎉" special badge |

---

### Journey Patterns

| Pattern | Usage |
|---------|-------|
| **Floating Action Button** | Camera, Create — always accessible |
| **Progress Storytelling** | "Thinking... Finding... Building..." |
| **Celebration Moments** | Scan complete, design reveal, build complete |
| **Free Retry** | Design generation, inventory matching |
| **Layer Navigation** | Tap-through 3D instructions |
| **Skip Options** | Use previous, browse templates, skip share |
| **Resume States** | Partial scan, build in progress, abandoned design |

### Flow Optimization Principles

1. **Minimize steps to value** — Get users to buildable design ASAP
2. **Clear progress indicators** — Users always know where they are
3. **Forgiving flexibility** — Skip, retry, resume from anywhere
4. **Celebration at milestones** — Scan, design, build complete
5. **Never dead-end** — Always a forward path (scale down, retry, browse)

---

## Component Strategy

### Design System Components (Shadcn/ui)

| Component | Usage |
|-----------|-------|
| Button | CTAs, navigation, actions |
| Card | Design cards, creation cards |
| Dialog | Modals, confirmations |
| Input | Text prompts, search |
| Toast | Notifications, progress updates |
| Progress | Step indicators, loading bars |
| Tabs | Section navigation |
| Avatar | User profiles |
| Skeleton | Loading states |
| Dropdown Menu | Options menus |

### Custom Components

#### 3D Model Viewer
- **Purpose:** Display and interact with Lego models
- **States:** Loading (skeleton shimmer), Interactive, Layer-focused, Error
- **Implementation:** Three.js via iframe (MVP) → react-three-fiber (V2)
- **Accessibility:** Keyboard rotation, touch gestures, reduced motion
- **Pattern:** Standard component (single entity)

#### Layer Instruction View
- **Purpose:** Step-by-step build guidance  
- **States:** Active, Completed, Upcoming
- **Pattern:** Compound component
```jsx
<LayerView>
  <LayerView.Model />
  <LayerView.Progress step={3} total={12} />
  <LayerView.Navigation />
</LayerView>
```
- **Accessibility:** Tap navigation, voice-over labels

#### Floating Action Button (FAB)
- **Purpose:** Quick access to Camera/Create
- **States:** Default (2 options), Hidden (during build)
- **Context-Aware:** Adapts to current screen
- **Haptic Feedback:** Vibration on tap (mobile)
- **Accessibility:** 44px+ touch target, keyboard accessible

#### Brick Inventory Card
- **Purpose:** Show brick counts by type/color
- **Content:** Brick image, count (JetBrains Mono), color name
- **Loading:** Pulse animation
- **Accessibility:** Clear labels, sufficient contrast

#### Celebration Modal
- **Purpose:** Build complete celebration
- **Content:** Creation name, stats, share options, confetti
- **Accessibility:** Focus trap, keyboard dismissal

#### Progress Storytelling
- **Purpose:** Make AI wait feel like progress
- **Content:** "Imagining... Finding... Building..." stages
- **Loading:** Building blocks animation

### Implementation Roadmap

**Phase 1 (MVP Core):**
- 3D Model Viewer (iframe)
- Layer Instruction View
- FAB (context-aware)
- Progress Storytelling

**Phase 2 (Launch):**
- Brick Inventory Card
- Celebration Modal
- Share Card
- Haptic feedback integration

**Phase 3 (Growth):**
- Creation Spotlight Card
- React-three-fiber migration
- Advanced stats components

---

## UX Consistency Patterns

### Button Hierarchy

| Level | Style | Usage | Example |
|-------|-------|-------|--------|
| **Primary** | Yellow fill, dark text | Main CTAs | "Start Building", "Create" |
| **Secondary** | Blue outline | Alternative actions | "Edit", "Cancel", "Retry" |
| **Ghost** | Text only, no border | Tertiary actions | "Skip", "Later", "Learn More" |
| **Destructive** | Red fill | Dangerous actions | "Delete", "Remove" |

**Touch Targets:** All buttons 44px minimum height

### Feedback Patterns

| Type | Visual | Animation | Haptic |
|------|--------|-----------|--------|
| **Success** | Green toast | Slide up + checkmark | Short vibration |
| **Error** | Red toast | Shake animation | Double vibration |
| **Warning** | Yellow toast | Pulse | None |
| **Info** | Blue toast | Slide up | None |
| **Loading** | Progress storytelling | "Imagining... Finding... Building..." | None |

### Navigation Patterns

**Bottom Tab Bar:**
- 4 icons: Home, Inventory, Create, Profile
- Icon-first with labels below
- Active state: filled icon + accent underline

**Floating Action Button:**
- Positioned bottom-right
- Expands to Camera + Create options
- Hides during Build flow

**Back Navigation:**
- Swipe right gesture (iOS/Android native)
- Back arrow in header
- Keyboard: Escape key

### Empty States

| State | Content | Action |
|-------|---------|--------|
| **No Inventory** | "Let's scan your bricks!" | Camera CTA |
| **No Creations** | "Ready to build something?" | Create CTA |
| **No Community** | "Be the first to share!" | Create CTA |
| **Search No Results** | "No matches found" | Clear/retry |

### Loading States

| Component | Pattern |
|-----------|--------|
| Cards | Skeleton shimmer |
| 3D Viewer | Spinner + "Loading model..." |
| AI Processing | Progress storytelling stages |
| Page Load | Skeleton + brand animation |

---

## Responsive Design & Accessibility

### Responsive Strategy

**Approach:** Mobile-first design

| Device | Width | Layout Strategy |
|--------|-------|-----------------|
| **Mobile** | 320-767px | Single column, bottom tab bar, full-width cards |
| **Tablet** | 768-1023px | 2-column grid, larger touch targets |
| **Tablet Table Mode** | Landscape + flat | Centered 3D viewer, edge navigation |
| **Desktop** | 1024px+ | Side navigation, multi-panel layout |

### Breakpoint Implementation

| Breakpoint | Tailwind | Layout Changes |
|------------|----------|-----------------|
| Default | — | Mobile layout, bottom tabs |
| `md:` | 768px | 2-column grid, larger cards |
| `lg:` | 1024px | Side navigation, 3-panel |
| `xl:` | 1280px | Maximum content width (1200px) |

### Accessibility Strategy (WCAG AA)

**Core Requirements:**
- ✅ Color contrast: 4.5:1 for normal text
- ✅ Touch targets: 44px minimum
- ✅ Font sizes: 16px minimum body
- ✅ Reduced motion: `prefers-reduced-motion` support
- ✅ Large font option in settings (for older users)

**Keyboard Navigation:**
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals
- Arrow keys for 3D model rotation

**Screen Reader Support:**
- ARIA labels on all interactive elements
- Alt text for generated images
- Live regions for AI progress updates

### Offline & Performance

- **Offline model caching:** Service worker caches 3D models for spotty wifi
- **Image optimization:** `next/image` for automatic srcset and compression
- **Code splitting:** Lazy load non-critical components

### Testing Strategy

**Automated:**
- Lighthouse CI in build pipeline
- axe DevTools for accessibility checks

**Manual:**
- VoiceOver (iOS), TalkBack (Android)
- Keyboard-only navigation
- Real device testing (iOS Safari, Android Chrome)

---

## Workflow Completion

**UX Design Specification Status:** ✅ Complete

**Steps Completed:** 14/14

**Ready For:** Architecture, Wireframes, Visual Design, Development
