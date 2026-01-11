"""Version history models for Linear History feature.

This module defines Pydantic models for tracking model versions
and version history in the CAD Builder application.
"""

from datetime import datetime
from typing import Optional, Literal, List
from pydantic import Field

from a2a.models import A2ABaseModel


class ModelVersion(A2ABaseModel):
    """Represents a single version of a generated model.

    Attributes:
        id (str): Version identifier (e.g., "v1", "v2").
        parent_id (Optional[str]): ID of the parent version, None for initial.
        timestamp (datetime): When this version was created.
        prompt (str): The prompt used to create this version.
        version_type (str): Type of version (generation, auto-refine, regenerate, modification).
        code (str): The build123d Python code for this version.
        stl_path (Optional[str]): Path to the generated STL file.
        step_path (Optional[str]): Path to the generated STEP file.
        png_path (Optional[str]): Path to the rendered preview image.
        designer_feedback (Optional[str]): Feedback from the Designer agent.
        approved (bool): Whether this version was approved by the Designer.
    """
    id: str
    parent_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    prompt: str
    version_type: Literal["generation", "auto-refine", "regenerate", "modification"]
    code: str = ""
    stl_path: Optional[str] = None
    step_path: Optional[str] = None
    png_path: Optional[str] = None
    designer_feedback: Optional[str] = None
    approved: bool = False


class ModelHistory(A2ABaseModel):
    """Tracks the version history for a CAD model project.

    Attributes:
        project_id (str): Unique identifier for this project (same as task_id).
        name (Optional[str]): User-friendly name extracted from the prompt.
        versions (List[ModelVersion]): List of all versions in order.
        current_version_id (str): ID of the currently displayed version (HEAD).
        original_prompt (str): The original generation prompt for regeneration.
    """
    project_id: str
    name: Optional[str] = None
    versions: List[ModelVersion] = Field(default_factory=list)
    current_version_id: str = "v1"
    original_prompt: str = ""

    def get_version(self, version_id: str) -> Optional[ModelVersion]:
        """Get a specific version by ID."""
        for v in self.versions:
            if v.id == version_id:
                return v
        return None

    def get_current_version(self) -> Optional[ModelVersion]:
        """Get the currently displayed version."""
        return self.get_version(self.current_version_id)

    def get_latest_version(self) -> Optional[ModelVersion]:
        """Get the most recently created version."""
        return self.versions[-1] if self.versions else None

    def add_version(self, version: ModelVersion) -> None:
        """Add a new version to the history."""
        self.versions.append(version)
        self.current_version_id = version.id

    def next_version_id(self) -> str:
        """Generate the next version ID (v1, v2, etc.)."""
        return f"v{len(self.versions) + 1}"
