## Forma AI Frontend

Forma AI is an AI agent that turns natural language into engineered 3D assets. This is the UI component of the Forma AI system, which is inspired by the Gemini interface with a multi-layer aurora backdrop, conversational card. It also features an embedded live 3D preview rail.

### Highlights

- **Centered introduction canvas** – hero badge + title proclaiming the "3D Model Generator Agent" experience, with supporting capability chips.
- **Conversational chat surface** – assistant/user bubbles, quick prompt chips, and inline download CTAs.
- **Live geometry preview** – dynamic STEP/STL links plus an embedded WebGL viewer powered by `@react-three/fiber` and `three-stdlib` (static PNG previews are optional and fall back gracefully).

### Prerequisites

- Node.js **20.9+** (Next.js 16 requires native node-webkit timers only available in Node 20).
- Running [Forma AI Agent service](https://github.com/andreyka/forma-ai-service) at `http://localhost:8001` for generate endpoints & preview assets.

### Local development

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the Forma AI Agent surface. Update prompts inside `components/Chat.tsx` to customize starter ideas.

> **API origin**: override `NEXT_PUBLIC_API_URL` (and the matching compose env var) if your backend lives elsewhere.

### Quality gates

```bash
npm run lint   # ESLint + Next.js rules
npm run build  # Production build validation
```

### Project structure

- `app/layout.tsx` – global fonts + aurora background layers.
- `app/page.tsx` – loads the client-side `Chat` experience.
- `components/Chat.tsx` – hero, conversation surface, prompt input, and result rendering.
- `components/ModelViewer.tsx` – embedded STL renderer with Drei helpers.
- `lib/api.ts` – REST helper used for `/generate` calls.

### Deployment

#### Using Docker Compose (Recommended)

This project includes a `docker-compose.yml` file that orchestrates both the frontend and the backend service.

> [!WARNING]
> The backend service image is large (~3-5GB) as it includes PyTorch, VTK, and Playwright browsers. Please ensure you have sufficient disk space and a stable internet connection.

1.  **Configure Environment**:
    Copy the example environment file and fill in your API keys (e.g., OpenAI, Gemini).
    ```bash
    cp .env.example .env
    # Edit .env with your keys
    ```

2.  **Run with Docker Compose**:
    ```bash
    docker compose up --build
    ```
    - Frontend: `http://localhost:3000`
    - Backend: `http://localhost:8000`

#### Manual Docker Build

To deploy just the frontend using Docker:

```bash
# 1. Build the image
docker build -t forma-ai-frontend .

# 2. Run the container
docker run -p 3000:3000 forma-ai-frontend
```

The app will be available at `http://localhost:3000`.
