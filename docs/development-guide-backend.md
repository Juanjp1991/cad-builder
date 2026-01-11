# Development Guide - Backend

## Prerequisites

- **Python**: 3.9+ (3.10 recommended)
- **Docker**: Latest version (for containerized deployment)
- **Google Cloud API Key**: For Gemini AI models
- **Disk Space**: ~5GB for Docker image with all dependencies

## Local Development Setup

### 1. Clone and Navigate

```bash
cd "Lego builder python/Backend"
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

Dependencies include:
- FastAPI + Uvicorn (web server)
- build123d (CAD library)
- Google AI SDK (Gemini)
- ChromaDB (RAG vector database)
- PyVista + VTK (3D rendering)
- Playwright (web scraping)

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```bash
GOOGLE_API_KEY=your_gemini_api_key_here
OUTPUT_DIR=outputs
RAG_PERSIST_DIRECTORY=rag_db
```

### 5. Initialize RAG Database (First Run)

The RAG system will automatically ingest build123d documentation on first startup. This takes ~2-5 minutes.

```bash
python -c "from tools.rag_tool import RAGTool; import asyncio; asyncio.run(RAGTool().ingest_docs())"
```

### 6. Run Development Server

```bash
uvicorn main:app --reload --port 8001
```

- API will be available at `http://localhost:8001`
- OpenAPI docs at `http://localhost:8001/docs`
- Swagger UI for testing endpoints

## Running with Docker

### Build Image

```bash
docker build -t forma-ai-backend .
```

**Warning**: Image size is 3-5GB due to PyTorch, VTK, and Playwright dependencies.

### Run Container

```bash
docker run -p 8001:8001 \
  -e GOOGLE_API_KEY=your_key_here \
  -v $(pwd)/outputs:/app/outputs \
  -v $(pwd)/rag_db:/app/rag_db \
  forma-ai-backend
```

### Using Docker Compose

```bash
docker compose up --build
```

## Testing

### Run All Tests

```bash
pytest tests/
```

### Run Specific Test Files

```bash
pytest tests/test_a2a_api.py -v
pytest tests/test_control_flow_agent.py -v
pytest tests/test_cad_tools.py -v
pytest tests/test_security.py -v
```

### Test Coverage

```bash
pytest --cov=. --cov-report=html tests/
```

## Common Development Tasks

### Testing the A2A API

Use the example client:

```bash
python example/client.py "Create a 10x10x10 cm cube"
```

Or use `curl`:

```bash
# Send message
curl -X POST http://localhost:8001/v1/message:send \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "role": "ROLE_USER",
      "contextId": "test-context",
      "parts": [{"text": "Create a simple sphere"}]
    }
  }'

# Get task status
curl http://localhost:8001/v1/tasks/{taskId}
```

### Clearing RAG Database

```bash
rm -rf rag_db/
# Database will be rebuilt on next startup
```

### Clearing Generated Outputs

```bash
rm -rf outputs/*.step outputs/*.stl outputs/*.png
```

### Debugging Agent Execution

Enable debug logging in `main.py`:

```python
logging.basicConfig(level=logging.DEBUG)
```

### Updating build123d Documentation

The RAG system checks for updates on startup. To force re-ingestion:

```bash
rm -rf rag_db/
python -c "from tools.rag_tool import RAGTool; import asyncio; asyncio.run(RAGTool().ingest_docs())"
```

## Project Structure for Development

Key files to modify:

- **Adding new agent**: Create in `sub_agents/{agent_name}/`
- **Adding new tool**: Create in `tools/{tool_name}.py`
- **Modifying API**: Edit `a2a/api.py` and `a2a/models.py`
- **Changing config**: Edit `config.py`

## Troubleshooting

### PyVista Rendering Errors

Ensure EGL or OSMesa is installed for headless rendering:

```bash
# Ubuntu/Debian
sudo apt-get install libegl1-mesa libgl1-mesa-glx

# Or use OSMesa
sudo apt-get install libosmesa6
```

### Playwright Installation

After pip install, initialize Playwright browsers:

```bash
playwright install
```

### ChromaDB Errors

If ChromaDB fails to start:

```bash
pip install --upgrade chromadb sqlite3
```

### Memory Issues

CAD generation can be memory-intensive. Increase Docker memory limit:

```bash
docker run --memory=4g ...
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_API_KEY` | Required | Gemini API key |
| `OUTPUT_DIR` | `outputs` | Generated file directory |
| `RAG_PERSIST_DIRECTORY` | `rag_db` | ChromaDB storage path |
| `PORT` | `8001` | API server port |

## Performance Optimization

- **Caching**: RAG database persists between runs
- **Concurrency**: Uvicorn workers can be increased for production
- **Model Selection**: Use Gemini Flash for faster responses (trade quality for speed)

## Security Notes

⚠️ **DO NOT** expose this service to the internet without:
1. Implementing authentication
2. Code execution sandboxing (Docker per-task)
3. Rate limiting
4. Input validation
5. Restricting CORS origins
