# Integration Architecture

## System Overview

The Forma AI Lego Builder system consists of two independently deployable parts that communicate via the **A2A (Agent-to-Agent) protocol** over HTTP/REST.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        User's Browser                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │              Frontend (Next.js)                           │ │
│  │         HTTP Client + 3D Renderer                         │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              │ HTTP/REST
                              │ A2A Protocol
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│           Backend (Python FastAPI)                              │
│         Multi-Agent CAD Generator                               │
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │   Control    │──▶│   Designer   │──▶│    Coder     │       │
│  │     Flow     │   │    Agent     │   │    Agent     │       │
│  └──────────────┘   └──────────────┘   └──────────────┘       │
│         │                  │                    │               │
│         │                  ├──────────────┐     │               │
│         │                  ▼              ▼     ▼               │
│         │            ┌──────────┐   ┌──────────────┐           │
│         │            │   RAG    │   │ CAD Executor │           │
│         │            │ (ChromaDB)   │  (build123d) │           │
│         │            └──────────┘   └──────────────┘           │
│         │                                  │                    │
│         ▼                                  ▼                    │
│  ┌──────────────┐                   ┌──────────────┐           │
│  │  Headless    │                   │ STEP/STL     │           │
│  │  Renderer    │──────────────────▶│   Output     │           │
│  └──────────────┘                   └──────────────┘           │
│                                            │                    │
└────────────────────────────────────────────┼────────────────────┘
                                             │
                                             │ /download endpoint
                                             ▼
                                      Served to Frontend
```

## Integration Points

### 1. Frontend → Backend API

**Protocol**: A2A (Agent-to-Agent)  
**Transport**: HTTP/REST with JSON  
**Direction**: Frontend initiates, Backend responds

#### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/message:send` | POST | Submit new task with user prompt |
| `/v1/tasks/{taskId}` | GET | Poll task status and retrieve results |
| `/download/{filename}` | GET | Download generated STEP/STL files |

#### Data Flow: Task Submission

**1. Frontend Sends Message**

```typescript
// Frontend: lib/api.ts
POST /v1/message:send
{
  "message": {
    "role": "ROLE_USER",
    "contextId": "uuid-v4",
    "parts": [
      { "text": "Create a 10cm cube with rounded corners" }
    ]
  }
}
```

**2. Backend Creates Task**

```python
# Backend: a2a/api.py
@router.post("/v1/message:send")
async def send_message(request: SendMessageRequest):
    task_id = str(uuid.uuid4())
    task = Task(
        id=task_id,
        context_id=request.message.context_id,
        status=TaskStatus(state=TaskState.SUBMITTED),
        history=[request.message]
    )
    # Start Control Flow Agent in background
    asyncio.create_task(control_flow_agent.execute(task_id))
    return SendMessageResponse(task=task)
```

**3. Frontend Polls for Completion**

```typescript
// Frontend: lib/api.ts
while (true) {
  const task = await fetch(`/v1/tasks/${taskId}`);
  if (task.status.state === "TASK_STATE_COMPLETED") {
    return task; // Contains artifacts with file URLs
  }
  await sleep(1000); // Poll every 1s
}
```

#### Data Flow: File Download

**1. Backend Generates Files**

```python
# Backend: tools/cad_tools.py
output_path = f"{settings.OUTPUT_DIR}/{task_id}_model.step"
part.export_step(output_path)
```

**2. Backend Includes URL in Artifacts**

```python
# Backend: a2a/task_manager.py
task.artifacts = Artifact(
    parts=[
        FilePart(
            file_with_uri=f"/download/{task_id}_model.step",
            media_type="model/step"
        )
    ]
)
```

**3. Frontend Constructs Download URL**

```typescript
// Frontend: lib/api.ts
export function getFileUrl(path: string): string {
  return `${API_BASE_URL}${path}`; // http://localhost:8001/download/...
}
```

**4. Frontend Fetches for 3D Viewer**

```typescript
// Frontend: components/model-viewer/STLModel.tsx
const response = await fetch(fileUrl);
const arrayBuffer = await response.arrayBuffer();
const geometry = stlLoader.parse(arrayBuffer);
```

### 2. Backend Internal: Agent Orchestration

**Pattern**: Sequential flow with feedback loops

```
Control Flow Agent
   │
   ├──▶ Designer Agent
   │      └──▶ RAG Tool (ChromaDB query)
   │      └──▶ Search Tool (DuckDuckGo)
   │
   ├──▶ Coder Agent
   │      └──▶ CAD Tool (build123d execution)
   │
   ├──▶ Headless Renderer
   │      └──▶ PyVista (PNG preview generation)
   │
   └──▶ Designer Agent (visual feedback)
          └──▶ Approve/Iterate
```

