---
project_name: 'Lego builder python'
user_name: 'Juan'
date: '2026-01-07'
sections_completed: ['technology_stack', 'file_naming', 'code_organization', 'api_patterns', 'testing', 'critical_rules']
existing_patterns_found: 23
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Frontend Stack
- **Runtime:** Node.js >= 20.9.0
- **Framework:** Next.js 16.0.7 (App Router, React Server Components)
- **UI Library:** React 19.2.1 with React DOM 19.2.1
- **Language:** TypeScript 5.x with strict mode enabled
- **Styling:** Tailwind CSS 4.0 + PostCSS
- **3D Rendering:** Three.js 0.181.2 + @react-three/fiber 9.4.0 + @react-three/drei 10.7.7
- **Animation:** Framer Motion 12.23.24
- **Icons:** lucide-react 0.554.0
- **Utilities:** clsx 2.1.1, tailwind-merge 3.4.0

### Frontend Dev Dependencies
- **Code Quality:** ESLint 9 + eslint-config-next 16.0.7, GTS 6.0.2 (Google TypeScript Style)
- **Testing:** Vitest 4.0.14, @testing-library/react 16.3.0, @testing-library/jest-dom 6.9.1, jsdom 22.1.0
- **Build Tools:** @vitejs/plugin-react 5.1.1, @tailwindcss/postcss 4.0.0

### Backend Stack
- **Framework:** FastAPI 0.118.3 with uvicorn 0.38.0
- **Language:** Python (strict type hints required)
- **CAD Library:** build123d 0.10.0
- **AI/ML:** google-genai 1.52.0, google-cloud-aiplatform 1.128.0, google-adk 1.19.0
- **Search/Web:** duckduckgo-search 8.1.1, beautifulsoup4 4.14.3, requests 2.32.5
- **3D Rendering:** pyvista 0.46.4, vtk 9.3.1
- **Vector DB:** chromadb 1.3.5, sentence-transformers 5.1.2
- **Browser Automation:** playwright 1.56.0
- **Environment:** python-dotenv 1.2.1
- **LLM Orchestration:** litellm 1.80.7

### Configuration Files
- **TypeScript:** `tsconfig.json` extends GTS (Google TypeScript Style), strict mode, bundler module resolution
- **ESLint:** `eslint.config.mjs` using Next.js config (nextVitals + nextTs)
- **Path Aliases:** `@/*` maps to project root in TypeScript
- **Environment Variables:** `.env.local` for development, `NEXT_PUBLIC_*` prefix for client-exposed vars

---

## Critical Implementation Rules

### File Naming Conventions

**Frontend:**
- **Components:** `kebab-case.tsx` (e.g., `Chat.tsx`, `ModelViewer.tsx`, `chat-message.tsx`)
- **Utilities:** `kebab-case.ts` (e.g., `utils.ts`, `api.ts`)
- **Tests:** Co-located `*.test.tsx` (e.g., `Chat.test.tsx`, `ModelViewer.test.tsx`)
- **Config Files:** Use framework conventions (`next.config.ts`, `eslint.config.mjs`, `vitest.config.mts`)

**Backend:**
- **Python Modules:** `snake_case.py` (e.g., `main.py`, `config.py`, `cad_tools.py`)
- **Agent Directories:** `snake_case/` under `sub_agents/` (e.g., `control_flow/`, `designer/`, `coder/`)

**NEVER:**
- ❌ Use PascalCase for file names (except for main component files like `Chat.tsx` which are established)
- ❌ Mix conventions within the same directory

### Code Organization

