# Forma AI Lego Builder - Documentation Index

**Generated**: 2026-01-06  
**Project Type**: Multi-part Monorepo (Backend + Frontend)  
**Scan Level**: Deep Scan

---

## Project Overview

Forma AI is a multi-agent AI system that generates parametric 3D CAD models from natural language descriptions using Google's Gemini AI and the build123d library. The system combines a Python backend with a Next.js frontend to deliver engineering-grade geometry suitable for manufacturing.

- **Repository Type**: Multi-part with 2 parts
- **Backend**: Python/FastAPI multi-agent CAD generation service
- **Frontend**: Next.js/React/TypeScript chat interface with 3D visualization

---

## Quick Reference

### Backend (Forma AI Service)

- **Type**: Backend API
- **Tech Stack**: Python 3.x, FastAPI, build123d 0.10.0, ChromaDB, PyVista
- **Root**: `/Backend`
- **Entry Point**: `main.py`
- **Architecture**: Multi-agent control flow (Control Flow, Designer, Coder agents)

### Frontend (Forma AI UI)

- **Type**: Web Application  
- **Tech Stack**: Next.js 16, React 19, TypeScript, React Three Fiber, Tailwind CSS 4
- **Root**: `/Frontend`
- **Entry Point**: `app/page.tsx`
- **Architecture**: Chat-based UI with async task polling

---

## Generated Documentation

### Core Documentation

- **[Project Overview](./project-overview.md)** - High-level system summary and goals
- **[Architecture - Backend](./architecture-backend.md)** - Multi-agent system architecture, RAG, rendering
- **[Architecture - Frontend](./architecture-frontend.md)** - Next.js chat UI with 3D viewer
- **[Integration Architecture](./integration-architecture.md)** - A2A protocol, API contracts, data flow
- **[Source Tree Analysis](./source-tree-analysis.md)** - Annotated directory structure for both parts

### Development Guides

- **[Development Guide - Backend](./development-guide-backend.md)** - Python setup, testing, Docker, troubleshooting
- **[Development Guide - Frontend](./development-guide-frontend.md)** - Node.js setup, testing, deployment

---

## Existing Documentation

The following existing documentation files were discovered in the project:

- **[Backend README](../Backend/README.md)** - Forma AI Agent Service overview, architecture diagrams, getting started
- **[Frontend README](../Frontend/README.md)** - Frontend UI overview, deployment instructions
- **[Root README](../README.md)** - Project-level documentation (appears to be outdated Lego Builder app, not Forma AI)

---

## Getting Started

### For New Developers

1. **Read** [Project Overview](./project-overview.md) to understand the system
2. **Review** [Architecture - Backend](./architecture-backend.md) for multi-agent workflow
3. **Review** [Architecture - Frontend](./architecture-frontend.md) for UI patterns
4. **Setup** Backend following [Development Guide - Backend](./development-guide-backend.md)
5. **Setup** Frontend following [Development Guide - Frontend](./development-guide-frontend.md)
6. **Understand** integration via [Integration Architecture](./integration-architecture.md)

### For Feature Development

**Backend (API/Agents)**:
- Consult [Architecture - Backend](./architecture-backend.md) for agent patterns
- Use [Development Guide - Backend](./development-guide-backend.md) for local setup
- Reference [Source Tree Analysis](./source-tree-analysis.md) for file locations

**Frontend (UI)**:
- Consult [Architecture - Frontend](./architecture-frontend.md) for UI patterns
- Use [Development Guide - Frontend](./development-guide-frontend.md) for local setup
- Reference [Integration Architecture](./integration-architecture.md) for API usage

**Full-Stack Features**:
- Review [Integration Architecture](./integration-architecture.md) for A2A protocol
- Coordinate changes across Backend (`a2a/models.py`) and Frontend (`lib/api.ts`)

### For Brownfield PRD Creation

