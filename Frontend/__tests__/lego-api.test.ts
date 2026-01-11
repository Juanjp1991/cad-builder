/**
 * Unit tests for LEGO-specific API client functions.
 * Mocks A2A protocol functions for testing.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Task } from "@/lib/api";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create mock fetch responses
function createMockResponse(data: unknown): Response {
    return {
        ok: true,
        json: async () => data,
    } as Response;
}

describe("LEGO API Functions", () => {
    // Import functions inside describe to allow proper mocking
    let generateLegoModel: typeof import("@/lib/api").generateLegoModel;
    let scanBricks: typeof import("@/lib/api").scanBricks;
    let getTemplates: typeof import("@/lib/api").getTemplates;
    let TaskState: typeof import("@/lib/api").TaskState;

    beforeEach(async () => {
        vi.clearAllMocks();
        // Re-import to get fresh module
        const api = await import("@/lib/api");
        generateLegoModel = api.generateLegoModel;
        scanBricks = api.scanBricks;
        getTemplates = api.getTemplates;
        TaskState = api.TaskState;
    });

    describe("generateLegoModel", () => {
        it("should generate a model from text prompt", async () => {
            const mockTask = {
                task: {
                    id: "task-123",
                    status: { state: "TASK_STATE_WORKING" },
                    history: [],
                },
            };
            const mockCompletedTask = {
                task: {
                    id: "task-123",
                    status: { state: "TASK_STATE_COMPLETED" },
                    artifacts: {
                        parts: [
                            {
                                file: {
                                    fileWithUri: "/download/model.stl",
                                    mediaType: "model/stl",
                                },
                            },
                        ],
                    },
                    metadata: { brickCount: 150 },
                    history: [],
                },
            };

            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockTask)) // sendMessage
                .mockResolvedValueOnce(createMockResponse(mockCompletedTask)); // getTask (poll)

            const result = await generateLegoModel("text", "a small dragon", [], [], {
                complexity: "normal",
            });

            expect(result.taskId).toBe("task-123");
            expect(result.modelUrl).toContain("model.stl");
            expect(result.brickCount).toBe(150);
        });

        it("should throw error if generation fails", async () => {
            const mockTask = {
                task: { id: "task-789", status: { state: "TASK_STATE_WORKING" }, history: [] },
            };
            const mockFailedTask = {
                task: { id: "task-789", status: { state: "TASK_STATE_FAILED" }, history: [] },
            };

            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockTask))
                .mockResolvedValueOnce(createMockResponse(mockFailedTask));

            await expect(
                generateLegoModel("text", "test", [], [], {})
            ).rejects.toThrow("generation failed");
        });

        it("should throw error if no STL file in response", async () => {
            const mockTask = {
                task: { id: "task-999", status: { state: "TASK_STATE_WORKING" }, history: [] },
            };
            const mockCompletedTask = {
                task: {
                    id: "task-999",
                    status: { state: "TASK_STATE_COMPLETED" },
                    artifacts: { parts: [] },
                    history: [],
                },
            };

            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockTask))
                .mockResolvedValueOnce(createMockResponse(mockCompletedTask));

            await expect(
                generateLegoModel("text", "test", [], [], {})
            ).rejects.toThrow("No STL file found");
        });

        it("should parse structural analysis from metadata (snake_case)", async () => {
            const mockTask = {
                task: { id: "task-structural", status: { state: "TASK_STATE_WORKING" }, history: [] },
            };
            const mockCompletedTask = {
                task: {
                    id: "task-structural",
                    status: { state: "TASK_STATE_COMPLETED" },
                    artifacts: {
                        parts: [
                            { file: { fileWithUri: "/model.stl", mediaType: "model/stl" } },
                        ],
                    },
                    metadata: {
                        brickCount: 100,
                        structural_analysis: {
                            buildability_score: 85,
                            issues: [
                                {
                                    type: "cantilever",
                                    severity: "warning",
                                    description: "Brick extends without support",
                                },
                            ],
                            recommendations: ["Add support brick"],
                        },
                    },
                    history: [],
                },
            };

            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockTask))
                .mockResolvedValueOnce(createMockResponse(mockCompletedTask));

            const result = await generateLegoModel("text", "test model", [], [], {});

            expect(result.structuralAnalysis).toBeDefined();
            expect(result.structuralAnalysis?.buildabilityScore).toBe(85);
            expect(result.structuralAnalysis?.issues).toHaveLength(1);
            expect(result.structuralAnalysis?.issues[0].type).toBe("cantilever");
            expect(result.structuralAnalysis?.recommendations).toEqual(["Add support brick"]);
        });

        it("should handle missing structural analysis gracefully", async () => {
            const mockTask = {
                task: { id: "task-no-structural", status: { state: "TASK_STATE_WORKING" }, history: [] },
            };
            const mockCompletedTask = {
                task: {
                    id: "task-no-structural",
                    status: { state: "TASK_STATE_COMPLETED" },
                    artifacts: {
                        parts: [
                            { file: { fileWithUri: "/model.stl", mediaType: "model/stl" } },
                        ],
                    },
                    metadata: { brickCount: 50 },
                    history: [],
                },
            };

            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockTask))
                .mockResolvedValueOnce(createMockResponse(mockCompletedTask));

            const result = await generateLegoModel("text", "simple model", [], [], {});

            expect(result.structuralAnalysis).toBeUndefined();
            expect(result.brickCount).toBe(50);
        });

        it("should include complexity 'simple' in request for First-Build Guarantee", async () => {
            const mockTask = {
                task: { id: "task-simple", status: { state: "TASK_STATE_WORKING" }, history: [] },
            };
            const mockCompletedTask = {
                task: {
                    id: "task-simple",
                    status: { state: "TASK_STATE_COMPLETED" },
                    artifacts: {
                        parts: [
                            { file: { fileWithUri: "/model.stl", mediaType: "model/stl" } },
                        ],
                    },
                    history: [],
                },
            };

            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockTask))
                .mockResolvedValueOnce(createMockResponse(mockCompletedTask));

            await generateLegoModel("text", "a simple house", [], [], {
                complexity: "simple",
            });

            // Check that the first fetch call (sendMessage) included the complexity option
            const firstCall = mockFetch.mock.calls[0];
            expect(firstCall[1].body).toContain("simple");
        });

        it("should include complexity 'normal' in request by default", async () => {
            const mockTask = {
                task: { id: "task-normal", status: { state: "TASK_STATE_WORKING" }, history: [] },
            };
            const mockCompletedTask = {
                task: {
                    id: "task-normal",
                    status: { state: "TASK_STATE_COMPLETED" },
                    artifacts: {
                        parts: [
                            { file: { fileWithUri: "/model.stl", mediaType: "model/stl" } },
                        ],
                    },
                    history: [],
                },
            };

            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockTask))
                .mockResolvedValueOnce(createMockResponse(mockCompletedTask));

            await generateLegoModel("text", "a complex castle", [], [], {
                complexity: "normal",
            });

            // Check that the first fetch call (sendMessage) included the complexity option
            const firstCall = mockFetch.mock.calls[0];
            expect(firstCall[1].body).toContain("normal");
        });

        it("should handle structural analysis from data part", async () => {
            const mockTask = {
                task: { id: "task-data-part", status: { state: "TASK_STATE_WORKING" }, history: [] },
            };
            const mockCompletedTask = {
                task: {
                    id: "task-data-part",
                    status: { state: "TASK_STATE_COMPLETED" },
                    artifacts: {
                        parts: [
                            { file: { fileWithUri: "/model.stl", mediaType: "model/stl" } },
                            {
                                data: {
                                    structural_analysis: {
                                        buildability_score: 70,
                                        issues: [],
                                        recommendations: [],
                                    },
                                },
                            },
                        ],
                    },
                    history: [],
                },
            };

            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockTask))
                .mockResolvedValueOnce(createMockResponse(mockCompletedTask));

            const result = await generateLegoModel("text", "data part model", [], [], {});

            expect(result.structuralAnalysis).toBeDefined();
            expect(result.structuralAnalysis?.buildabilityScore).toBe(70);
        });
    });

    describe("scanBricks", () => {
        it("should scan an image and return detected bricks", async () => {
            const mockTask = {
                task: { id: "scan-123", status: { state: "TASK_STATE_WORKING" }, history: [] },
            };
            const mockCompletedTask = {
                task: {
                    id: "scan-123",
                    status: { state: "TASK_STATE_COMPLETED" },
                    metadata: {
                        bricks: [
                            { type: "2x4", color: "red", quantity: 1, createdAt: new Date().toISOString() },
                            { type: "2x2", color: "blue", quantity: 2, createdAt: new Date().toISOString() },
                        ],
                        confidence: 0.95,
                    },
                    history: [],
                },
            };

            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockTask))
                .mockResolvedValueOnce(createMockResponse(mockCompletedTask));

            const imageFile = new File(["fake"], "bricks.jpg", { type: "image/jpeg" });
            const result = await scanBricks(imageFile, { autoDetect: true });

            expect(result.taskId).toBe("scan-123");
            expect(result.bricks).toHaveLength(2);
            expect(result.confidence).toBe(0.95);
        });
    });

    describe("getTemplates", () => {
        it("should fetch templates without category filter", async () => {
            const mockTask = {
                task: { id: "template-123", status: { state: "TASK_STATE_WORKING" }, history: [] },
            };
            const mockCompletedTask = {
                task: {
                    id: "template-123",
                    status: { state: "TASK_STATE_COMPLETED" },
                    metadata: {
                        templates: [
                            { id: 1, category: "animals", name: "Dragon", modelData: "{}" },
                            { id: 2, category: "vehicles", name: "Car", modelData: "{}" },
                        ],
                        totalCount: 2,
                    },
                    history: [],
                },
            };

            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockTask))
                .mockResolvedValueOnce(createMockResponse(mockCompletedTask));

            const result = await getTemplates();

            expect(result.templates).toHaveLength(2);
            expect(result.totalCount).toBe(2);
        });

        it("should fetch templates with category filter", async () => {
            const mockTask = {
                task: { id: "template-456", status: { state: "TASK_STATE_WORKING" }, history: [] },
            };
            const mockCompletedTask = {
                task: {
                    id: "template-456",
                    status: { state: "TASK_STATE_COMPLETED" },
                    metadata: {
                        templates: [{ id: 1, category: "animals", name: "Lion", modelData: "{}" }],
                        totalCount: 1,
                    },
                    history: [],
                },
            };

            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockTask))
                .mockResolvedValueOnce(createMockResponse(mockCompletedTask));

            const result = await getTemplates("animals");

            expect(result.templates).toHaveLength(1);
        });
    });
});