**Frontend Structure:**
```
Frontend/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── api/            # Next.js API routes (for server-side logic)
├── components/
│   ├── Chat.tsx        # Main components
│   ├── ModelViewer.tsx
│   ├── chat/           # Feature-specific subcomponents
│   │   ├── ChatInput.tsx
│   │   └── ChatMessage.tsx
│   └── model-viewer/
│       └── STLModel.tsx
├── lib/                # Utilities and shared code
│   ├── api.ts          # A2A API client (CRITICAL - extend this, don't replace)
│   └── utils.ts        # Utility functions (cn for classNames)
├── __tests__/          # Integration/E2E tests only
│   ├── Chat.test.tsx   # Unit tests co-located with components
│   └── ModelViewer.test.tsx
└── public/             # Static assets
```

**Backend Structure:**
```
Backend/
├── main.py             # FastAPI app entry point
├── config.py           # Settings and configuration
├── a2a/                # A2A protocol implementation
├── sub_agents/         # Multi-agent architecture
│   ├── control_flow/   # Orchestrator agent
│   ├── designer/       # Design planning agent
│   └── coder/          # Code generation agent
├── tools/              # Reusable tools (RAG, CAD, rendering, search)
│   ├── rag_tool.py     # build123d documentation RAG
│   ├── cad_tools.py    # CAD model creation
│   └── renderer.py     # STL rendering
└── tests/              # Backend tests
```

**Critical Organization Rules:**
- ✅ **Tests:** Co-locate unit tests with source files (`Chat.tsx` + `Chat.test.tsx`)
- ✅ **API Client:** ALWAYS extend `/lib/api.ts`, NEVER create duplicate API logic
- ✅ **Components:** Group by feature under subdirectories (`/components/chat/`, `/components/model-viewer/`)
- ❌ **NEVER** place test files in `/app/` directory

### Import Patterns

**Frontend:**
```typescript
// CORRECT - Use @ path alias
import Chat from "@/components/Chat";
import { cn } from "@/lib/utils";
import { sendMessage, pollTask, TaskState } from "@/lib/api";

// INCORRECT - Relative imports from distant locations
import Chat from "../../../components/Chat";
```

**Import Order (Frontend):**
1. React and Next.js core imports
2. Third-party libraries (three.js, lucide-react, etc.)
3. Internal imports using `@/` alias
4. Relative imports (same directory)

**Backend:**
```python
# CORRECT - Standard library, then third-party, then local
import os
import logging
from fastapi import FastAPI
from google.adk.agents import LlmAgent
from tools.rag_tool import RAGTool
from .prompt import SYSTEM_PROMPT

# Always use absolute imports for tools and sub_agents
from tools.cad_tools import create_cad_model
from sub_agents.designer.agent import get_designer_agent
```

### API Client Patterns

**CRITICAL - A2A Protocol:**
- ✅ **ALWAYS** use existing `/lib/api.ts` client for backend communication
- ✅ Follow A2A task polling pattern: `sendMessage` → `pollTask` → extract artifacts
- ✅ Use provided TypeScript types (`Task`, `TaskState`, `Message`, `Part`, `FilePart`)
- ❌ **NEVER** create a separate Axios/fetch client for backend API calls

**A2A Task Flow:**
```typescript
// CORRECT - Standard A2A pattern
const task = await sendMessage(prompt);
const completedTask = await pollTask(task.id);
if (completedTask.status.state !== TaskState.COMPLETED) {
  throw new Error(`Task failed: ${completedTask.status.state}`);
}
```

**File URL Resolution:**
```typescript
// CORRECT - Use helper function
const url = getFileUrl(part.file.fileWithUri);

// Helper auto-handles relative and absolute URLs
// Relative: "/download/model.stl" -> "http://localhost:8001/download/model.stl"
// Absolute: "https://..." -> "https://..."
```

### Component Patterns

**"use client" Directive:**
```typescript
// CORRECT - Always first line for client components
"use client";

import React, { useState } from "react";
// ... rest of imports

export default function Chat() {
  // Component logic
}
```

**TypeScript Function Return Types:**
```typescript
// CORRECT - Explicit return types for all functions
export default function Chat(): React.JSX.Element {
  const handleSendMessage = async (userMessage: string): Promise<void> => {
    // ...
  };
  
  return <div>...</div>;
}

// INCORRECT - Implicit return types
export default function Chat() { // ❌ Missing return type
  const handleMessage = async (msg: string) => { // ❌ Missing Promise<void>
    // ...
  };
}
```

