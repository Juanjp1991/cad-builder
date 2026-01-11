"""Runner module for executing agent workflows.

This module initializes the necessary services and the ControlFlowAgent,
and provides functions to run generation and modification workflows.
"""

import asyncio
from typing import AsyncGenerator
from google.adk.sessions import InMemorySessionService
from google.adk.memory import InMemoryMemoryService
from sub_agents.control_flow.agent import ControlFlowAgent

# Initialize services
session_service = InMemorySessionService()
memory_service = InMemoryMemoryService()

# Initialize ControlFlowAgent
control_flow_agent = ControlFlowAgent(session_service, memory_service)


async def run_agent(prompt: str, session_id: str, user_id: str = "user") -> AsyncGenerator[str, None]:
    """Executes the generation workflow via ControlFlowAgent.

    Args:
        prompt (str): The input prompt for the agent.
        session_id (str): The unique session identifier.
        user_id (str): The user identifier. Defaults to "user".

    Yields:
        str: Chunks of the agent's response.
    """
    async for chunk in control_flow_agent.run(prompt, session_id, user_id):
        yield chunk


async def run_modification_agent(
    existing_code: str,
    modification_prompt: str,
    session_id: str,
    user_id: str = "user",
    inventory: list | None = None
) -> AsyncGenerator[str, None]:
    """Executes the modification workflow via ControlFlowAgent.

    Args:
        existing_code (str): The existing build123d code to modify.
        modification_prompt (str): The user's modification request.
        session_id (str): The unique session identifier.
        user_id (str): The user identifier. Defaults to "user".
        inventory (list | None): Optional list of available bricks for validation.

    Yields:
        str: Chunks of the agent's response.
    """
    async for chunk in control_flow_agent.run_modification(
        existing_code=existing_code,
        modification_prompt=modification_prompt,
        session_id=session_id,
        user_id=user_id,
        inventory=inventory
    ):
        yield chunk


async def run_agent_with_history(
    prompt: str,
    session_id: str,
    user_id: str = "user",
    version_callback=None,
    approval_callback=None
) -> AsyncGenerator[str, None]:
    """Executes the generation workflow with version history tracking.

    This function uses fast-first-display: returns the first successful model
    immediately and continues refining in the background.

    Args:
        prompt (str): The input prompt for the agent.
        session_id (str): The unique session identifier.
        user_id (str): The user identifier. Defaults to "user".
        version_callback: Callback function(prompt, version_type, code, stl_path, png_path, feedback, approved)
            called when a new version is created.
        approval_callback: Callback function(feedback, approved) called when v1 is approved
            without creating a new version.

    Yields:
        str: Chunks of the agent's response.
    """
    async for chunk in control_flow_agent.run_with_history(
        prompt=prompt,
        session_id=session_id,
        user_id=user_id,
        version_callback=version_callback,
        approval_callback=approval_callback
    ):
        yield chunk

