# Forma AI Lego Builder - Project Overview

## Project Summary

**Forma AI** (Lego Builder Python) is a multi-agent AI system that generates parametric 3D CAD models from natural language descriptions. The project combines a Python backend with a Next.js frontend to deliver engineering-grade 3D geometry suitable for manufacturing and 3D printing.

## Repository Structure

**Type**: Multi-part Monorepo  
**Parts**: 2 (Backend + Frontend)

### Part 1: Backend (Forma AI Service)
- **Type**: Backend API Service
- **Language**: Python 3.x
- **Framework**: FastAPI
- **Root**: `/Backend`
- **Primary Technologies**:
  - build123d 0.10.0 (CAD geometry generation)
  - Google Gemini AI (via google-genai, litellm)
  - ChromaDB 1.3.5 (RAG system)
  - PyVista/VTK (headless 3D rendering)
  - FastAPI 0.118.3 + Uvicorn

### Part 2: Frontend (Forma AI UI)
- **Type**: Web Application
- **Language**: TypeScript
- **Framework**: Next.js 16 (App Router)
- **Root**: `/Frontend`
- **Primary Technologies**:
  - React 19.2.1
  - @react-three/fiber (3D visualization)
  - Tailwind CSS 4.0
  - Vitest (testing)
  - Three.js

## Architecture Overview

The system implements a **multi-agent control flow architecture** where specialized AI agents collaborate to convert text prompts into CAD models:

```
User Request → Control Flow Agent → [Designer → Coder → Renderer] Loop → 3D Model (STEP/STL)
```

### Key Components

1. **Control Flow Agent**: Orchestrates the workflow, maintains state, manages feedback loops
2. **Designer Agent**: Creates technical specifications from user prompts, uses RAG + Google Search
3. **Coder Agent**: Translates specs into executable build123d Python scripts  
4. **Headless Renderer**: Generates 2D preview images from 3D models using PyVista (EGL/OSMesa)
5. **RAG System**: Vector database (ChromaDB) with build123d documentation for AI context
6. **Frontend UI**: Chat-based interface with real-time 3D preview powered by React Three Fiber

## Integration Points

- **Protocol**: A2A (Agent-to-Agent) asynchronous task protocol
- **API Endpoint**: `/v1/message:send` (POST), `/v1/tasks/{taskId}` (GET)
- **Communication**: HTTP REST with JSON payloads
- **File Delivery**: Static file serving from `/download` endpoint
- **Cross-Origin**: CORS enabled for frontend-backend communication

## Project Goals

- Generate manufacturing-ready CAD models from natural language
- Provide iterative self-correction through visual feedback loops
- Output parametric Python code (not just mesh files)
- Support standard formats (STEP for CAD software, STL for 3D printing)

## Key Capabilities

- ✅ Text-to-CAD generation
- ✅ Multi-agent collaboration (Designer, Coder, Renderer)
- ✅ RAG-enhanced documentation retrieval
- ✅ Google Search integration for reference images
- ✅ Headless server-side 3D rendering
- ✅ Interactive 3D preview in browser (WebGL)
- ✅ A2A protocol implementation for task management