**Utility Function Pattern:**
```typescript
// CORRECT - Use cn() from lib/utils for conditional classNames
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  !hasMessages ? "flex-none" : "sticky bottom-0"
)} />

// INCORRECT - String concatenation
<div className={`base-classes ${condition ? "conditional" : ""}`} />
```

### Testing Patterns

**Vitest Configuration:**
- Tests run with `npm test` or `vitest`
- Co-locate unit tests with source files
- Use `@testing-library/react` for component testing
- Mock external dependencies (API calls, three.js canvas)

**Test Structure:**
```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chat from '@/components/Chat';

// Mock API module before tests
vi.mock('@/lib/api', () => ({
  sendMessage: vi.fn(),
  pollTask: vi.fn(),
  TaskState: { COMPLETED: 'TASK_STATE_COMPLETED' }
}));

describe('Component Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something specific', async () => {
    // Test logic
  });
});
```

**CRITICAL Testing Rules:**
- ✅ Mock all API calls using `vi.mock()`
- ✅ Use `waitFor` for async state updates
- ✅ Mock canvas/WebGL for Three.js tests (`vi.mock('@react-three/fiber')`)
- ❌ **NEVER** make real API calls in unit tests

### Backend Agent Patterns

**Multi-Agent Architecture:**
- **Control Flow Agent:** Orchestrates between Designer → Coder → Renderer
- **Designer Agent:** Creates CAD design strategy using web search and RAG
- **Coder Agent:** Generates build123d code using RAG tool
- Each agent has `agent.py` + `prompt.py` structure

**RAG Tool Usage:**
```python
# CORRECT - RAG tool provides build123d documentation context
from tools.rag_tool import RAGTool

rag = RAGTool()
context = await rag.query("build123d lego bricks")
# Context injected into LLM prompts
```

**CAD Output Pattern:**
```python
# CORRECT - Always generate both STL and STEP files
from tools.cad_tools import create_cad_model

stl_path, step_path = create_cad_model(code_string)
# Both paths stored in task artifacts
```

### Environment Variables

**Frontend:**
```bash
# NEXT_PUBLIC_* exposed to client
NEXT_PUBLIC_API_URL=http://localhost:8001

# Server-only variables (no NEXT_PUBLIC_ prefix)
GOOGLE_API_KEY=your-gemini-key
```

**Backend:**
```bash
OUTPUT_DIR=outputs
RAG_PERSIST_DIRECTORY=rag_db
GOOGLE_API_KEY=your-gemini-key
```

**CRITICAL:**
- ✅ **NEVER** expose API keys to client (no `NEXT_PUBLIC_` prefix for secrets)
- ✅ Use Next.js API Routes (`/app/api/`) for server-side API key usage
- ✅ Backend serves files from `/download/` static mount point

### Error Handling

**Frontend Error Pattern:**
```typescript
try {
  const task = await sendMessage(userMessage);
  const completedTask = await pollTask(task.id);
  
  if (completedTask.status.state !== TaskState.COMPLETED) {
    throw new Error(`Task failed: ${completedTask.status.state}`);
  }
  // Handle success
} catch (error) {
  const message = error instanceof Error 
    ? error.message 
    : "Failed to generate model";
  
  setMessages(prev => [
    ...prev, 
    { role: "assistant", content: `Error: ${message}`, isError: true }
  ]);
}
```

**Backend Logging:**
```python
import logging
logger = logging.getLogger(__name__)

# Startup configuration suppresses verbose libraries
logging.getLogger("tornado.access").setLevel(logging.ERROR)
logging.getLogger("google.generativeai").setLevel(logging.ERROR)
```

### Architecture-Specific Rules

