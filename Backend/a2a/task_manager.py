"""Task management for the A2A protocol.

This module provides the TaskManager class to create, retrieve,
and update tasks in memory. Also manages version history for models.
"""

from typing import Dict, Optional
import uuid
from datetime import datetime
from .models import Task, TaskStatus, TaskState, Message
from .version_history import ModelVersion, ModelHistory


class TaskManager:
    def __init__(self):
        self._tasks: Dict[str, Task] = {}
        self._histories: Dict[str, ModelHistory] = {}

    def create_task(self, context_id: Optional[str] = None) -> Task:
        """Create a new task.

        Args:
            context_id (Optional[str]): The context ID. If None, a new one is generated.

        Returns:
            Task: The created task object.
        """
        task_id = str(uuid.uuid4())
        if not context_id:
            context_id = str(uuid.uuid4())
            
        task = Task(
            id=task_id,
            context_id=context_id,
            status=TaskStatus(
                state=TaskState.SUBMITTED,
                timestamp=datetime.utcnow()
            )
        )
        self._tasks[task_id] = task
        return task

    def get_task(self, task_id: str) -> Optional[Task]:
        """Retrieve a task by its ID.

        Args:
            task_id (str): The task identifier.

        Returns:
            Optional[Task]: The task object if found, else None.
        """
        return self._tasks.get(task_id)

    def update_task_status(self, task_id: str, state: TaskState, message: Optional[Message] = None) -> None:
        """Update the status of a task.

        Args:
            task_id (str): The task identifier.
            state (TaskState): The new state of the task.
            message (Optional[Message]): An optional message to append to history.
        """
        task = self.get_task(task_id)
        if task:
            task.status.state = state
            task.status.timestamp = datetime.utcnow()
            if message:
                task.status.message = message
                task.history.append(message)

    # Version History Methods

    def create_history(self, task_id: str, original_prompt: str, name: Optional[str] = None) -> ModelHistory:
        """Create a new version history for a task.

        Args:
            task_id (str): The task identifier.
            original_prompt (str): The original generation prompt.
            name (Optional[str]): User-friendly name for the project.

        Returns:
            ModelHistory: The created history object.
        """
        history = ModelHistory(
            project_id=task_id,
            name=name,
            original_prompt=original_prompt
        )
        self._histories[task_id] = history
        return history

    def get_history(self, task_id: str) -> Optional[ModelHistory]:
        """Retrieve version history for a task.

        Args:
            task_id (str): The task identifier.

        Returns:
            Optional[ModelHistory]: The history object if found, else None.
        """
        return self._histories.get(task_id)

    def add_version(
        self,
        task_id: str,
        prompt: str,
        version_type: str,
        code: str = "",
        stl_path: Optional[str] = None,
        step_path: Optional[str] = None,
        png_path: Optional[str] = None,
        designer_feedback: Optional[str] = None,
        approved: bool = False
    ) -> Optional[ModelVersion]:
        """Add a new version to the task's history.

        Args:
            task_id (str): The task identifier.
            prompt (str): The prompt used for this version.
            version_type (str): Type of version (generation, auto-refine, etc.).
            code (str): The build123d Python code.
            stl_path (Optional[str]): Path to the STL file.
            step_path (Optional[str]): Path to the STEP file.
            png_path (Optional[str]): Path to the preview image.
            designer_feedback (Optional[str]): Designer agent feedback.
            approved (bool): Whether this version was approved.

        Returns:
            Optional[ModelVersion]: The created version, or None if history not found.
        """
        history = self.get_history(task_id)
        if not history:
            return None

        # Get parent ID from current version
        parent_id = history.current_version_id if history.versions else None

        version = ModelVersion(
            id=history.next_version_id(),
            parent_id=parent_id,
            prompt=prompt,
            version_type=version_type,
            code=code,
            stl_path=stl_path,
            step_path=step_path,
            png_path=png_path,
            designer_feedback=designer_feedback,
            approved=approved
        )
        history.add_version(version)
        return version

    def set_current_version(self, task_id: str, version_id: str) -> bool:
        """Set the current displayed version for a task.

        Args:
            task_id (str): The task identifier.
            version_id (str): The version ID to set as current.

        Returns:
            bool: True if successful, False if history or version not found.
        """
        history = self.get_history(task_id)
        if not history:
            return False

        version = history.get_version(version_id)
        if not version:
            return False

        history.current_version_id = version_id
        return True

    def update_version_approval(
        self,
        task_id: str,
        version_id: str,
        approved: bool,
        designer_feedback: Optional[str] = None
    ) -> bool:
        """Update the approval status and feedback for a version.

        Args:
            task_id (str): The task identifier.
            version_id (str): The version ID to update.
            approved (bool): Whether the version is approved.
            designer_feedback (Optional[str]): Designer agent feedback.

        Returns:
            bool: True if successful, False if history or version not found.
        """
        history = self.get_history(task_id)
        if not history:
            return False

        version = history.get_version(version_id)
        if not version:
            return False

        version.approved = approved
        if designer_feedback:
            version.designer_feedback = designer_feedback
        return True
