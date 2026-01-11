# Story 2.0: Backend - Implement Modification Mode in Coder Agent

Status: done

## Story

As a developer,
I want the backend Coder agent to support code modification (not just generation),
So that users can iteratively refine their models without complete regeneration.

## Acceptance Criteria

**Given** the backend Coder agent currently only generates build123d code from scratch
**When** a modification request is received via the A2A protocol
**Then** the Coder agent accepts:
  - Existing build123d code (from previous generation)
  - Modification instruction prompt (e.g., "make it taller", "add wings")
  - RAG context (build123d documentation)
  - User inventory (for buildability)
**And** the Coder agent implements a new `modify_code()` function:
```python
def modify_code(self, existing_code: str, modification_prompt: str, rag_context: str) -> str:
    # Use Gemini to apply surgical edits to existing code
    # NOT generating from scratch
    prompt = f"""You are modifying existing build123d code.
    
    Current code:
    {existing_code}
    
    Modification requested: {modification_prompt}
    
    Apply ONLY the requested modification while preserving the core design.
    Return the complete modified code.
    
    Context: {rag_context}
    """
    modified_code = gemini.generate_content(prompt)
    return modified_code
```
**And** the modification preserves:
  - Core design structure
  - Variable naming conventions
  - Brick type constraints
  - Buildability rules
**And** the Coder agent validates modified code:
  - Syntax check (valid Python + build123d)
  - Structural integrity (no floating bricks)
  - Inventory compatibility
**And** the A2A endpoint `/v1/message:send` accepts a new message type:
```typescript
{ 
  type: 'modify_lego_model',
  baseModelId: number,
  baseCode: string,
  modificationPrompt: string,
  inventory: Brick[]
}
```
**And** the modification workflow follows: Control Flow → Designer (adjust concept) → Coder (modify code) → Renderer (new STL)
**And** modification failures return clear error: "Modification not possible. Try rephrasing or use regenerate."
**And** the backend logs modification requests separately from generations for analytics
**And** unit tests verify:
  - Code modification preserves structure
  - Invalid modifications are rejected
  - Modified code builds successfully

## Tasks / Subtasks

- [x] Analyze existing Coder agent architecture (AC: Background)
  - [x] Review `/Backend/sub_agents/coder/agent.py` structure
  - [x] Review `/Backend/sub_agents/coder/prompt.py` system prompt
  - [x] Understand current `create_cad_model` tool integration
  - [x] Review RAG tool usage patterns from existing implementation
- [x] Design `modify_code()` function architecture (AC: 1)
  - [x] Define function signature with type hints
  - [x] Design prompt template for modification vs generation
  - [x] Plan code structure preservation strategy
  - [x] Identify validation checkpoints
- [x] Implement modification function in Coder agent (AC: 2-5)
  - [x] Add `CodeModifier` class and `get_modifier_agent()` function to `agent.py`
  - [x] Create modification-specific system prompt (MODIFICATION_PROMPT in prompt.py)
  - [x] Implement Gemini API call with modification context via LlmAgent
  - [x] Add code validation (syntax, structure, buildability) in CodeModifier class
  - [x] Integrate RAG context for build123d documentation
- [x] Extend A2A protocol for modification messages (AC: 6)
  - [x] Add `MessageType.MODIFY_LEGO_MODEL` enum to A2A schema
  - [x] Add `ModificationData` and `Brick` models for modification requests
  - [x] Update `/Backend/a2a/api.py` message handling to route modification requests
  - [x] Add request validation for modification-specific fields
- [x] Implement Control Flow routing for modification workflow (AC: 7)
  - [x] Update Control Flow agent with `run_modification()` method
  - [x] Route: Control Flow → Modifier Agent → Renderer → Designer (feedback)
  - [x] Skip initial Designer step for modifications (uses existing code as base)
