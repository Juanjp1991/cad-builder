# Source Tree Analysis

## Project Root Structure

```
Lego builder python/
├── Backend/              # Python multi-agent CAD generation service
├── Frontend/             # Next.js web UI
├── README.md             # Project root documentation
├── _bmad/                # BMAD workflow system (planning artifacts)
├── _bmad-output/         # Generated planning artifacts
└── docs/                 # Project documentation (this directory)
```

## Backend Structure

```
Backend/                              # Part: backend - API Service
├── main.py                           # FastAPI application entry point
├── config.py                         # Settings and configuration
├── requirements.txt                  # Python dependencies
├── Dockerfile                        # Backend container build
├── docker-compose.yml                # Service orchestration
├── runner.py                         # Task execution runner
│
├── a2a/                              # A2A Protocol Implementation
│   ├── api.py                        # FastAPI router (/v1/message:send, /v1/tasks/{id})
│   ├── models.py                     # Pydantic models (Task, Message, TaskStatus)
│   └── task_manager.py               # In-memory task state management
│
├── sub_agents/                       # Multi-Agent System
│   ├── control_flow/                 # Control Flow Agent (orchestrator)
│   │   ├── agent.py                  # Main control logic
│   │   └── prompts.py                # System prompts
│   ├── designer/                     # Designer Agent (spec creator + reviewer)
│   │   ├── agent.py                  # Designer logic
│   │   ├── prompts.py                # Designer prompts
│   │   └── tools.py                  # Tool bindings (RAG, Search)
│   └── coder/                        # Coder Agent (build123d code generator)
│       ├── agent.py                  # Coder logic
│       ├── prompts.py                # Coder prompts
│       └── tools.py                  # Tool bindings (CAD execution)
│
├── tools/                            # Shared Tools for Agents
│   ├── cad_tools.py                  # build123d code execution sandbox
│   ├── rag_tool.py                   # ChromaDB RAG system for build123d docs
│   ├── renderer.py                   # PyVista headless 3D renderer
│   ├── search_tools.py               # DuckDuckGo + Google Search integration
│   └── security.py                   # Code validation and sandboxing
│
├── tests/                            # Unit and integration tests
│   ├── test_a2a_api.py               # A2A protocol tests
│   ├── test_control_flow_agent.py    # Agent orchestration tests
│   ├── test_cad_tools.py             # CAD execution tests
│   └── test_security.py              # Security validation tests
│
├── example/                          # Example API client
│   └── client.py                     # Python reference implementation
│
├── assets/                           # Static assets (logos, screenshots)
├── licenses/                         # Third-party licenses
├── outputs/                          # Generated STEP/STL files (created at runtime)
└── rag_db/                           # ChromaDB vector database (created at runtime)
```

### Key Directories

- **`a2a/`**: Implements the Agent-to-Agent protocol spec (async task management)
- **`sub_agents/`**: Houses the three specialized AI agents (Control Flow, Designer, Coder)
- **`tools/`**: Shared utilities used by agents (CAD, RAG, rendering, search, security)
- **`tests/`**: Test suite for API, agents, and tools
- **`outputs/`**: Runtime directory for generated 3D models
- **`rag_db/`**: Persistent vector database for build123d documentation

### Entry Points

- **`main.py`**: FastAPI + Uvicorn server initialization
- **`runner.py`**: Standalone task runner (bypasses A2A API)

## Frontend Structure

```
Frontend/                             # Part: frontend - Web UI
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (fonts, aurora background)
│   └── page.tsx                      # Home page (renders <Chat />)
│
├── components/                       # React Components
│   ├── Chat.tsx                      # Main chat interface (conversation surface)
│   ├── ModelViewer.tsx               # 3D model renderer (React Three Fiber)
│   ├── chat/                         # Chat sub-components
│   │   ├── ChatInput.tsx             # User input field
│   │   └── ChatMessage.tsx           # Message bubble (user/agent)
│   └── model-viewer/                 # 3D viewer sub-components
│       └── STLModel.tsx              # STL geometry loader (Three.js)
│
├── lib/                              # Utilities and API Client
│   ├── api.ts                        # A2A protocol TypeScript client
│   └── utils.ts                      # Helper functions (cn, etc.)
│
├── __tests__/                        # Unit Tests
│   ├── Chat.test.tsx                 # Chat component tests
│   └── ModelViewer.test.tsx          # 3D viewer tests
│
├── public/                           # Static Assets
│   └── (favicon, images, etc.)
│
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.mjs                # PostCSS configuration
├── vitest.config.mts                 # Vitest test configuration
├── eslint.config.mjs                 # ESLint configuration
├── Dockerfile                        # Frontend container build
└── docker-compose.yml                # Service orchestration
```

### Key Directories

- **`app/`**: Next.js 16 App Router pages and layouts
- **`components/`**: Reusable React components (chat UI, 3D viewer)
- **`lib/`**: API client and utility functions
- **`__tests__/`**: Vitest unit tests
- **`public/`**: Static assets served at `/`

### Entry Points

- **`app/page.tsx`**: Application root (client-side rendered)
- **`app/layout.tsx`**: Global HTML structure

## Critical Folders Summary

### Backend Critical Paths

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `/` | Entry point and config | `main.py`, `config.py` |
| `/a2a` | A2A protocol | `api.py`, `task_manager.py` |
| `/sub_agents/control_flow` | Orchestrator | `agent.py` |
| `/sub_agents/designer` | Spec creation & review | `agent.py`, `tools.py` |
| `/sub_agents/coder` | Code generation | `agent.py` |
| `/tools` | Shared utilities | `cad_tools.py`, `rag_tool.py`, `renderer.py` |

### Frontend Critical Paths

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `/app` | Routing and layout | `page.tsx`, `layout.tsx` |
| `/components` | UI components | `Chat.tsx`, `ModelViewer.tsx` |
| `/lib` | API integration | `api.ts` |
| `/components/chat` | Chat sub-components | `ChatInput.tsx`, `ChatMessage.tsx` |
| `/components/model-viewer` | 3D rendering | `STLModel.tsx` |

## Multi-Part Integration

The project is structured as a **monorepo with two independent parts**:
- Both parts can be run standalone (Backend on :8001, Frontend on :3000)
- Both have their own Dockerfiles and docker-compose configurations
- Root `docker-compose.yml` orchestrates both services together (not present in current structure, but mentioned in READMEs)

**Shared Dependency**: Frontend depends on Backend API, but Backend is independent.
