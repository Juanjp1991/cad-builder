"""Tests for the Coder Agent modification functionality.

This module tests the CodeModifier class and related functions
for modifying existing build123d code.
"""

import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from sub_agents.coder.agent import (
    get_coder_agent,
    get_modifier_agent,
    CodeModifier
)
from sub_agents.coder.prompt import SYSTEM_PROMPT, MODIFICATION_PROMPT


class TestGetCoderAgent(unittest.TestCase):
    """Tests for the get_coder_agent function."""

    @patch('sub_agents.coder.agent.RAGTool')
    @patch('sub_agents.coder.agent.LlmAgent')
    def test_get_coder_agent_default_model(self, mock_llm_agent, mock_rag_tool):
        """Test get_coder_agent returns agent with default model."""
        mock_rag_instance = MagicMock()
        mock_rag_tool.return_value = mock_rag_instance

        agent = get_coder_agent()

        mock_llm_agent.assert_called_once()
        call_kwargs = mock_llm_agent.call_args[1]
        self.assertEqual(call_kwargs['model'], 'gemini-3-pro-preview')
        self.assertEqual(call_kwargs['name'], 'CoderAgent')
        self.assertEqual(call_kwargs['instruction'], SYSTEM_PROMPT)

    @patch('sub_agents.coder.agent.RAGTool')
    @patch('sub_agents.coder.agent.LlmAgent')
    def test_get_coder_agent_custom_model(self, mock_llm_agent, mock_rag_tool):
        """Test get_coder_agent with custom model name."""
        mock_rag_instance = MagicMock()
        mock_rag_tool.return_value = mock_rag_instance

        agent = get_coder_agent(model_name='gemini-pro')

        call_kwargs = mock_llm_agent.call_args[1]
        self.assertEqual(call_kwargs['model'], 'gemini-pro')


class TestGetModifierAgent(unittest.TestCase):
    """Tests for the get_modifier_agent function."""

    @patch('sub_agents.coder.agent.RAGTool')
    @patch('sub_agents.coder.agent.LlmAgent')
    def test_get_modifier_agent_creates_agent(self, mock_llm_agent, mock_rag_tool):
        """Test get_modifier_agent creates agent with correct configuration."""
        mock_rag_instance = MagicMock()
        mock_rag_tool.return_value = mock_rag_instance

        existing_code = "from build123d import *\nresult = Box(10, 10, 10)"
        modification_prompt = "make it taller"
        rag_context = "build123d documentation context"

        agent = get_modifier_agent(
            existing_code=existing_code,
            modification_prompt=modification_prompt,
            rag_context=rag_context
        )

        mock_llm_agent.assert_called_once()
        call_kwargs = mock_llm_agent.call_args[1]
        self.assertEqual(call_kwargs['name'], 'ModifierAgent')
        self.assertIn(existing_code, call_kwargs['instruction'])
        self.assertIn(modification_prompt, call_kwargs['instruction'])
        self.assertIn(rag_context, call_kwargs['instruction'])

    @patch('sub_agents.coder.agent.RAGTool')
    @patch('sub_agents.coder.agent.LlmAgent')
    def test_get_modifier_agent_empty_rag_context(self, mock_llm_agent, mock_rag_tool):
        """Test get_modifier_agent with empty RAG context."""
        mock_rag_instance = MagicMock()
        mock_rag_tool.return_value = mock_rag_instance

        agent = get_modifier_agent(
            existing_code="code",
            modification_prompt="modify",
            rag_context=""
        )

        call_kwargs = mock_llm_agent.call_args[1]
        self.assertIn("No additional context available", call_kwargs['instruction'])