**PWA Requirements (From Architecture):**
- Next.js frontend will become PWA (not yet implemented)
- Must support offline access to saved builds (IndexedDB via Dexie.js - planned)
- Camera API integration for brick scanning (planned)
- Service Worker for caching (next-pwa planned)

**State Management (Planned - Zustand):**
- When implementing state management, use Zustand v5.x as per architecture
- Store files: `useInventoryStore.ts`, `useBuildsStore.ts`, `useUIStore.ts` in `/lib/stores/`
- Persistence via zustand/middleware with IndexedDB

**Database Schema (Planned - Dexie.js):**
- Tables: `bricks`, `builds`, `templates`, `userPreferences`, `generationCache`
- Use `camelCase` for table names and fields
- Primary keys: `id` (auto-increment)
- Foreign keys: `[entity]Id` format

### Code Style Enforcement

**GTS (Google TypeScript Style):**
- Frontend extends GTS configuration in `tsconfig.json`
- Scripts: `npm run check` (lint check), `npm run fix` (auto-fix)
- Enforces strict TypeScript, consistent formatting

**ESLint:**
- Uses Next.js recommended rules (`nextVitals`, `nextTs`)
- Run: `npm run lint` or `npm run fix`

**CRITICAL:**
- ✅ Run `npm run fix` before committing
- ✅ TypeScript strict mode (no implicit any, strict null checks)
- ✅ All functions must have explicit return types

---

## Architectural Decisions Reference

_These decisions from `architecture.md` must guide all implementations:_

- **Monorepo Structure:** Frontend + Backend separation (not pnpm workspace yet - planned)
- **Data Sync:** Local-first, no cloud sync in MVP
- **API Architecture:** Extend existing `/lib/api.ts` A2A client
- **Component Pattern:** Compound Components (Shadcn/ui style)
- **Naming Conventions:** See above sections
- **Testing Framework:** Vitest + React Testing Library
- **Deployment:** Vercel (frontend planned), FastAPI (backend existing)

---

## Common Pitfalls to Avoid

1. ❌ **Creating a new API client** - Always extend `/lib/api.ts`
2. ❌ **Not using "use client" directive** - Required for all client components with hooks
3. ❌ **Implicit TypeScript types** - All functions need explicit return types
4. ❌ **Exposing secrets to client** - No `NEXT_PUBLIC_` prefix for API keys
5. ❌ **Breaking A2A protocol** - Follow `sendMessage` → `pollTask` → extract artifacts pattern
6. ❌ **Mixing file naming conventions** - Stick to kebab-case for frontend, snake_case for backend
7. ❌ **Not co-locating tests** - Unit tests go next to source files
8. ❌ **Forgetting to mock canvas** - Three.js tests require mocking `@react-three/fiber`
9. ❌ **Relative imports from distant files** - Use `@/` path alias
10. ❌ **Not running linters** - Always `npm run fix` before committing

---

## Quick Reference Checklists

### Adding a New Frontend Component
- [ ] File named in kebab-case: `my-component.tsx`
- [ ] Add "use client" if using hooks/state
- [ ] Import with `@/` path alias
- [ ] Use `cn()` for conditional classNames
- [ ] Explicit TypeScript return types
- [ ] Create co-located test file: `my-component.test.tsx`
- [ ] Mock any API/external dependencies in tests

### Adding a New Backend Agent
- [ ] Create `sub_agents/agent_name/` directory
- [ ] Add `agent.py` with agent logic
- [ ] Add `prompt.py` with system prompt
- [ ] Use RAGTool for build123d context
- [ ] Return structured results to control flow
- [ ] Add docstrings and type hints

### Making API Changes
- [ ] Update `/lib/api.ts` with new functions
- [ ] Follow existing A2A protocol patterns
- [ ] Export new TypeScript types
- [ ] Update backend A2A router
- [ ] Add error handling for new endpoints
- [ ] Update tests for new API functions

---

_Last Updated: 2026-01-07_
_Total Patterns Documented: 23_
