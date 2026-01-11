# Lego Builder

An AI-powered web application that generates 3D Lego-style models from text descriptions or images using Google's Gemini AI.

## Features

- **Text-to-Lego**: Describe what you want to build and the AI generates a 3D Lego model
- **Image-to-Lego**: Upload an image and the AI creates a Lego interpretation of it
- **AI Model Selection**: Choose between two Gemini models:
  - **Flash** (default): Fast generation using Gemini 2.5 Flash - optimized for speed and cost
  - **Pro**: Higher quality output using Gemini 2.5 Pro - better for complex designs
- **Interactive 3D Viewer**: Rotate, zoom, and explore your generated models
- **Structural Analysis**: AI provides feedback on model stability and buildability
- **First-Build Mode**: Simplified experience for first-time users
- **Retry System**: Regenerate models if the first result isn't quite right

## Getting Started

### Prerequisites

- Node.js 18+
- A Google AI API key (Gemini)

### Installation

1. Clone the repository and navigate to the lego-builder directory:
   ```bash
   cd lego-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Gemini API key:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a Lego Model

1. Navigate to the **Create** page
2. Choose your input mode:
   - **Text**: Type a description (e.g., "a red dragon", "a medieval castle")
   - **Image**: Upload a reference image
3. Select your AI model:
   - **Flash**: Faster, good for simple models
   - **Pro**: Slower but higher quality, better for detailed models
4. Submit and watch your model generate
5. Interact with the 3D viewer to explore your creation

### AI Model Comparison

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| Flash | ~10-20s | Good | Quick iterations, simple objects |
| Pro | ~30-60s | Higher | Complex scenes, detailed models |

## Project Structure

```
lego-builder/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes (Gemini proxy)
│   │   └── create/       # Create page
│   ├── components/       # React components
│   │   ├── create/       # Creation flow components
│   │   ├── viewer/       # 3D model viewer
│   │   └── ui/           # Shared UI components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities and AI configuration
│       └── ai/           # AI provider, prompts, types
├── public/               # Static assets
└── docs/                 # Documentation
```

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests (Vitest)
- `npm run test:e2e` - Run end-to-end tests (Playwright)

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **AI**: Vercel AI SDK + Google Gemini (2.5 Flash & Pro)
- **Styling**: Tailwind CSS
- **3D Rendering**: Three.js (via generated HTML scenes)
- **Testing**: Vitest + Playwright
- **Language**: TypeScript

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Gemini API key | Yes |

## License

MIT