When planning new features using the BMM workflow system:
- **Reference**: This `index.md` file as the primary documentation source
- **Backend Context**: Point to `architecture-backend.md` for API/agent features
- **Frontend Context**: Point to `architecture-frontend.md` for UI features
- **Integration**: Reference `integration-architecture.md` for cross-part features

---

## Project Structure Summary

```
├── Backend/                  # Multi-agent CAD generation service
│   ├── sub_agents/           # Control Flow, Designer, Coder agents
│   ├── tools/                # CAD, RAG, rendering, search tools
│   ├── a2a/                  # A2A protocol implementation
│   └── tests/                # Unit and integration tests
│
├── Frontend/                 # Next.js chat UI
│   ├── app/                  # Next.js App Router
│   ├── components/           # React components (Chat, ModelViewer)
│   ├── lib/                  # API client and utilities
│   └── __tests__/            # Vitest unit tests
│
├── docs/                     # Project documentation (this directory)
├── _bmad/                    # BMAD workflow system
└── _bmad-output/             # Planning artifacts
```

---

## Key Capabilities

### Backend
- ✅ Text-to-CAD generation using build123d
- ✅ Multi-agent collaboration (Designer, Coder, Renderer)
- ✅ RAG system with ChromaDB for build123d documentation
- ✅ Google Search integration for reference images
- ✅ Headless 3D rendering with PyVista
- ✅ A2A protocol for async task management
- ✅ STEP/STL export

### Frontend
- ✅ Chat-based conversational interface
- ✅ A2A protocol client implementation
- ✅ Real-time task polling
- ✅ 3D model visualization (React Three Fiber)
- ✅ File download links (STEP/STL)
- ✅ Responsive UI with Tailwind CSS

### Integration
- ✅ HTTP/REST communication via A2A protocol
- ✅ CORS enabled for cross-origin requests
- ✅ File serving for generated models
- ✅ Docker Compose orchestration

---

## Development Commands

### Backend
```bash
cd Backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
pytest tests/
```

### Frontend
```bash
cd Frontend
npm install
npm run dev  # starts on :3000
npm run test
npm run build
```

### Full Stack (Docker)
```bash
docker compose up --build
```

---

## API Endpoints

### Backend REST API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/message:send` | POST | Submit task with user prompt |
| `/v1/tasks/{taskId}` | GET | Get task status and results |
| `/download/{filename}` | GET | Download STEP/STL files |
| `/docs` | GET | OpenAPI documentation |

---

## Environment Variables

### Backend
- `GOOGLE_API_KEY` - Gemini AI API key (required)
- `OUTPUT_DIR` - Output directory (default: `outputs/`)
- `RAG_PERSIST_DIRECTORY` - ChromaDB storage (default: `rag_db/`)

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:8001`)

---

## Technology Stack Summary

### Backend
- Python 3.x
- FastAPI 0.118.3
- build123d 0.10.0 (CAD library)
- Google Gemini (via google-genai, litellm)
- ChromaDB 1.3.5 (vector database)
- PyVista 0.46.4 + VTK 9.3.1 (rendering)
- Playwright 1.56.0 (web scraping)

### Frontend
- Next.js 16.0.7 (App Router)
- React 19.2.1
- TypeScript 5.x
- React Three Fiber 9.4.0 (3D)
- Tailwind CSS 4.0
- Vitest 4.0.14 (testing)

---

## Security Considerations

⚠️ **Important**: This is a proof-of-concept system with known limitations:
- No authentication or authorization
- CORS allows all origins
- Code execution in same process (not fully sandboxed)
- In-memory task storage (not persistent)

**Do not expose to untrusted users without implementing proper security measures.**

---

## Next Steps

- Run workflows from `_bmad/` directory for structured development
- Use `workflow-status` workflow to check current project phase
- Create brownfield PRDs referencing this documentation
- Implement new features following architecture patterns documented here

---

**Documentation Scan Completed**: 2026-01-06  
**Workflow Version**: 1.2.0  
**Scan Mode**: Deep Scan