class TestCodeModifier(unittest.TestCase):
    """Tests for the CodeModifier class."""

    def setUp(self):
        """Set up test fixtures."""
        self.valid_code = """from build123d import *

with BuildPart():
    Box(10, 10, 10)

result = BuildPart._obj
"""
        self.invalid_syntax_code = "from build123d import *\nresult = Box(10, 10, 10"
        self.missing_import_code = "result = Box(10, 10, 10)"
        self.missing_result_code = "from build123d import *\nBox(10, 10, 10)"

    @patch('sub_agents.coder.agent.RAGTool')
    def test_validate_code_syntax_valid(self, mock_rag_tool):
        """Test syntax validation with valid code."""
        modifier = CodeModifier()
        is_valid, error = modifier.validate_code_syntax(self.valid_code)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_validate_code_syntax_invalid(self, mock_rag_tool):
        """Test syntax validation with invalid code."""
        modifier = CodeModifier()
        is_valid, error = modifier.validate_code_syntax(self.invalid_syntax_code)
        self.assertFalse(is_valid)
        self.assertIn("Syntax error", error)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_validate_build123d_imports_present(self, mock_rag_tool):
        """Test import validation with build123d import present."""
        modifier = CodeModifier()
        is_valid, error = modifier.validate_build123d_imports(self.valid_code)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_validate_build123d_imports_missing(self, mock_rag_tool):
        """Test import validation with missing build123d import."""
        modifier = CodeModifier()
        is_valid, error = modifier.validate_build123d_imports(self.missing_import_code)
        self.assertFalse(is_valid)
        self.assertIn("Missing build123d import", error)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_validate_result_variable_present(self, mock_rag_tool):
        """Test result variable validation when present."""
        modifier = CodeModifier()
        is_valid, error = modifier.validate_result_variable(self.valid_code)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_validate_result_variable_missing(self, mock_rag_tool):
        """Test result variable validation when missing."""
        modifier = CodeModifier()
        is_valid, error = modifier.validate_result_variable(self.missing_result_code)
        self.assertFalse(is_valid)
        self.assertIn("result", error.lower())

    @patch('sub_agents.coder.agent.RAGTool')
    def test_validate_result_variable_with_part(self, mock_rag_tool):
        """Test result variable validation with 'part' variable."""
        modifier = CodeModifier()
        code_with_part = "from build123d import *\npart = Box(10, 10, 10)"
        is_valid, error = modifier.validate_result_variable(code_with_part)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_validate_modified_code_all_valid(self, mock_rag_tool):
        """Test full validation with all checks passing."""
        modifier = CodeModifier()
        is_valid, errors = modifier.validate_modified_code(self.valid_code)
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_validate_modified_code_multiple_errors(self, mock_rag_tool):
        """Test full validation with multiple errors."""
        modifier = CodeModifier()
        bad_code = "invalid python syntax here {"
        is_valid, errors = modifier.validate_modified_code(bad_code)
        self.assertFalse(is_valid)
        self.assertGreater(len(errors), 0)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_get_rag_context_returns_context(self, mock_rag_tool):
        """Test RAG context retrieval."""
        mock_rag_instance = MagicMock()
        mock_rag_instance.query.return_value = "build123d documentation"
        mock_rag_tool.return_value = mock_rag_instance

        modifier = CodeModifier()
        context = modifier.get_rag_context("make it taller")

        self.assertIn("build123d documentation", context)
        mock_rag_instance.query.assert_called()

    @patch('sub_agents.coder.agent.RAGTool')
    def test_get_rag_context_empty_results(self, mock_rag_tool):
        """Test RAG context retrieval with no results."""
        mock_rag_instance = MagicMock()
        mock_rag_instance.query.return_value = "No relevant documentation found."
        mock_rag_tool.return_value = mock_rag_instance

        modifier = CodeModifier()
        context = modifier.get_rag_context("impossible query")

        self.assertEqual(context, "")

    @patch('sub_agents.coder.agent.get_modifier_agent')
    @patch('sub_agents.coder.agent.RAGTool')
    def test_create_modifier_agent(self, mock_rag_tool, mock_get_modifier_agent):
        """Test create_modifier_agent method."""
        mock_rag_instance = MagicMock()
        mock_rag_instance.query.return_value = "documentation context"
        mock_rag_tool.return_value = mock_rag_instance

        mock_agent = MagicMock()
        mock_get_modifier_agent.return_value = mock_agent

        modifier = CodeModifier()
        result = modifier.create_modifier_agent(
            existing_code=self.valid_code,
            modification_prompt="make it taller"
        )

        mock_get_modifier_agent.assert_called_once()
        call_kwargs = mock_get_modifier_agent.call_args[1]
        self.assertEqual(call_kwargs['existing_code'], self.valid_code)
        self.assertEqual(call_kwargs['modification_prompt'], "make it taller")


class TestModificationPrompt(unittest.TestCase):
    """Tests for the modification prompt template."""

    def test_modification_prompt_contains_placeholders(self):
        """Test that MODIFICATION_PROMPT contains required placeholders."""
        self.assertIn("{existing_code}", MODIFICATION_PROMPT)
        self.assertIn("{modification_prompt}", MODIFICATION_PROMPT)
        self.assertIn("{rag_context}", MODIFICATION_PROMPT)

    def test_modification_prompt_contains_critical_instructions(self):
        """Test that MODIFICATION_PROMPT contains critical instructions."""
        self.assertIn("PRESERVE CORE STRUCTURE", MODIFICATION_PROMPT)
        self.assertIn("MINIMAL CHANGES", MODIFICATION_PROMPT)
        self.assertIn("create_cad_model", MODIFICATION_PROMPT)
        self.assertIn("result", MODIFICATION_PROMPT.lower())

    def test_modification_prompt_formatting(self):
        """Test that MODIFICATION_PROMPT can be formatted without errors."""
        formatted = MODIFICATION_PROMPT.format(
            existing_code="test code",
            modification_prompt="test prompt",
            rag_context="test context"
        )
        self.assertIn("test code", formatted)
        self.assertIn("test prompt", formatted)
        self.assertIn("test context", formatted)


