"""Tests for the A2A API modification endpoint.

This module tests the modification message type handling in the A2A protocol.
"""

import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi.testclient import TestClient
from a2a.api import router, process_modification_task
from a2a.models import (
    Task, TaskState, TaskStatus, Message, Role, Part, MessageType,
    ModificationData, Brick
)

# Python 3.8+ has IsolatedAsyncioTestCase for async tests
try:
    from unittest import IsolatedAsyncioTestCase
except ImportError:
    # Fallback for older Python versions
    import asyncio
    class IsolatedAsyncioTestCase(unittest.TestCase):
        def run(self, result=None):
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                super().run(result)
            finally:
                loop.close()


class TestA2AModificationAPI(unittest.TestCase):
    """Tests for the A2A modification API endpoints."""

    def setUp(self):
        """Set up test client."""
        from fastapi import FastAPI
        self.app = FastAPI()
        self.app.include_router(router)
        self.client = TestClient(self.app)

    @patch('a2a.api.task_manager')
    @patch('a2a.api.BackgroundTasks.add_task')
    def test_send_modification_message_success(self, mock_add_task, mock_task_manager):
        """Test sending a modification message successfully."""
        mock_task = Task(
            id="task_1",
            status=TaskStatus(state=TaskState.SUBMITTED),
            context_id="ctx_1"
        )
        mock_task_manager.create_task.return_value = mock_task

        response = self.client.post("/v1/message:send", json={
            "message": {
                "role": "ROLE_USER",
                "parts": [{"text": "modify request"}],
                "contextId": "ctx_1"
            },
            "messageType": "modify_lego_model",
            "modificationData": {
                "baseCode": "from build123d import *\nresult = Box(10, 10, 10)",
                "modificationPrompt": "make it taller"
            }
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["task"]["id"], "task_1")
        mock_task_manager.create_task.assert_called()
        mock_add_task.assert_called()

    def test_send_modification_message_missing_data(self):
        """Test sending modification message without modification_data."""
        response = self.client.post("/v1/message:send", json={
            "message": {
                "role": "ROLE_USER",
                "parts": [{"text": "modify request"}],
                "contextId": "ctx_1"
            },
            "messageType": "modify_lego_model"
        })

        self.assertEqual(response.status_code, 400)
        self.assertIn("modification_data is required", response.json()["detail"])

    def test_send_modification_message_missing_base_code(self):
        """Test sending modification message without base_code."""
        response = self.client.post("/v1/message:send", json={
            "message": {
                "role": "ROLE_USER",
                "parts": [{"text": "modify request"}],
                "contextId": "ctx_1"
            },
            "messageType": "modify_lego_model",
            "modificationData": {
                "baseCode": "",
                "modificationPrompt": "make it taller"
            }
        })

        self.assertEqual(response.status_code, 400)
        self.assertIn("base_code is required", response.json()["detail"])

    def test_send_modification_message_missing_prompt(self):
        """Test sending modification message without modification_prompt."""
        response = self.client.post("/v1/message:send", json={
            "message": {
                "role": "ROLE_USER",
                "parts": [{"text": "modify request"}],
                "contextId": "ctx_1"
            },
            "messageType": "modify_lego_model",
            "modificationData": {
                "baseCode": "from build123d import *\nresult = Box(10, 10, 10)",
                "modificationPrompt": ""
            }
        })

        self.assertEqual(response.status_code, 400)
        self.assertIn("modification_prompt is required", response.json()["detail"])

    @patch('a2a.api.task_manager')
    @patch('a2a.api.BackgroundTasks.add_task')
    def test_send_modification_with_inventory(self, mock_add_task, mock_task_manager):
        """Test sending modification message with inventory."""
        mock_task = Task(
            id="task_1",
            status=TaskStatus(state=TaskState.SUBMITTED),
            context_id="ctx_1"
        )
        mock_task_manager.create_task.return_value = mock_task

        response = self.client.post("/v1/message:send", json={
            "message": {
                "role": "ROLE_USER",
                "parts": [{"text": "modify request"}],
                "contextId": "ctx_1"
            },
            "messageType": "modify_lego_model",
            "modificationData": {
                "baseCode": "from build123d import *\nresult = Box(10, 10, 10)",
                "modificationPrompt": "make it taller",
                "baseModelId": 123,
                "inventory": [
                    {"size": "2x4", "color": "red", "count": 10},
                    {"size": "2x2", "color": "blue", "count": 5}
                ]
            }
        })

        self.assertEqual(response.status_code, 200)

    @patch('a2a.api.task_manager')
    @patch('a2a.api.BackgroundTasks.add_task')
    def test_send_generation_message_still_works(self, mock_add_task, mock_task_manager):
        """Test that generation messages still work with new code."""
        mock_task = Task(
            id="task_1",
            status=TaskStatus(state=TaskState.SUBMITTED),
            context_id="ctx_1"
        )
        mock_task_manager.create_task.return_value = mock_task

        response = self.client.post("/v1/message:send", json={
            "message": {
                "role": "ROLE_USER",
                "parts": [{"text": "Create a small dragon"}],
                "contextId": "ctx_1"
            },
            "messageType": "text_to_lego"
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["task"]["id"], "task_1")

    @patch('a2a.api.task_manager')
    @patch('a2a.api.BackgroundTasks.add_task')
    def test_default_message_type_is_generation(self, mock_add_task, mock_task_manager):
        """Test that default message type is text_to_lego."""
        mock_task = Task(
            id="task_1",
            status=TaskStatus(state=TaskState.SUBMITTED),
            context_id="ctx_1"
        )
        mock_task_manager.create_task.return_value = mock_task

        response = self.client.post("/v1/message:send", json={
            "message": {
                "role": "ROLE_USER",
                "parts": [{"text": "Create a cube"}],
                "contextId": "ctx_1"
            }
            # No messageType specified, should default to text_to_lego
        })

        self.assertEqual(response.status_code, 200)


class TestProcessModificationTask(IsolatedAsyncioTestCase):
    """Tests for the process_modification_task function.

    Uses IsolatedAsyncioTestCase for proper async test support.
    """

    @patch('a2a.api.run_modification_agent')
    @patch('a2a.api.task_manager')
    @patch('a2a.api._find_generated_files')
    @patch('a2a.api.task_id_var')
    async def test_process_modification_task_success(
        self, mock_task_id_var, mock_find_files, mock_task_manager, mock_run_agent
    ):
        """Test successful modification task processing."""
        # Mock task_id_var context manager
        mock_token = MagicMock()
        mock_task_id_var.set.return_value = mock_token

        # Mock run_modification_agent as an async generator
        async def mock_agent_gen(*args, **kwargs):
            yield "Modified successfully"
        mock_run_agent.return_value = mock_agent_gen()

        mock_find_files.return_value = []

        modification_data = ModificationData(
            base_code="from build123d import *\nresult = Box(10, 10, 10)",
            modification_prompt="make it taller"
        )

        await process_modification_task("task_1", modification_data, "ctx_1")

        # Verify task status was updated
        calls = mock_task_manager.update_task_status.call_args_list
        # First call should be WORKING
        self.assertEqual(calls[0][0][1], TaskState.WORKING)
        # Last call should be COMPLETED
        self.assertEqual(calls[-1][0][1], TaskState.COMPLETED)

    @patch('a2a.api.run_modification_agent')
    @patch('a2a.api.task_manager')
    @patch('a2a.api._find_generated_files')
    @patch('a2a.api.task_id_var')
    async def test_process_modification_task_failure(
        self, mock_task_id_var, mock_find_files, mock_task_manager, mock_run_agent
    ):
        """Test modification task processing when agent fails."""
        # Mock task_id_var context manager
        mock_token = MagicMock()
        mock_task_id_var.set.return_value = mock_token

        # Mock run_modification_agent to raise an exception
        async def mock_agent_gen(*args, **kwargs):
            raise Exception("Modification failed")
            yield "Should not be reached"  # pragma: no cover

        mock_run_agent.return_value = mock_agent_gen()

        modification_data = ModificationData(
            base_code="from build123d import *\nresult = Box(10, 10, 10)",
            modification_prompt="make it taller"
        )

        await process_modification_task("task_1", modification_data, "ctx_1")

        # Verify task status was set to FAILED
        calls = mock_task_manager.update_task_status.call_args_list
        self.assertEqual(calls[-1][0][1], TaskState.FAILED)


class TestModificationDataModel(unittest.TestCase):
    """Tests for the ModificationData Pydantic model."""

    def test_modification_data_creation(self):
        """Test creating ModificationData model."""
        data = ModificationData(
            base_code="from build123d import *\nresult = Box(10, 10, 10)",
            modification_prompt="make it taller"
        )
        self.assertEqual(data.modification_prompt, "make it taller")
        self.assertIsNone(data.base_model_id)
        self.assertIsNone(data.inventory)

    def test_modification_data_with_all_fields(self):
        """Test creating ModificationData with all fields."""
        inventory = [
            Brick(size="2x4", color="red", count=10),
            Brick(size="2x2", color="blue", count=5)
        ]
        data = ModificationData(
            base_model_id=123,
            base_code="from build123d import *\nresult = Box(10, 10, 10)",
            modification_prompt="make it taller",
            inventory=inventory
        )
        self.assertEqual(data.base_model_id, 123)
        self.assertEqual(len(data.inventory), 2)
        self.assertEqual(data.inventory[0].size, "2x4")


class TestBrickModel(unittest.TestCase):
    """Tests for the Brick Pydantic model."""

    def test_brick_creation(self):
        """Test creating Brick model."""
        brick = Brick(size="2x4", color="red", count=10)
        self.assertEqual(brick.size, "2x4")
        self.assertEqual(brick.color, "red")
        self.assertEqual(brick.count, 10)

    def test_brick_default_count(self):
        """Test Brick model default count."""
        brick = Brick(size="2x4", color="red")
        self.assertEqual(brick.count, 1)


class TestAgentCardCapabilities(unittest.TestCase):
    """Tests for the updated agent card capabilities."""

    def setUp(self):
        """Set up test client."""
        from fastapi import FastAPI
        self.app = FastAPI()
        self.app.include_router(router)
        self.client = TestClient(self.app)

    def test_agent_card_includes_modification(self):
        """Test that agent card includes modification capabilities."""
        response = self.client.get("/v1/extendedAgentCard")

        self.assertEqual(response.status_code, 200)
        card = response.json()

        self.assertIn("modify_lego_model", card["capabilities"]["messageTypes"])
        self.assertTrue(card["capabilities"]["supportsModification"])
        self.assertIn("modifies", card["identity"]["description"].lower())


if __name__ == '__main__':
    unittest.main()
