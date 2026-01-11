/**
 * Tests for IndexedDB database helper functions.
 * Tests getUserPreference, setUserPreference, and markFirstBuildComplete.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import "fake-indexeddb/auto";
import { db, getUserPreference, setUserPreference, markFirstBuildComplete } from "@/lib/db";

describe("Database Helper Functions", () => {
  beforeEach(async () => {
    // Clear the database before each test
    await db.userPreferences.clear();
  });

  describe("getUserPreference", () => {
    it("should return default value when key does not exist", async () => {
      const result = await getUserPreference("nonExistentKey", "defaultValue");
      expect(result).toBe("defaultValue");
    });

    it("should return stored value when key exists", async () => {
      await db.userPreferences.add({ key: "testKey", value: "storedValue" });
      const result = await getUserPreference("testKey", "defaultValue");
      expect(result).toBe("storedValue");
    });

    it("should return string default value for boolean-like keys", async () => {
      const result = await getUserPreference("isFirstBuild", "true");
      expect(result).toBe("true");
    });

    it("should return stored string value when key exists", async () => {
      await db.userPreferences.add({ key: "isFirstBuild", value: "false" });
      const result = await getUserPreference("isFirstBuild", "true");
      expect(result).toBe("false");
    });

    it("should return string default value for number-like keys", async () => {
      const result = await getUserPreference("retryCount", "0");
      expect(result).toBe("0");
    });
  });

  describe("setUserPreference", () => {
    it("should create new entry when key does not exist", async () => {
      await setUserPreference("newKey", "newValue");
      const stored = await db.userPreferences.where("key").equals("newKey").first();
      expect(stored).toBeDefined();
      expect(stored?.value).toBe("newValue");
    });

    it("should update existing entry when key exists", async () => {
      await db.userPreferences.add({ key: "existingKey", value: "oldValue" });
      await setUserPreference("existingKey", "updatedValue");
      const stored = await db.userPreferences.where("key").equals("existingKey").first();
      expect(stored?.value).toBe("updatedValue");
    });

    it("should handle boolean values", async () => {
      await setUserPreference("boolKey", "true");
      const stored = await db.userPreferences.where("key").equals("boolKey").first();
      expect(stored?.value).toBe("true");
    });

    it("should handle number values", async () => {
      await setUserPreference("numKey", "42");
      const stored = await db.userPreferences.where("key").equals("numKey").first();
      expect(stored?.value).toBe("42");
    });

    it("should not create duplicate entries on update", async () => {
      await setUserPreference("uniqueKey", "value1");
      await setUserPreference("uniqueKey", "value2");
      const count = await db.userPreferences.where("key").equals("uniqueKey").count();
      expect(count).toBe(1);
    });
  });

  describe("markFirstBuildComplete", () => {
    it("should set isFirstBuild to false", async () => {
      // Initially set to true
      await setUserPreference("isFirstBuild", "true");

      // Mark first build complete
      await markFirstBuildComplete();

      const result = await getUserPreference("isFirstBuild", "true");
      expect(result).toBe("false");
    });

    it("should create isFirstBuild entry if it does not exist", async () => {
      await markFirstBuildComplete();

      const stored = await db.userPreferences.where("key").equals("isFirstBuild").first();
      expect(stored).toBeDefined();
      expect(stored?.value).toBe("false");
    });

    it("should update isFirstBuild even if already false", async () => {
      await setUserPreference("isFirstBuild", "false");
      await markFirstBuildComplete();

      const result = await getUserPreference("isFirstBuild", "true");
      expect(result).toBe("false");
    });
  });
});
