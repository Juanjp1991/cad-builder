/**
 * Tests for TypeScript type definitions.
 * Validates type structure and constraints.
 */

import { describe, it, expect } from "vitest";
import type {
  StructuralIssue,
  StructuralAnalysis,
  GeneratedModel,
} from "./types";

describe("Type Definitions", () => {
  describe("StructuralIssue", () => {
    it("should have required fields: type, severity, description", () => {
      const issue: StructuralIssue = {
        type: "weak_base",
        severity: "warning",
        description: "Base layer is only 1 brick thick",
      };

      expect(issue.type).toBe("weak_base");
      expect(issue.severity).toBe("warning");
      expect(issue.description).toBe("Base layer is only 1 brick thick");
    });

    it("should support optional location field", () => {
      const issue: StructuralIssue = {
        type: "cantilever",
        severity: "error",
        description: "Unsupported overhang detected",
        location: "Layer 5, brick at (2,4)",
      };

      expect(issue.location).toBe("Layer 5, brick at (2,4)");
    });

    it("should support all issue types", () => {
      const issueTypes: StructuralIssue["type"][] = [
        "weak_base",
        "cantilever",
        "floating_brick",
        "unstable_joint",
        "other",
      ];

      issueTypes.forEach((type) => {
        const issue: StructuralIssue = {
          type,
          severity: "warning",
          description: `Test ${type}`,
        };
        expect(issue.type).toBe(type);
      });
    });
  });

  describe("StructuralAnalysis", () => {
    it("should have buildabilityScore, issues, and recommendations", () => {
      const analysis: StructuralAnalysis = {
        buildabilityScore: 85,
        issues: [],
        recommendations: [],
      };

      expect(analysis.buildabilityScore).toBe(85);
      expect(analysis.issues).toEqual([]);
      expect(analysis.recommendations).toEqual([]);
    });

    it("should support full analysis with issues and recommendations", () => {
      const analysis: StructuralAnalysis = {
        buildabilityScore: 65,
        issues: [
          {
            type: "cantilever",
            severity: "warning",
            description: "Brick extends 3 studs without support",
          },
          {
            type: "weak_base",
            severity: "error",
            description: "Base layer too narrow",
          },
        ],
        recommendations: [
          "Add support brick under extended section",
          "Increase base layer width by 2 studs",
        ],
      };

      expect(analysis.buildabilityScore).toBe(65);
      expect(analysis.issues).toHaveLength(2);
      expect(analysis.recommendations).toHaveLength(2);
    });
  });

  describe("GeneratedModel", () => {
    it("should have required fields: taskId, modelUrl", () => {
      const model: GeneratedModel = {
        taskId: "task-123",
        modelUrl: "http://localhost:8001/download/model.stl",
      };

      expect(model.taskId).toBe("task-123");
      expect(model.modelUrl).toContain("model.stl");
    });

    it("should support optional structuralAnalysis field", () => {
      const model: GeneratedModel = {
        taskId: "task-456",
        modelUrl: "http://localhost:8001/download/model.stl",
        brickCount: 150,
        structuralAnalysis: {
          buildabilityScore: 90,
          issues: [],
          recommendations: [],
        },
      };

      expect(model.structuralAnalysis).toBeDefined();
      expect(model.structuralAnalysis?.buildabilityScore).toBe(90);
    });

    it("should work without structuralAnalysis (backward compatible)", () => {
      const model: GeneratedModel = {
        taskId: "task-789",
        modelUrl: "http://localhost:8001/download/model.stl",
        brickCount: 200,
      };

      expect(model.structuralAnalysis).toBeUndefined();
    });
  });
});
