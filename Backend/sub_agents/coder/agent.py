"""Coder Agent module.

This module defines the Coder Agent, which is responsible for generating
and modifying build123d code based on design specifications.
"""

import logging
import re
from typing import Optional
from google.adk.agents import LlmAgent
from tools.rag_tool import RAGTool
from tools.cad_tools import create_cad_model
from .prompt import SYSTEM_PROMPT, MODIFICATION_PROMPT

logger = logging.getLogger(__name__)

# Standard LEGO brick sizes for validation
VALID_BRICK_SIZES = {
    "1x1", "1x2", "1x3", "1x4", "1x6", "1x8",
    "2x2", "2x3", "2x4", "2x6", "2x8",
    "4x4", "4x6", "4x8"
}


def get_coder_agent(model_name: str = "gemini-3-pro-preview") -> LlmAgent:
    """Initialize and return the Coder Agent for generation mode.

    Args:
        model_name (str): The name of the LLM model to use.

    Returns:
        LlmAgent: The configured Coder Agent instance.
    """
    rag_tool = RAGTool()

    return LlmAgent(
        model=model_name,
        name="CoderAgent",
        instruction=SYSTEM_PROMPT,
        tools=[rag_tool.query, create_cad_model]
    )


def get_modifier_agent(
    existing_code: str,
    modification_prompt: str,
    rag_context: str = "",
    model_name: str = "gemini-3-pro-preview",
    rag_tool: Optional[RAGTool] = None
) -> LlmAgent:
    """Initialize and return the Coder Agent configured for modification mode.

    Args:
        existing_code (str): The existing build123d code to modify.
        modification_prompt (str): The user's modification request.
        rag_context (str): Context from RAG tool for build123d documentation.
        model_name (str): The name of the LLM model to use.
        rag_tool (Optional[RAGTool]): Optional pre-initialized RAGTool instance.

    Returns:
        LlmAgent: The configured Modifier Agent instance.
    """
    # Reuse provided RAGTool or create new one
    if rag_tool is None:
        rag_tool = RAGTool()

    # Format the modification prompt with the provided context
    formatted_instruction = MODIFICATION_PROMPT.format(
        existing_code=existing_code,
        modification_prompt=modification_prompt,
        rag_context=rag_context if rag_context else "No additional context available."
    )

    logger.info(f"Creating modifier agent for prompt: {modification_prompt[:100]}...")

    return LlmAgent(
        model=model_name,
        name="ModifierAgent",
        instruction=formatted_instruction,
        tools=[rag_tool.query, create_cad_model]
    )