class TestInventoryValidation(unittest.TestCase):
    """Tests for inventory compatibility validation."""

    @patch('sub_agents.coder.agent.RAGTool')
    def test_inventory_validation_no_inventory(self, mock_rag_tool):
        """Test that validation passes when no inventory is provided."""
        modifier = CodeModifier()
        code = 'from build123d import *\nbrick_size = "2x4"\nresult = Box(10, 10, 10)'
        is_valid, error = modifier.validate_inventory_compatibility(code, None)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_inventory_validation_matching_bricks(self, mock_rag_tool):
        """Test that validation passes when code uses available bricks."""
        modifier = CodeModifier()
        code = 'from build123d import *\nbrick_size = "2x4"\nresult = Box(10, 10, 10)'
        inventory = [{"size": "2x4", "color": "red", "count": 10}]
        is_valid, error = modifier.validate_inventory_compatibility(code, inventory)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_inventory_validation_missing_bricks(self, mock_rag_tool):
        """Test that validation fails when code uses unavailable bricks."""
        modifier = CodeModifier()
        code = 'from build123d import *\nbrick_size = "4x8"\nresult = Box(10, 10, 10)'
        inventory = [{"size": "2x4", "color": "red", "count": 10}]
        is_valid, error = modifier.validate_inventory_compatibility(code, inventory)
        self.assertFalse(is_valid)
        self.assertIn("4x8", error)


class TestStructuralIntegrity(unittest.TestCase):
    """Tests for structural integrity validation."""

    @patch('sub_agents.coder.agent.RAGTool')
    def test_structural_integrity_simple_code(self, mock_rag_tool):
        """Test that simple code passes structural integrity check."""
        modifier = CodeModifier()
        code = """from build123d import *
with BuildPart():
    Box(10, 10, 10)
result = BuildPart._obj
"""
        is_valid, error = modifier.validate_structural_integrity(code)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_structural_integrity_with_location(self, mock_rag_tool):
        """Test that code with Location and combining operation passes."""
        modifier = CodeModifier()
        code = """from build123d import *
with BuildPart():
    Box(10, 10, 10)
    with Location((0, 0, 10)):
        Box(5, 5, 5)
result = BuildPart._obj + Box(1, 1, 1)
"""
        is_valid, error = modifier.validate_structural_integrity(code)
        self.assertTrue(is_valid)


class TestResultVariableValidation(unittest.TestCase):
    """Tests for improved result variable validation."""

    @patch('sub_agents.coder.agent.RAGTool')
    def test_result_in_comment_fails(self, mock_rag_tool):
        """Test that 'result' in a comment doesn't pass validation."""
        modifier = CodeModifier()
        code = """from build123d import *
# This is the result of building
Box(10, 10, 10)
"""
        is_valid, error = modifier.validate_result_variable(code)
        self.assertFalse(is_valid)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_result_assignment_passes(self, mock_rag_tool):
        """Test that proper result assignment passes validation."""
        modifier = CodeModifier()
        code = """from build123d import *
result = Box(10, 10, 10)
"""
        is_valid, error = modifier.validate_result_variable(code)
        self.assertTrue(is_valid)

    @patch('sub_agents.coder.agent.RAGTool')
    def test_part_assignment_passes(self, mock_rag_tool):
        """Test that proper part assignment passes validation."""
        modifier = CodeModifier()
        code = """from build123d import *
part = Box(10, 10, 10)
"""
        is_valid, error = modifier.validate_result_variable(code)
        self.assertTrue(is_valid)


class TestCodePreservation(unittest.TestCase):
    """Tests for code structure preservation during modification."""

    @patch('sub_agents.coder.agent.RAGTool')
    def test_variable_names_preserved_in_prompt(self, mock_rag_tool):
        """Test that existing variable names are preserved in context."""
        original_code = """from build123d import *
base_brick = Box(10, 10, 10)
layer1 = [base_brick] * 5
result = layer1
"""
        mock_rag_instance = MagicMock()
        mock_rag_instance.query.return_value = "documentation"
        mock_rag_tool.return_value = mock_rag_instance

        modifier = CodeModifier()
        agent = modifier.create_modifier_agent(
            existing_code=original_code,
            modification_prompt="make it taller"
        )

        # The original code should be included in the agent's instruction
        # which means variable names like base_brick and layer1 will be visible
        # to the LLM for preservation


if __name__ == '__main__':
    unittest.main()