### 3. Backend Internal: Tools Communication

**RAG Tool**:
- Input: Query string from Designer Agent
- Output: Relevant build123d documentation chunks
- Storage: ChromaDB with local persistence

**CAD Tool**:
- Input: Python code (build123d script) from Coder Agent
- Output: STEP/STL files + execution status
- Sandbox: `security.py` validates code before execution

**Renderer**:
- Input: STEP/STL file path
- Output: PNG preview image
- Backend: PyVista with EGL (headless)

**Search Tool**:
- Input: Search query from Designer Agent
- Output: Image URLs and reference text
- Providers: DuckDuckGo, Google Custom Search (configurable)

## Communication Protocols

### A2A Protocol Details

**Specification**: https://a2a-protocol.org/latest/specification/

**Key Concepts**:
- **Task**: A unit of work with unique ID, state, and history
- **Message**: Conversation turn with role (USER/AGENT), parts (text/file)
- **TaskState**: Lifecycle enum (SUBMITTED → WORKING → COMPLETED/FAILED)
- **Artifact**: Output files from completed tasks

**State Transitions**:
```
SUBMITTED
   ↓
WORKING (Control Flow starts)
   ↓
WORKING (Designer creates spec)
   ↓
WORKING (Coder generates code)
   ↓
WORKING (Renderer creates preview)
   ↓
WORKING (Designer reviews)
   │
   ├──▶ COMPLETED (approved) → Return artifacts
   └──▶ WORKING (iterate)   → Loop back to Coder
```

### CORS Configuration

**Backend**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

**Frontend**:
- No CORS issues since Backend allows all origins
- Production deployment should restrict to specific frontend domain

## Data Contracts

### Task Object Structure

```typescript
{
  "id": "uuid-v4",
  "contextId": "uuid-v4",  // groups related tasks (conversation)
  "status": {
    "state": "TASK_STATE_COMPLETED",
    "message": {
      "role": "ROLE_AGENT",
      "parts": [
        { "text": "I've created a 10cm cube with 2mm rounded corners." }
      ]
    },
    "timestamp": "2026-01-06T22:00:00Z"
  },
  "artifacts": {
    "parts": [
      {
        "fileWithUri": "/download/task123_model.step",
        "mediaType": "model/step",
        "name": "rounded_cube.step"
      },
      {
        "fileWithUri": "/download/task123_model.stl",
        "mediaType": "model/stl",
        "name": "rounded_cube.stl"
      }
    ]
  },
  "history": [
    { /* user message */ },
    { /* agent messages... */ }
  ]
}
```

### File Formats

| Format | MIME Type | Usage |
|--------|-----------|-------|
| STEP | `model/step` | CAD software import (parametric) |
| STL | `model/stl` | 3D printing (mesh) |
| PNG | `image/png` | 2D preview of 3D model |

## Deployment Integration

### Docker Compose (Full Stack)

```yaml
services:
  backend:
    build: ./Backend
    ports:
      - "8001:8001"
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    volumes:
      - ./outputs:/app/outputs
      - ./rag_db:/app/rag_db

  frontend:
    build: ./Frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8001
    depends_on:
      - backend
```

### Environment Variable Mapping

| Part | Variable | Purpose |
|------|----------|---------|
| Backend | `GOOGLE_API_KEY` | Gemini AI authentication |
| Backend | `OUTPUT_DIR` | STEP/STL file storage |
| Backend | `RAG_PERSIST_DIRECTORY` | ChromaDB persistence |
| Frontend | `NEXT_PUBLIC_API_URL` | Backend API base URL |

## Failure Modes and Recovery

### Network Errors

- **Frontend**: Displays error message, allows retry
- **Backend**: Returns 500 with error details in response body

### Task Failures

- **Code Execution Error**: Coder agent retries with fixes (max 3 attempts)
- **Timeout**: Task marked as FAILED after 5 minutes
- **AI API Error**: Gemini rate limit → Backend returns FAILED state

### Resumability

- **Frontend**: No conversation persistence → page refresh loses state
- **Backend**: Tasks stored in-memory → server restart loses tasks

## Security Considerations

### Cross-Part Security

- **Authentication**: None implemented (open access)
- **Authorization**: None implemented
- **CORS**: Wide open (`allow_origins=["*"]`)

**Recommendations for Production**:
1. Implement API keys or JWT tokens
2. Restrict CORS to specific frontend domain
3. Add rate limiting to prevent abuse
4. Implement tenant isolation for multi-user deployments

### Code Execution Sandboxing

- **Current**: Basic validation in `tools/security.py`
- **Limitation**: Still executes in same process
- **Recommendation**: Use Docker containers or sandboxed Python environments per task
