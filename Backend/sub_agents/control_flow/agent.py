"""Control Flow Agent module.

This module defines the ControlFlowAgent, which orchestrates the interaction
between the Designer and Coder agents to generate and modify 3D models.
"""

import re
import asyncio
from typing import AsyncGenerator, Optional, Callable, Any
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.memory import InMemoryMemoryService
from google.genai.types import Content, Part

import logging
from sub_agents.designer.agent import get_designer_agent
from sub_agents.coder.agent import get_coder_agent, CodeModifier
from tools.renderer import render_stl
from tools.cad_tools import create_cad_model

logger = logging.getLogger(__name__)


class ControlFlowAgent:
    """Orchestrates the multi-agent workflow for 3D model generation and modification.

    Attributes:
        app_name (str): The name of the application.
        session_service: Service for managing user sessions.
        memory_service: Service for managing agent memory.
        designer_agent: The initialized Designer Agent.
        coder_agent: The initialized Coder Agent.
        code_modifier: The CodeModifier instance for handling modifications.
    """

    def __init__(self, session_service: InMemorySessionService, memory_service: InMemoryMemoryService):
        """Initializes the ControlFlowAgent.

        Args:
            session_service (InMemorySessionService): Service for managing user sessions.
            memory_service (InMemoryMemoryService): Service for managing agent memory.
        """
        self.app_name = "forma-ai-service"
        self.session_service = session_service
        self.memory_service = memory_service

        # Initialize sub-agents
        self.designer_agent = get_designer_agent()
        self.coder_agent = get_coder_agent()
        self.code_modifier = CodeModifier()

    async def _ensure_session(self, session_id: str, user_id: str) -> None:
        """Ensures a session exists for the user.

        Args:
            session_id (str): The unique identifier for the session.
            user_id (str): The unique identifier for the user.
        """
        logger.info(f"ControlFlow: Ensuring session {session_id} exists for user {user_id}")
        session = await self.session_service.get_session(app_name=self.app_name, user_id=user_id, session_id=session_id)
        if not session:
            logger.info(f"ControlFlow: Session not found. Creating new session...")
            await self.session_service.create_session(app_name=self.app_name, user_id=user_id, session_id=session_id)
            logger.info("ControlFlow: Session created.")
        else:
            logger.info("ControlFlow: Session found.")

    async def _run_designer_step(self, prompt: str, user_id: str, session_id: str) -> str:
        """Runs the Designer Agent to generate a specification.

        Args:
            prompt (str): The user's initial request.
            user_id (str): The unique identifier for the user.
            session_id (str): The unique identifier for the session.

        Returns:
            str: The generated design specification as a string.
        """
        logger.info("--- Running Designer Agent ---")
        designer_runner = Runner(
            agent=self.designer_agent,
            app_name=self.app_name,
            session_service=self.session_service,
            memory_service=self.memory_service
        )
        
        designer_input = Content(parts=[Part(text=prompt)], role="user")
        designer_output = ""
        
        async for event in designer_runner.run_async(user_id=user_id, session_id=session_id, new_message=designer_input):
            if event.is_final_response() and event.content and event.content.parts:
                designer_output = event.content.parts[0].text
                logger.info(f"ControlFlow: Designer Agent Output:\n{designer_output}")
        
        return designer_output

    async def _run_coder_step(self, spec: str, user_id: str, session_id: str, result_container: dict[str, str]) -> AsyncGenerator[str, None]:
        """Runs the Coder Agent to generate code.

        Args:
            spec (str): The design specification.
            user_id (str): The unique identifier for the user.
            session_id (str): The unique identifier for the session.
            result_container (dict[str, str]): A dictionary to store the full output string.

        Yields:
            str: Chunks of the generated text output.
        """
        coder_runner = Runner(
            agent=self.coder_agent,
            app_name=self.app_name,
            session_service=self.session_service,
            memory_service=self.memory_service
        )
        
        coder_input = Content(parts=[Part(text=f"Specification:\n{spec}")], role="user")
        coder_output = ""
        
        async for event in coder_runner.run_async(user_id=user_id, session_id=session_id, new_message=coder_input):
            if event.content:
                 tool_output = self._parse_tool_output(event.content)
                 if tool_output:
                     coder_output += f"\nTool Output: {tool_output}"
            
            if event.is_final_response() and event.content and event.content.parts:
                text_parts = [p.text for p in event.content.parts if p.text]
                if text_parts:
                    chunk = "\n" + "\n".join(text_parts)
                    coder_output += chunk
                    yield "\n".join(text_parts)
        
        result_container["output"] = coder_output
        logger.info(f"ControlFlow: Coder Output Raw: {coder_output}")

    def _parse_tool_output(self, content: Content) -> str | None:
        """Parses tool output from the content."""
        for part in content.parts:
            if part.function_response:
                return part.function_response.response
        return None

    def _extract_or_generate_stl(self, coder_output: str) -> tuple[str | None, str | None]:
        """Extracts STL path from output or attempts fallback generation.

        Args:
            coder_output (str): The full text output from the Coder Agent.

        Returns:
            tuple[str | None, str | None]: A tuple containing (stl_path, error_message).
                If successful, stl_path is str and error_message is None.
                If failed, stl_path is None and error_message is str.
        """
        # Extract STL path
        stl_match = re.search(r"outputs/[\w-]+\.stl", coder_output)

        if stl_match:
            return stl_match.group(0), None

        logger.info("ControlFlow: No STL file found in output. Checking for code block...")
        # Fallback: Check if code was outputted in markdown
        code_match = re.search(r"```python(.*?)```", coder_output, re.DOTALL)
        if code_match:
            logger.info("ControlFlow: Found code block. Executing fallback generation...")
            code = code_match.group(1).strip()
            result = create_cad_model(code)
            if result["success"]:
                logger.info(f"ControlFlow: Fallback generation successful. Files: {result['files']}")
                return result['files']['stl'], None
            else:
                logger.error(f"ControlFlow: Fallback generation failed: {result['error']}")
                return None, result['error']

        return None, "No code block or STL file found."

    async def _get_designer_feedback(self, png_path: str, original_spec: str, user_id: str, session_id: str) -> str:
        """Requests feedback from the Designer Agent on the rendered image.

        Args:
            png_path (str): Path to the rendered PNG image.
            original_spec (str): The original design specification.
            user_id (str): The unique identifier for the user.
            session_id (str): The unique identifier for the session.

        Returns:
            str: The feedback text from the Designer Agent.
        """
        logger.info("--- Requesting Designer Feedback ---")
        designer_runner = Runner(
            agent=self.designer_agent,
            app_name=self.app_name,
            session_service=self.session_service,
            memory_service=self.memory_service
        )
        
        with open(png_path, "rb") as f:
            image_data = f.read()
            
        feedback_prompt = f"""Carefully inspect this 3D model render.

CHECK FOR THESE ISSUES:
1. Overlapping or duplicate geometry (shapes stacked on top of each other)
2. Parts clipping through each other incorrectly
3. Missing components from the specification
4. Incorrect proportions or scale
5. Obvious structural problems (floating parts, disconnected pieces)
6. Feature placement errors (e.g., wheels not at corners of a car, eyes not on the face, limbs attached to wrong body parts)

Original specification: {original_spec[:500]}

If the model looks correct with NO visible issues, reply with 'APPROVED' followed by a friendly message describing the model.

If there are ANY problems, describe them clearly so the coder can fix the geometry. Be specific about what shapes are overlapping or what parts are misplaced."""
        
        feedback_input = Content(parts=[
            Part(text=feedback_prompt),
            Part(inline_data={"mime_type": "image/png", "data": image_data})
        ], role="user")
        
        feedback_output = ""
        async for event in designer_runner.run_async(user_id=user_id, session_id=session_id, new_message=feedback_input):
            if event.is_final_response() and event.content and event.content.parts:
                feedback_output = event.content.parts[0].text
                logger.info(f"ControlFlow: Designer Feedback:\n{feedback_output}")
        
        return feedback_output


    async def _verify_model(self, stl_path: str, original_spec: str, user_id: str, session_id: str) -> tuple[bool, str, str | None]:
        """Renders the model and gets feedback from the Designer.

        Args:
            stl_path: Path to the STL file.
            original_spec: The original specification.
            user_id: User ID.
            session_id: Session ID.

        Returns:
            tuple: (is_approved, feedback_text, png_path)
        """
        logger.info(f"ControlFlow: Found STL at {stl_path}")
        
        # Render STL
        png_path = render_stl(stl_path)
        if not png_path:
            logger.error("ControlFlow: Failed to render STL.")
            return False, "Failed to render STL.", None
            
        logger.info(f"ControlFlow: Rendered image at {png_path}")
        
        # Ask Designer for Feedback
        feedback_output = await self._get_designer_feedback(png_path, original_spec, user_id, session_id)
        
        is_approved = "APPROVED" in feedback_output
        return is_approved, feedback_output, png_path

    async def _execute_loop_iteration(self, current_spec: str, original_spec: str, user_id: str, session_id: str) -> AsyncGenerator[str | tuple[bool, str], None]:
        """Executes one iteration of the feedback loop.

        Args:
            current_spec (str): The current specification to code.
            original_spec (str): The original specification for reference.
            user_id (str): The unique identifier for the user.
            session_id (str): The unique identifier for the session.

        Yields:
            Union[str, tuple[bool, str]]: Chunks of text output, and finally a tuple (is_approved, next_spec).
        """
        # 1. Generate Model
        # Note: We can't easily stream the coder output here if we refactor to _generate_model 
        # unless we pass the yield callback or keep the generator logic inline.
        # To preserve streaming, we'll keep the generator call here but use the helper logic for the rest.
        
        coder_result = {}
        async for chunk in self._run_coder_step(current_spec, user_id, session_id, coder_result):
            yield chunk
            
        coder_output = coder_result.get("output", "")
        stl_path, generation_error = self._extract_or_generate_stl(coder_output)
        
        if not stl_path:
            logger.error(f"ControlFlow: Generation failed. Error: {generation_error}")
            logger.info("ControlFlow: Sending error back to Coder...")
            next_spec = f"Original Specification:\n{original_spec}\n\nPrevious attempt failed with error:\n{generation_error}\n\nPlease fix the code."
            yield (False, next_spec)
            return

        # 2. Verify Model
        is_approved, feedback_output, png_path = await self._verify_model(stl_path, original_spec, user_id, session_id)
        
        if png_path:
            yield f"Generated Image: {png_path}\n"
        else:
            yield "\nFailed to render STL.\n"
            yield (False, current_spec)
            return

        if is_approved:
            logger.info("ControlFlow: Design Approved.")
            friendly_msg = feedback_output.replace("APPROVED", "").strip()
            if not friendly_msg:
                    friendly_msg = "Here is your 3D model."
            yield f"{friendly_msg}\n"
            yield (True, "")
        else:
            logger.info("ControlFlow: Design Rejected. Retrying...")
            yield f"Designer Feedback: {feedback_output}\n"
            next_spec = f"Original Specification:\n{original_spec}\n\nFeedback on previous attempt:\n{feedback_output}\n\nPlease fix the code based on this feedback."
            yield (False, next_spec)

    async def run(self, prompt: str, session_id: str, user_id: str = "user") -> AsyncGenerator[str, None]:
        """Executes the agent workflow: Designer -> Coder -> Renderer -> Designer (Feedback) -> Coder (Fix).

        Args:
            prompt (str): The user's request.
            session_id (str): The unique identifier for the session.
            user_id (str): The unique identifier for the user.

        Yields:
            str: Chunks of text output describing the process and results.
        """
        await self._ensure_session(session_id, user_id)

        # Run Designer Agent first to build the initial task / specification. 
        designer_output = await self._run_designer_step(prompt, user_id, session_id)
        yield f"Design Specification:\n{designer_output[:100]}...\n"

        # After design specification is generated, run the loops of coder -> renderer -> designer -> coder until approved or max loops reached.
        max_loops = 3
        current_spec = designer_output
        
        for loop in range(max_loops):
            logger.info(f"--- Running Coder Agent (Loop {loop+1}) ---")
            
            async for chunk in self._execute_loop_iteration(current_spec, designer_output, user_id, session_id):
                if isinstance(chunk, tuple):
                    # Final result of the iteration
                    is_approved, next_spec = chunk
                    if is_approved:
                        return
                    current_spec = next_spec
                else:
                    # Streaming output
                    yield chunk
        
        # If loop finishes without approval
        yield "I'm sorry, I was unable to generate the model correctly after multiple attempts.\n"

    async def run_with_history(
        self,
        prompt: str,
        session_id: str,
        user_id: str = "user",
        version_callback: Optional[Callable[[str, str, str, Optional[str], Optional[str], Optional[str], bool], Any]] = None,
        approval_callback: Optional[Callable[[str, bool], Any]] = None
    ) -> AsyncGenerator[str, None]:
        """Executes the agent workflow with fast-first-display and version tracking.

        This method returns immediately after the first successful STL generation,
        then continues refinement in the background, calling version_callback for each version.

        Args:
            prompt (str): The user's request.
            session_id (str): The unique identifier for the session.
            user_id (str): The unique identifier for the user.
            version_callback: Callback function(prompt, version_type, code, stl_path, png_path, feedback, approved)
                called when a new version is created.
            approval_callback: Callback function(feedback, approved) called when v1 is approved/rejected
                without creating a new version.

        Yields:
            str: Chunks of text output describing the process and results.
        """
        await self._ensure_session(session_id, user_id)

        # Run Designer Agent first to build the initial task / specification.
        designer_output = await self._run_designer_step(prompt, user_id, session_id)
        yield f"Design Specification:\n{designer_output[:100]}...\n"

        # First iteration - generate draft and return immediately if successful
        logger.info("--- Running Coder Agent (Fast First Display) ---")

        coder_result = {}
        async for chunk in self._run_coder_step(designer_output, user_id, session_id, coder_result):
            yield chunk

        coder_output = coder_result.get("output", "")
        stl_path, generation_error = self._extract_or_generate_stl(coder_output)

        if not stl_path:
            # First attempt failed, fall back to normal loop behavior
            logger.error(f"ControlFlow: First generation failed. Error: {generation_error}")
            yield f"Generation error: {generation_error}\n"

            # Continue with feedback loop
            current_spec = f"Original Specification:\n{designer_output}\n\nPrevious attempt failed with error:\n{generation_error}\n\nPlease fix the code."

            for loop in range(2):  # 2 more attempts
                logger.info(f"--- Running Coder Agent (Retry {loop+1}) ---")

                async for chunk in self._execute_loop_iteration(current_spec, designer_output, user_id, session_id):
                    if isinstance(chunk, tuple):
                        is_approved, next_spec = chunk
                        if is_approved:
                            return
                        current_spec = next_spec
                    else:
                        yield chunk

            yield "I'm sorry, I was unable to generate the model correctly after multiple attempts.\n"
            return

        # Success! Extract code for versioning
        code_match = re.search(r"```python(.*?)```", coder_output, re.DOTALL)
        code = code_match.group(1).strip() if code_match else ""

        # Render for preview
        png_path = render_stl(stl_path)
        if png_path:
            yield f"Generated Image: {png_path}\n"

        # Record v1 (draft) version
        if version_callback:
            version_callback(
                prompt,           # prompt
                "generation",     # version_type
                code,             # code
                stl_path,         # stl_path
                png_path,         # png_path
                None,             # feedback
                False             # approved (draft)
            )

        # Yield fast result - this will be returned to frontend immediately
        yield f"__FAST_DISPLAY__:{stl_path}\n"
        yield "Your model is ready! Refinement in progress...\n"

        # Background refinement - continue the feedback loop
        async def refine_in_background():
            try:
                is_approved, feedback_output, _ = await self._verify_model(
                    stl_path, designer_output, user_id, session_id
                )

                if is_approved:
                    # v1 was already good - no need to create redundant v2
                    # Just mark v1 as approved via callback
                    logger.info("ControlFlow: First draft approved by Designer. No refinement needed.")
                    if approval_callback:
                        approval_callback(feedback_output, True)
                    return

                # Generate refined version
                logger.info("ControlFlow: Refining based on Designer feedback...")
                refined_spec = f"Original Specification:\n{designer_output}\n\nFeedback on previous attempt:\n{feedback_output}\n\nPlease fix the code based on this feedback."

                refined_result = {}
                async for _ in self._run_coder_step(refined_spec, user_id, session_id, refined_result):
                    pass  # We don't stream in background

                refined_output = refined_result.get("output", "")
                refined_stl, refined_error = self._extract_or_generate_stl(refined_output)

                if refined_stl:
                    refined_code_match = re.search(r"```python(.*?)```", refined_output, re.DOTALL)
                    refined_code = refined_code_match.group(1).strip() if refined_code_match else ""
                    refined_png = render_stl(refined_stl)

                    if version_callback:
                        version_callback(
                            feedback_output[:100],  # Use feedback as prompt summary
                            "auto-refine",
                            refined_code,
                            refined_stl,
                            refined_png,
                            feedback_output,
                            True  # Mark as approved/refined
                        )
                    logger.info(f"ControlFlow: Refined version saved at {refined_stl}")
                else:
                    logger.error(f"ControlFlow: Background refinement failed: {refined_error}")

            except Exception as e:
                logger.error(f"ControlFlow: Background refinement error: {e}")

        # Start background refinement (fire and forget)
        asyncio.create_task(refine_in_background())

    async def _run_modifier_step(
        self,
        existing_code: str,
        modification_prompt: str,
        user_id: str,
        session_id: str,
        result_container: dict[str, str]
    ) -> AsyncGenerator[str, None]:
        """Runs the Modifier Agent to modify existing code.


        Args:
            existing_code (str): The existing build123d code to modify.
            modification_prompt (str): The user's modification request.
            user_id (str): The unique identifier for the user.
            session_id (str): The unique identifier for the session.
            result_container (dict[str, str]): A dictionary to store the full output string.

        Yields:
            str: Chunks of the generated text output.
        """
        logger.info("--- Running Modifier Agent ---")

        # Create the modifier agent with RAG context
        modifier_agent = self.code_modifier.create_modifier_agent(
            existing_code=existing_code,
            modification_prompt=modification_prompt
        )

        modifier_runner = Runner(
            agent=modifier_agent,
            app_name=self.app_name,
            session_service=self.session_service,
            memory_service=self.memory_service
        )

        # The modifier agent just needs to know to apply the modification
        # The instruction is already baked into the agent's system prompt
        modifier_input = Content(
            parts=[Part(text=f"Apply the modification: {modification_prompt}")],
            role="user"
        )

        modifier_output = ""

        async for event in modifier_runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=modifier_input
        ):
            if event.content:
                tool_output = self._parse_tool_output(event.content)
                if tool_output:
                    modifier_output += f"\nTool Output: {tool_output}"

            if event.is_final_response() and event.content and event.content.parts:
                text_parts = [p.text for p in event.content.parts if p.text]
                if text_parts:
                    chunk = "\n" + "\n".join(text_parts)
                    modifier_output += chunk
                    yield "\n".join(text_parts)

        result_container["output"] = modifier_output
        logger.info(f"ControlFlow: Modifier Output Raw: {modifier_output}")

    async def _execute_modification_iteration(
        self,
        existing_code: str,
        modification_prompt: str,
        user_id: str,
        session_id: str
    ) -> AsyncGenerator[str | tuple[bool, str], None]:
        """Executes one iteration of the modification workflow.

        Args:
            existing_code (str): The existing build123d code.
            modification_prompt (str): The user's modification request.
            user_id (str): The unique identifier for the user.
            session_id (str): The unique identifier for the session.

        Yields:
            Union[str, tuple[bool, str]]: Chunks of text output, and finally a tuple (success, message).
        """
        # 1. Run Modifier
        modifier_result = {}
        async for chunk in self._run_modifier_step(
            existing_code, modification_prompt, user_id, session_id, modifier_result
        ):
            yield chunk

        modifier_output = modifier_result.get("output", "")
        stl_path, generation_error = self._extract_or_generate_stl(modifier_output)

        if not stl_path:
            logger.error(f"ControlFlow: Modification failed. Error: {generation_error}")
            yield (False, f"Modification failed: {generation_error}")
            return

        # 2. Verify Modified Model
        is_approved, feedback_output, png_path = await self._verify_model(
            stl_path, f"Modified version of existing model: {modification_prompt}",
            user_id, session_id
        )

        if png_path:
            yield f"Modified Model Image: {png_path}\n"
        else:
            yield "\nFailed to render modified STL.\n"
            yield (False, "Render failed")
            return

        if is_approved:
            logger.info("ControlFlow: Modified Design Approved.")
            friendly_msg = feedback_output.replace("APPROVED", "").strip()
            if not friendly_msg:
                friendly_msg = "Here is your modified 3D model."
            yield f"{friendly_msg}\n"
            yield (True, "")
        else:
            logger.info("ControlFlow: Modified Design Needs Adjustment.")
            yield f"Designer Feedback: {feedback_output}\n"
            yield (False, feedback_output)

    async def run_modification(
        self,
        existing_code: str,
        modification_prompt: str,
        session_id: str,
        user_id: str = "user",
        inventory: list | None = None
    ) -> AsyncGenerator[str, None]:
        """Executes the modification workflow: Modifier -> Renderer -> Designer (Feedback).

        Unlike generation, modification skips the initial Designer step and goes
        directly to code modification using the existing code as base.

        Args:
            existing_code (str): The existing build123d code to modify.
            modification_prompt (str): The user's modification request (e.g., "make it taller").
            session_id (str): The unique identifier for the session.
            user_id (str): The unique identifier for the user.
            inventory (list | None): Optional list of available bricks for validation.

        Yields:
            str: Chunks of text output describing the process and results.
        """
        await self._ensure_session(session_id, user_id)

        logger.info(f"ControlFlow: Starting modification workflow for: {modification_prompt[:100]}...")
        yield f"Modifying model: {modification_prompt}\n"

        # Validate existing code before attempting modification (including inventory check)
        is_valid, errors = self.code_modifier.validate_modified_code(existing_code, inventory)
        if not is_valid:
            error_msg = f"Invalid base code. Errors: {', '.join(errors)}"
            logger.error(f"ControlFlow: {error_msg}")
            yield f"Error: {error_msg}\n"
            yield "Modification not possible. Try rephrasing or use regenerate.\n"
            return

        # Run modification loop (fewer iterations than generation since we have a base)
        max_loops = 2
        current_code = existing_code

        for loop in range(max_loops):
            logger.info(f"--- Running Modification Loop {loop+1} ---")

            async for chunk in self._execute_modification_iteration(
                current_code, modification_prompt, user_id, session_id
            ):
                if isinstance(chunk, tuple):
                    # Final result of the iteration
                    success, message = chunk
                    if success:
                        return
                    # If not successful and we have more loops, continue
                    if loop < max_loops - 1:
                        yield f"Retrying modification with feedback: {message[:100]}...\n"
                else:
                    # Streaming output
                    yield chunk

        # If loop finishes without success
        yield "Modification not possible. Try rephrasing or use regenerate.\n"
