# Architecture - Frontend (Forma AI UI)

## Executive Summary

The Frontend is a **Next.js 16 web application** that provides a chat-based interface for interacting with the Forma AI multi-agent CAD generation service. It implements real-time task polling, 3D model visualization using React Three Fiber, and conversational UX patterns inspired by Gemini's interface.

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16.0.7 | React framework (App Router) |
| **UI Library** | React | 19.2.1 | Component library |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Styling** | Tailwind CSS | 4.0 | Utility-first CSS |
| **3D Rendering** | Three.js | 0.181.2 | WebGL 3D engine |
| **3D React** | @react-three/fiber | 9.4.0 | React renderer for Three.js |
| **3D Helpers** | @react-three/drei | 10.7.7 | Three.js helpers (OrbitControls, etc.) |
| **3D Utilities** | three-stdlib | 2.29.4 | Three.js standard library |
| **Animation** | Framer Motion | 12.23.24 | Declarative animations |
| **Icons** | Lucide React | 0.554.0 | Icon components |
| **CSS Utilities** | clsx | 2.1.1 | Conditional class names |
| **CSS Utilities** | tailwind-merge | 3.4.0 | Merge Tailwind classes |
| **Testing** | Vitest | 4.0.14 | Unit testing framework |
| **E2E Testing** | Playwright | (not in package.json) | Browser automation |
| **Linting** | ESLint (next) | 9.x | Code quality |
| **Code Style** | Google TypeScript Style | 6.0.2 | Style guide enforcement |

## Architecture Pattern

**Chat-Based UI with Async Task Polling**

The application follows a **conversational interface pattern** where users submit prompts and the system polls the backend for completion:

```
User Input → Send Message (A2A API) → Poll Task Status → Display Result (Chat + 3D Viewer)
```

### Component Hierarchy

```
App (page.tsx)
├── Chat (Chat.tsx) - Main conversational interface
    ├── Hero Section - Introduction banner with capability chips
    ├── ChatMessage[] - Conversation history (user/agent bubbles)
    │   ├── ChatMessage (user role)
    │   └── ChatMessage (agent role)
    │       └── ModelViewer - 3D preview (when artifacts present)
    │           └── STLModel - Three.js scene
    ├── Quick Prompt Chips - Pre-defined example prompts
    └── ChatInput - User input field with submit button
```

## System Components

### Entry Point: `app/page.tsx`

Simple root page that renders the `<Chat />` component. No additional layout logic.

### Layout: `app/layout.tsx`

- Global fonts configuration
- Aurora background layers (multi-layer gradient backdrop)
- Metadata (title, description)
- HTML/body structure

### Core Components

#### `components/Chat.tsx` - Main Conversational Interface

**Responsibilities**:
- Manages conversation state (messages, task status)
- Handles prompt submission via A2A API
- Polls backend for task completion
- Renders chat history (user/agent messages)
- Displays quick prompt chips for examples
- Integrates `ModelViewer` for 3D artifacts

**State Management**:
- `messages`: Array of user/agent messages
- `currentTaskId`: Active task being polled
- `isLoading`: Loading indicator during generation

**Key Functions**:
- `handleSendMessage()`: Calls `sendMessage()` API, starts polling
- `pollTaskStatus()`: Interval-based polling until completion
- `renderMessage()`: Conditional rendering based on message role

#### `components/ModelViewer.tsx` - 3D Model Renderer

**Responsibilities**:
- Loads STL/STEP file URLs from task artifacts
- Renders 3D scene using `@react-three/fiber`
- Provides user controls (orbit, zoom, pan)
- Fallback to static PNG preview if 3D fails

**Implementation**:
- Uses `Canvas` from `@react-three/fiber`
- Integrates `OrbitControls` from `@react-three/drei`
- Embeds `<STLModel>` to load geometry
- Configurable camera, lighting, grid helpers

#### `components/model-viewer/STLModel.tsx` - Three.js Geometry Loader

**Responsibilities**:
- Fetches STL file from API
- Parses STL geometry into Three.js buffers
- Renders mesh with material (MeshStandardMaterial)
- Error handling for load failures

**Dependencies**:
- `STLLoader` from `three-stdlib`
- React hooks (`useEffect`, `useState`) for async loading

#### `components/chat/ChatInput.tsx` - User Input Field

**Responsibilities**:
- Text input for user prompts
- Submit button with loading state
- Enter key shortcut
- Disabled state during generation

#### `components/chat/ChatMessage.tsx` - Message Bubble Component

**Responsibilities**:
- Renders user vs. agent message styles
- Displays message content (text parts)
- Shows download CTAs for artifacts (STEP/STL links)
- Embeds `ModelViewer` for agent messages with files

### API Layer: `lib/api.ts`

**Purpose**: TypeScript client for A2A protocol

#### Type Definitions

Mirrors A2A protocol spec:
- `TaskState` enum: SUBMITTED, WORKING, COMPLETED, FAILED, etc.
- `Role` enum: USER, AGENT
- `Message`, `Part`, `FilePart`, `Task`, `TaskStatus`, `Artifact`