- [x] Add error handling and logging (AC: 8-9)
  - [x] Return user-friendly error messages ("Modification not possible. Try rephrasing or use regenerate.")
  - [x] Log modification requests separately for analytics (in a2a/api.py)
  - [x] Add retry logic in Control Flow (max 2 loops for modification)
- [x] Write unit tests (AC: 10)
  - [x] Test: CodeModifier validation preserves core structure
  - [x] Test: Invalid modifications are rejected (syntax, imports, result variable)
  - [x] Test: A2A message validation for modification type
  - [x] Test: ModificationData and Brick model validation
  - [x] Test: Agent card capabilities include modification support

## Dev Notes

### Current Backend Architecture

**Multi-Agent System:**
- **Control Flow Agent:** `/Backend/sub_agents/control_flow/` - Orchestrates between agents
- **Designer Agent:** `/Backend/sub_agents/designer/` - Creates CAD design strategy using web search + RAG
- **Coder Agent:** `/Backend/sub_agents/coder/` - Generates build123d code using RAG tool (CURRENT FOCUS)
- Each agent has `agent.py` + `prompt.py` structure

**Existing Coder Agent (`/Backend/sub_agents/coder/agent.py`):**
```python
from google.adk.agents import LlmAgent
from tools.rag_tool import RAGTool
from tools.cad_tools import create_cad_model
from .prompt import SYSTEM_PROMPT

def get_coder_agent(model_name: str = "gemini-3-pro-preview") -> LlmAgent:
    rag_tool = RAGTool()
    
    return LlmAgent(
        model=model_name,
        name="CoderAgent",
        instruction=SYSTEM_PROMPT,
        tools=[rag_tool.query, create_cad_model]
    )
```