class CodeModifier:
    """Handles code modification requests using the Coder Agent in modification mode.

    This class provides a high-level interface for modifying existing build123d code
    based on user requests, with validation and error handling.
    """

    def __init__(self, model_name: str = "gemini-3-pro-preview"):
        """Initialize the CodeModifier.

        Args:
            model_name (str): The name of the LLM model to use.
        """
        self.model_name = model_name
        self.rag_tool = RAGTool()

    def get_rag_context(self, modification_prompt: str) -> str:
        """Query RAG for relevant build123d documentation.

        Args:
            modification_prompt (str): The modification request to get context for.

        Returns:
            str: Relevant documentation context.
        """
        # Query RAG for modification-relevant documentation
        queries = [
            modification_prompt,
            "build123d modify geometry",
            "build123d layer manipulation"
        ]

        contexts = []
        for query in queries[:2]:  # Limit to 2 queries for performance
            context = self.rag_tool.query(query, n_results=2)
            if context and context != "No relevant documentation found.":
                contexts.append(context)

        return "\n\n---\n\n".join(contexts) if contexts else ""

    def validate_code_syntax(self, code: str) -> tuple[bool, Optional[str]]:
        """Validate that the code is syntactically correct Python.

        Args:
            code (str): The code to validate.

        Returns:
            tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        try:
            compile(code, "<string>", "exec")
            return True, None
        except SyntaxError as e:
            return False, f"Syntax error at line {e.lineno}: {e.msg}"

    def validate_build123d_imports(self, code: str) -> tuple[bool, Optional[str]]:
        """Validate that the code contains required build123d imports.

        Args:
            code (str): The code to validate.

        Returns:
            tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        if "from build123d import" not in code and "import build123d" not in code:
            return False, "Missing build123d import statement"
        return True, None

    def validate_result_variable(self, code: str) -> tuple[bool, Optional[str]]:
        """Validate that the code assigns to 'result' or 'part' variable.

        Args:
            code (str): The code to validate.

        Returns:
            tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        # Check for actual assignment pattern, not just substring
        result_pattern = r'\b(result|part)\s*='
        if not re.search(result_pattern, code):
            return False, "Code must assign final object to 'result' or 'part' variable"
        return True, None

    def validate_inventory_compatibility(
        self,
        code: str,
        inventory: Optional[list] = None
    ) -> tuple[bool, Optional[str]]:
        """Validate that code uses bricks available in inventory.

        Args:
            code (str): The code to validate.
            inventory (Optional[list]): List of available bricks with size, color, count.

        Returns:
            tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        if not inventory:
            # No inventory constraint - skip validation
            return True, None

        # Build inventory lookup: {size: {color: count}}
        available = {}
        for brick in inventory:
            size = brick.size if hasattr(brick, 'size') else brick.get('size', '')
            color = brick.color if hasattr(brick, 'color') else brick.get('color', '')
            count = brick.count if hasattr(brick, 'count') else brick.get('count', 1)
            if size not in available:
                available[size] = {}
            available[size][color] = available[size].get(color, 0) + count

        # Extract brick references from code (look for common patterns)
        # This is a heuristic - real validation would require code execution
        brick_pattern = r'["\'](\d+x\d+)["\']'
        used_sizes = set(re.findall(brick_pattern, code))

        missing_sizes = []
        for size in used_sizes:
            if size not in available:
                missing_sizes.append(size)

        if missing_sizes:
            return False, f"Brick sizes not in inventory: {', '.join(missing_sizes)}"

        return True, None

    def validate_structural_integrity(self, code: str) -> tuple[bool, Optional[str]]:
        """Validate basic structural integrity of the LEGO model code.

        This performs heuristic checks for common issues like floating elements.
        Full structural validation requires executing the code and analyzing geometry.

        Args:
            code (str): The code to validate.

        Returns:
            tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        warnings = []

        # Check for location/position without attachment to base
        # This is a heuristic - floating elements often have Location() without
        # being combined with other geometry
        if "Location(" in code:
            # Check if there's a union/compound operation
            if not any(op in code for op in ["add", "fuse", "Compound", "+", "|"]):
                warnings.append("Possible floating element: Location() used without combining geometry")

        # Check for multiple separate BuildPart contexts (might indicate disconnected parts)
        buildpart_count = len(re.findall(r'with BuildPart\(\)', code))
        if buildpart_count > 1:
            warnings.append(f"Multiple BuildPart contexts ({buildpart_count}) - ensure parts are connected")

        if warnings:
            logger.warning(f"Structural integrity warnings: {warnings}")
            # Return True but log warnings - these are heuristics, not hard failures
            return True, None

        return True, None

    def validate_modified_code(
        self,
        code: str,
        inventory: Optional[list] = None
    ) -> tuple[bool, list[str]]:
        """Run all validation checks on the modified code.

        Args:
            code (str): The code to validate.
            inventory (Optional[list]): List of available bricks for inventory validation.

        Returns:
            tuple[bool, list[str]]: (all_valid, list_of_errors)
        """
        errors = []

        # Syntax check
        is_valid, error = self.validate_code_syntax(code)
        if not is_valid:
            errors.append(error)

        # Import check
        is_valid, error = self.validate_build123d_imports(code)
        if not is_valid:
            errors.append(error)

        # Result variable check
        is_valid, error = self.validate_result_variable(code)
        if not is_valid:
            errors.append(error)

        # Inventory compatibility check
        is_valid, error = self.validate_inventory_compatibility(code, inventory)
        if not is_valid:
            errors.append(error)

        # Structural integrity check (logs warnings but doesn't fail)
        self.validate_structural_integrity(code)

        return len(errors) == 0, errors

    def create_modifier_agent(
        self,
        existing_code: str,
        modification_prompt: str
    ) -> LlmAgent:
        """Create a modifier agent with RAG context.

        Args:
            existing_code (str): The existing build123d code.
            modification_prompt (str): The modification request.

        Returns:
            LlmAgent: The configured modifier agent.
        """
        rag_context = self.get_rag_context(modification_prompt)

        # Reuse our RAGTool instance instead of creating a new one
        return get_modifier_agent(
            existing_code=existing_code,
            modification_prompt=modification_prompt,
            rag_context=rag_context,
            model_name=self.model_name,
            rag_tool=self.rag_tool
        )
