/**
 * Tests for useFirstBuild custom hook.
 * Tests isFirstBuild state, loading state, and setFirstBuildComplete function.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import "fake-indexeddb/auto";

// Mock the db module
vi.mock("@/lib/db", () => ({
  getUserPreference: vi.fn(),
  setUserPreference: vi.fn(),
}));

import { useFirstBuild } from "./use-first-build";
import { getUserPreference, setUserPreference } from "@/lib/db";

const mockGetUserPreference = vi.mocked(getUserPreference);
const mockSetUserPreference = vi.mocked(setUserPreference);

describe("useFirstBuild", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should return isLoading true initially", async () => {
      mockGetUserPreference.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve("true"), 100))
      );

      const { result } = renderHook(() => useFirstBuild());

      // Initially loading should be true
      expect(result.current.isLoading).toBe(true);

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should return isFirstBuild true by default", async () => {
      mockGetUserPreference.mockResolvedValue("true");

      const { result } = renderHook(() => useFirstBuild());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFirstBuild).toBe(true);
    });

    it("should return isFirstBuild false when preference is false", async () => {
      mockGetUserPreference.mockResolvedValue("false");

      const { result } = renderHook(() => useFirstBuild());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFirstBuild).toBe(false);
    });

    it("should call getUserPreference with correct key", async () => {
      mockGetUserPreference.mockResolvedValue("true");

      renderHook(() => useFirstBuild());

      await waitFor(() => {
        expect(mockGetUserPreference).toHaveBeenCalledWith("isFirstBuild", "true");
      });
    });
  });

  describe("setFirstBuildComplete", () => {
    it("should set isFirstBuild to false when called", async () => {
      mockGetUserPreference.mockResolvedValue("true");
      mockSetUserPreference.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFirstBuild());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFirstBuild).toBe(true);

      await act(async () => {
        await result.current.setFirstBuildComplete();
      });

      expect(result.current.isFirstBuild).toBe(false);
    });

    it("should call setUserPreference with correct arguments", async () => {
      mockGetUserPreference.mockResolvedValue("true");
      mockSetUserPreference.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFirstBuild());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setFirstBuildComplete();
      });

      expect(mockSetUserPreference).toHaveBeenCalledWith("isFirstBuild", "false");
    });
  });

  describe("error handling", () => {
    it("should default to isFirstBuild true on error", async () => {
      mockGetUserPreference.mockRejectedValue(new Error("Database error"));

      const { result } = renderHook(() => useFirstBuild());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should default to true on error for safety
      expect(result.current.isFirstBuild).toBe(true);
    });

    it("should complete loading even on error", async () => {
      mockGetUserPreference.mockRejectedValue(new Error("Database error"));

      const { result } = renderHook(() => useFirstBuild());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