**Current Coder Agent Capabilities:**
- ✅ Generate build123d code from scratch based on design specs
- ✅ Use RAGTool to query build123d documentation for context
- ✅ Execute `create_cad_model` tool to compile code into STL/STEP files
- ❌ **MISSING:** Code modification capability (this story's objective)

**A2A Protocol Integration:**
- **Location:** `/Backend/a2a/` directory
- **Task Flow:** `POST /v1/message:send` → Task ID → `GET /v1/tasks/{taskId}` polling
- **Task States:** SUBMITTED → WORKING → COMPLETED or FAILED
- **Message Types:** Current support for generation, scanning (need to add modification)

### Architecture Compliance

**From Architecture Document:**

**Backend Technology Stack:**
- Python FastAPI 0.118.3 with uvicorn 0.38.0
- build123d 0.10.0 (CAD library)
- Google Gemini SDK (google-genai 1.52.0, google-cloud-aiplatform 1.128.0, google-adk 1.19.0)
- RAG: ChromaDB 1.3.5 with sentence-transformers 5.1.2
- Type hints required (Python strict typing)

**Code Organization (Backend):**
```
Backend/
├── main.py              # FastAPI app entry point
├── config.py            # Settings
├── a2a/                 # A2A protocol implementation
├── sub_agents/
│   ├── control_flow/    # Orchestrator agent
│   ├── designer/        # Design planning agent
│   └── coder/           # Code generation agent ← THIS STORY
│       ├── agent.py     # Coder agent logic (modify here)
│       └── prompt.py    # System prompts (add modification prompt)
├── tools/
│   ├── rag_tool.py      # build123d RAG
│   ├── cad_tools.py     # CAD model creation
│   └── renderer.py      # STL rendering
└── tests/               # Backend tests (add new tests here)
```

**Naming Conventions (Backend):**
- Files: `snake_case.py`
- Functions: `snake_case` with verbs
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Type hints: Required for all function signatures

**From Epic Requirements:**

**Story Purpose:**
- **Enables:** Story 2.7 (Iterative Model Modification) - frontend UI for modifications
- **Blocks:** Story 2.7 cannot be implemented until this is complete
- **New Backend Capability:** Not in current Forma AI, this is net-new functionality

**Technical Implementation Location:**
- `/Backend/sub_agents/coder/agent.py` - Add `modify_code()` function
- `/Backend/sub_agents/coder/prompt.py` - Add modification prompt template
- `/Backend/a2a/` - Extend message schema for modification type

### Key Technical Decisions

**Modification vs Generation Strategy:**

**Generation (Existing):**
```python
# Control Flow → Designer → Coder (generate from scratch)
# Prompt: "Create a small red dragon with 5 layers"
# Output: Complete build123d code (new)
```

**Modification (New):**
```python
# Control Flow → Designer → Coder (modify existing code)
# Input: Existing code + "make it taller"
# Output: Modified build123d code (preserves core design)
# Key Difference: Surgical edit, not full regeneration
```

**Prompt Engineering for Modification:**

**Critical Differences from Generation:**
1. **Context:** Include existing code in prompt
2. **Instruction:** "Modify existing code" vs "Generate new code"
3. **Constraints:** Preserve core structure, variable names, brick types
4. **Output:** Full modified code (not diff/patch)

**Example Modification Prompt:**
```python
MODIFICATION_PROMPT = """You are an expert build 123d code modifier for LEGO models.

EXISTING CODE:
{existing_code}

USER MODIFICATION REQUEST:
{modification_prompt}

INSTRUCTIONS:
1. Apply ONLY the requested modification
2. Preserve these elements:
   - Core design structure and shape
   - Variable naming conventions
   - Brick type constraints (2x4, 2x2, etc.)
   - Buildability rules (no floating bricks)
3. Return the COMPLETE modified code (not a diff)
4. Ensure code is valid Python + build123d syntax

BUILD123D CONTEXT:
{rag_context}

OUTPUT:
[Return only the modified Python code]
"""
```

**Validation Requirements:**

1. **Syntax Check:** Valid Python + build123d imports
2. **Structural Integrity:** Modified model has no floating elements
3. **Inventory Compatibility:** Uses available brick types
4. **Compilation Test:** Code executes without errors via `create_cad_model`

**Error Handling Strategy:**

| Error Type | User Message | Action |
|-----------|--------------|--------|
| Invalid modification | "Modification not possible. Try rephrasing or use regenerate." | Return error, suggest regenerate |
| Syntax error in modified code | "Code modification failed validation. Using original model." | Rollback to original |
| Compilation failure | "Modified model couldn't be built. Try simpler changes." | Return error, log issue |

### Implementation Approach Options

**Option 1: Extend Existing Coder Agent (Recommended)**
- Add `modify_code()` method to `agent.py`
- Reuse RAG tool and validation logic
- Minimal code duplication
- **Pro:** Single coder agent, consistent interface
- **Con:** Agent does two things (generation + modification)

**Option 2: Create Separate Modifier Agent**
- New `/Backend/sub_agents/modifier/` directory
- Separate `agent.py` + `prompt.py`
- Dedicated modification logic
- **Pro:** Clean separation of concerns
- **Con:** Code duplication, more complex routing

**Recommendation:** **Option 1** - Extend existing Coder agent with modification capability, as it reuses RAG context, validation, and keeps the multi-agent architecture simpler.

### Code Preservation Strategy

**What Must Be Preserved:**
1. **Variable names:** If code uses `base_brick`, modified code should too
2. **Core geometry:** Overall shape/silhouette
3. **Layer structure:** Number of layers (unless modification explicitly changes it)
4. **Brick types:** Don't introduce new brick sizes unless needed

**What Can Change:**
1. **Dimensions:** Height, width, depth (if requested)
2. **Features:** Add windows, doors, wings, etc.
3. **Brick count:** Increase/decrease as needed
4. **Geometry details:** Smoothness, curves, angles

**Example:**
```python
# ORIGINAL CODE
base = lego_brick(size="2x4", color="red")
layer1 = [base] * 10

# MODIFICATION: "make it taller"
# PRESERVED: lego_brick function, 2x4 size, color
# CHANGED: Layer count (10 → 15)
base = lego_brick(size="2x4", color="red")
layer1 = [base] * 15  # Increased count
```

### RAG Context Integration

**Existing RAG Tool (`/Backend/tools/rag_tool.py`):**
- ChromaDB with build123d documentation
- Provides context for valid build123d syntax
- Usage: `rag_tool.query("build123d lego bricks")`

**For Modification:**
1. Query RAG for modification-relevant docs
   - Examples: "build123d modify geometry", "build123d layer manipulation"
2. Include RAG results in modification prompt
3. Use same RAG tool as generation (no new tool needed)

### A2A Protocol Extension

**Current Message Types:**
```typescript
// Text generation
{ type: 'text_to_lego', prompt: string, inventory: Brick[] }

// Image generation
{ type: 'image_to_lego', images: File[], prompt?: string, inventory: Brick[] }
```

**New Message Type:**
```typescript
// Model modification
{
  type: 'modify_lego_model',
  baseModelId: number,           // ID of original model
  baseCode: string,              // Original build123d code
  modificationPrompt: string,    // "make it taller", "add wings"
  inventory: Brick[]             // User's available bricks
}
```

**A2A Task Flow:**
1. Frontend: `POST /v1/message:send` with `type: 'modify_lego_model'`
2. Backend: Create task, route to Control Flow agent
3. Control Flow: Detect modification type → Designer → Coder (modify mode)
4. Coder: Run `modify_code()` → Validation → Return modified code
5. Renderer: Compile modified code → STL file
6. Frontend: `GET /v1/tasks/{taskId}` → Retrieve STL URL

### Control Flow Integration

**Control Flow Agent Changes:**
- Detect `modify_lego_model` message type
- Route to Designer with "adjust concept" instruction (not full redesign)
- Pass to Coder with `mode='modification'` flag
- Same renderer step (STL generation)

**Designer Agent Changes (Minimal):**
- If modification request, adjust concept without full redesign
- Provide modification constraints to Coder
- Example: "User wants taller model → increase layer count"

### Testing Strategy

**Unit Tests (New):**

1. **Test `modify_code()` function:**
   ```python
   def test_modify_code_preserves_structure():
       original_code = "..."
       modified = modify_code(original_code, "make it taller", rag_context)
       assert "lego_brick" in modified  # Preserves function calls
       assert "2x4" in modified if "2x4" in original_code
   ```

2. **Test invalid modifications:**
   ```python
   def test_invalid_modification_rejected():
       result = modify_code(original_code, "add impossible feature", context)
       assert result.error == "Modification not possible"
   ```

3. **Test compilation:**
   ```python
   def test_modified_code_compiles():
       modified = modify_code(original_code, "make it taller", context)
       stl_path = create_cad_model(modified)
       assert os.path.exists(stl_path)
   ```

**Integration Tests:**
- End-to-end A2A workflow: Send modification message → Poll task → Verify STL output
- Test modification with inventory constraints
- Test modification error handling

**Manual Testing:**
1. Run backend: `python main.py`
2. Send modification request via Postman/curl
3. Verify modified STL file renders correctly
4. Compare original vs modified geometry

### Previous Story Learnings (Story 1.4)

**From Epic 1 (Frontend Foundation):**
- Story 1.4 implemented design system with Lego-inspired colors, typography, Shadcn/ui components
- **Build Issue:** Tailwind CSS 4 beta had compatibility issues with Next.js 16 (resolved with downgrade)
- **Pattern:** Dependencies version conflicts require testing before full implementation
- **Lesson:** Verify backend Gemini API compatibility with modification prompts (test early)

**Code Quality Patterns:**
- TypeScript strict mode enforced (frontend)
- Python type hints required (backend) - **Apply to `modify_code()` function**
- Co-located tests with source files - **Add tests in `/Backend/tests/`*
*
- Explicit return types for all functions

**Review Findings:**
- Missing components were caught by code review - **Ensure all AC items implemented**
- Build system issues separate from code quality - **Test compilation early**

### Dependencies

**Hard Dependencies (Must Complete First):**
- None - This is Story 2.0, first story in Epic 2

**Soft Dependencies (Recommended):**
- Story 1.3 completed (IndexedDB schema, A2A API client) - Provides frontend integration patterns

**Enables:**
- **Story 2.7:** Iterative Model Modification (frontend UI) - BLOCKED until this story completes

**No Changes Needed:**
- Stories 1.1, 1.2, 1.4 (Frontend foundation) - Backend-only story
- Stories 2.1-2.6 can proceed in parallel (independent features)

### Known Issues & Gotchas

**Gemini API Rate Limits:**
- Modification requests use same Gemini API as generation
- **Mitigation:** Reuse existing rate limiting in `/Backend/config.py`
- **Monitor:** Log modification requests separately for analytics

**Code Diff vs Full Code:**
- **Decision:** Return full modified code, not diffs
- **Rationale:** Simpler parsing, easier validation, consistent with generation
- **Trade-off:** Larger response size (acceptable for MVP)

**Modification Complexity:**
- "Simple" modifications (make taller) are easier than "complex" (add wings)
- **User Guidance:** Frontend should suggest simple modifications first
- **Error Handling:** Complex modifications may fail more often (need clear messaging)

**build123d Code Variability:**
- Generated code may use different patterns (loops, functions, inline)
- **Challenge:** Modification must handle various code structures
- **Solution:** Use Gemini's code understanding (LLM handles variability)

### Performance Considerations

**Modification Time:**
- **Target:** <30 seconds (faster than full generation's 60s)
- **Factors:** Prompt size (includes existing code), Gemini API latency
- **Optimization:** Cache RAG results, minimize prompt tokens

**Code Validation:**
- **Syntax check:** ~10ms (fast)
- **Compilation test:** ~5-10 seconds (run `create_cad_model`)
- **Trade-off:** Validation adds time but prevents broken models

### Analytics & Logging

**Modification Metrics to Track:**
- Modification request count (separate from generation count)
- Modification success rate
- Common modification types ("make taller" vs "add feature")
- Modification time (compare to generation time)

**Log Format:**
```python
logger.info("Modification request", extra={
    "type": "modify_lego_model",
    "base_model_id": base_model_id,
    "modification_prompt": modification_prompt[:50],  # First 50 chars
    "success": True/False,
    "duration_ms": duration
})
```

### References

**Architecture Document:**
- [Backend Stack](file:///home/juan/Desktop/DEV/Lego%20builder%20python/_bmad-output/planning-artifacts/architecture.md#L132-L133) - FastAPI, build123d versions
- [Multi-Agent Architecture](file:///home/juan/Desktop/DEV/Lego%20builder%20python/_bmad-output/planning-artifacts/architecture.md#L158-L160) - Control Flow → Designer → Coder
- [A2A Protocol](file:///home/juan/Desktop/DEV/Lego%20builder%20python/_bmad-output/planning-artifacts/architecture.md#L160-L161) - Task polling pattern

**Epic Requirements:**
- [Story 2.0 Definition](file:///home/juan/Desktop/DEV/Lego%20builder%20python/_bmad-output/planning-artifacts/epics.md#L553-L624) - Full acceptance criteria
- [Epic 2 Technical Scope](file:///home/juan/Desktop/DEV/Lego%20builder%20python/_bmad-output/planning-artifacts/epics.md#L320-L353) - AI Generation core features

**Project Context:**
- [Backend Patterns](file:///home/juan/Desktop/DEV/Lego%20builder%20python/_bmad-output/project-context.md#L269-L295) - Multi-agent architecture, RAG usage, CAD output
- [Backend Structure](file:///home/juan/Desktop/DEV/Lego%20builder%20python/_bmad-output/project-context.md#L99-L112) - File organization

**Existing Backend Code:**
- [Coder Agent](file:///home/juan/Desktop/DEV/Lego%20builder%20python/Backend/sub_agents/coder/agent.py) - Current implementation
- [Coder Prompt](file:///home/juan/Desktop/DEV/Lego%20builder%20python/Backend/sub_agents/coder/prompt.py) - System prompt
- [RAG Tool](file:///home/juan/Desktop/DEV/Lego%20builder%20python/Backend/tools/rag_tool.py) - build123d documentation
- [CAD Tools](file:///home/juan/Desktop/DEV/Lego%20builder%20python/Backend/tools/cad_tools.py) - Model compilation

**Previous Stories:**
- [Story 1.4](file:///home/juan/Desktop/DEV/Lego%20builder%20python/_bmad-output/implementation-artifacts/1-4-implement-design-system-foundation-colors-typography-components.md) - Frontend foundation, learnings on dependency versioning

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Architecture analysis completed - identified existing Coder agent pattern using LlmAgent with RAGTool and create_cad_model
- Designed modification approach: extend existing Coder agent with new modifier agent factory and CodeModifier class
- A2A protocol extended with MessageType enum, ModificationData, and Brick models
- Control Flow agent extended with run_modification() workflow that skips Designer step
- All implementation files compile without syntax errors

### Completion Notes List

1. **Modification Prompt Template**: Created `MODIFICATION_PROMPT` in `prompt.py` with explicit instructions to preserve code structure while applying surgical modifications
2. **CodeModifier Class**: Implemented comprehensive validation (syntax, imports, result variable) and RAG context retrieval for modification requests
3. **get_modifier_agent()**: Factory function that creates LlmAgent pre-configured with existing code, modification prompt, and RAG context baked into instruction
4. **A2A Protocol Extension**: Added `MessageType` enum with `MODIFY_LEGO_MODEL`, `ModificationData` model for base code + modification prompt, and `Brick` model for inventory
5. **API Endpoint Update**: Modified `/v1/message:send` to detect modification requests and route to `process_modification_task()` with separate analytics logging
6. **Control Flow Modification Workflow**: `run_modification()` method bypasses Designer step, uses 2 retry loops (vs 3 for generation), and validates base code before modification
7. **Error Handling**: User-friendly error message "Modification not possible. Try rephrasing or use regenerate." for failed modifications
8. **Unit Tests**: Created comprehensive tests for CodeModifier validation, A2A modification API, ModificationData model, and agent card capabilities

### File List

**Modified Files:**
- Backend/sub_agents/coder/agent.py - Added get_modifier_agent(), CodeModifier class with validation methods
- Backend/sub_agents/coder/prompt.py - Added MODIFICATION_PROMPT template
- Backend/a2a/models.py - Added MessageType enum, ModificationData, Brick models
- Backend/a2a/api.py - Added process_modification_task(), updated a2a_send_message() for modification routing
- Backend/sub_agents/control_flow/agent.py - Added run_modification(), _run_modifier_step(), _execute_modification_iteration() methods
- Backend/runner.py - Added run_modification_agent() function

**New Files:**
- Backend/tests/test_coder_modification.py - Unit tests for CodeModifier and modification prompt
- Backend/tests/test_a2a_modification.py - Unit tests for A2A modification API endpoint

### Change Log

- 2026-01-07: Implemented modification mode in Coder agent (Story 2.0)
- 2026-01-07: Code review fixes applied:
  - Fixed duplicate code block in control_flow/agent.py:154-167
  - Added inventory compatibility validation (validate_inventory_compatibility)
  - Added structural integrity validation (validate_structural_integrity)
  - Passed inventory through modification workflow (runner.py, control_flow/agent.py, a2a/api.py)
  - Fixed async tests to use IsolatedAsyncioTestCase
  - Improved result variable validation with proper regex pattern
  - Optimized RAGTool instantiation (reuse instance in CodeModifier)
  - Standardized logging for sensitive data (don't log full base_code)