#### API Functions

```typescript
sendMessage(prompt: string, contextId?: string): Promise<Task>
```
- POSTs to `/v1/message:send`
- Creates `Message` with USER role
- Returns created `Task` object

```typescript
getTask(taskId: string): Promise<Task>
```
- GETs from `/v1/tasks/{taskId}`
- Retrieves current task status

```typescript
pollTask(taskId: string, intervalMs: number): Promise<Task>
```
- Long-polling helper
- Loops until terminal state (COMPLETED/FAILED)
- Configurable interval (default 1000ms)

```typescript
getFileUrl(path: string): string | undefined
```
- Constructs full URL for file downloads
- Handles relative paths from API responses

### Utilities: `lib/utils.ts`

- `cn()`: Tailwind class name merger (uses `clsx` + `tailwind-merge`)

## Visual Design

### Aurora Background

Multi-layer gradient background inspired by Gemini interface:
- Animated gradient layers
- Blur effects
- Depth perception via transparency

### Color Palette

Uses Tailwind CSS default palette with custom overrides (defined in `tailwind.config.ts` if present).

### Typography

Fonts configured in `app/layout.tsx` (likely using `next/font`).

### Animation

Framer Motion for:
- Message slide-in animations
- Button hover effects
- Loading states

## Data Flow

### Message Submission Flow

```
1. User types prompt → ChatInput
2. handleSendMessage() → lib/api.ts sendMessage()
3. POST /v1/message:send → Backend A2A API
4. Response: Task object with id, contextId, SUBMITTED state
5. Start polling: pollTask(taskId, 1000ms)
6. Loop: GET /v1/tasks/{taskId} every 1s
7. State changes: SUBMITTED → WORKING → COMPLETED
8. On COMPLETED:
   - Extract artifacts.parts (file URLs)
   - Append agent message to chat history
   - Render ModelViewer with 3D preview
```

### 3D Model Rendering Flow

```
1. ModelViewer receives fileWithUri from artifact
2. Construct full URL: getFileUrl(fileWithUri)
3. Pass URL to STLModel component
4. STLModel:
   - Fetches STL file bytes
   - Parses with STLLoader
   - Creates BufferGeometry
   - Renders Mesh in Canvas
5. User interacts with OrbitControls (rotate, zoom)
```

## Deployment Architecture

### Docker Build

Multi-stage Dockerfile:
1. **Dependencies**: `npm install` in build stage
2. **Build**: `next build` for production
3. **Runtime**: Node 20.9+ with minimal image

**Exposed Port**: 3000  
**Environment Variables**:
- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: `http://localhost:8001`)

### Production Considerations

- **Static Optimization**: Next.js automatically optimizes static pages
- **Image Optimization**: Uses Next.js Image component (if applicable)
- **Code Splitting**: Automatic per-route code splitting
- **API Proxy**: Frontend could proxy `/api/*` to backend to avoid CORS (not currently implemented)

## Development Workflow

### Local Development

```bash
cd Frontend
npm install
npm run dev  # starts Next.js dev server on :3000
```

### Testing

**Unit Tests**: Vitest
```bash
npm run test
```

**E2E Tests**: Playwright (mentioned in root README but not in package.json)
```bash
npm run test:e2e
```

### Linting

```bash
npm run lint   # ESLint with Next.js rules
npm run fix    # Auto-fix issues
```

### Type Checking

TypeScript strict mode enabled in `tsconfig.json`.

## Integration with Backend

### API Configuration

**Base URL**: `process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"`

### CORS Requirements

Backend must allow:
- `Access-Control-Allow-Origin: *` (or specific frontend origin)
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

Currently, Backend has CORS wide open (`allow_origins=["*"]`).

### File Access

Frontend fetches STL/STEP files from Backend's `/download` route:
- Backend mounts `/download` → `outputs/` directory
- Frontend constructs URLs like `http://localhost:8001/download/model_abc123.stl`

## Testing Strategy

### Unit Tests (`__tests__/`)

- `Chat.test.tsx`: Chat component rendering, message handling
- `ModelViewer.test.tsx`: 3D viewer loading, error states

### Test Setup

- **Framework**: Vitest with React Testing Library
- **DOM**: jsdom for browser environment simulation
- **Config**: `vitest.config.mts`

## Known Limitations

- **No Persistent State**: Conversation history is lost on page refresh
- **Single Session**: No multi-user or session management
- **No Error Recovery**: Failed tasks require page refresh to retry
- **3D Performance**: Large STL files may cause browser lag
- **Mobile Support**: 3D controls may not work well on mobile (OrbitControls touch support)

## Future Enhancements

- Persist conversation history (localStorage or database)
- Add authentication and user accounts
- Implement retry/cancel task functionality
- Optimize 3D rendering for large models (LOD, decimation)
- Add mobile-optimized touch controls
- Export conversation history as PDF/JSON
