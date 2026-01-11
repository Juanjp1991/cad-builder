/**
 * Unit tests for Dexie.js IndexedDB schema.
 * Uses fake-indexeddb for in-memory testing.
 */

import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { db } from "@/lib/db";
import type { Brick, Build, UserPreference, GenerationCacheEntry } from "@/lib/types";

describe("LegoDatabase", () => {
    beforeEach(async () => {
        // Clear all tables before each test
        await db.delete();
        await db.open();
    });

    it("should initialize with 5 tables", () => {
        expect(db.bricks).toBeDefined();
        expect(db.builds).toBeDefined();
        expect(db.templates).toBeDefined();
        expect(db.userPreferences).toBeDefined();
        expect(db.generationCache).toBeDefined();
    });

    describe("bricks table", () => {
        it("should add and retrieve a brick", async () => {
            const brick: Brick = {
                type: "2x4",
                color: "blue",
                quantity: 10,
                createdAt: new Date(),
            };

            const id = await db.bricks.add(brick);
            const retrieved = await db.bricks.get(id);

            expect(retrieved).toBeDefined();
            expect(retrieved?.type).toBe("2x4");
            expect(retrieved?.color).toBe("blue");
            expect(retrieved?.quantity).toBe(10);
        });

        it("should query bricks by color", async () => {
            await db.bricks.bulkAdd([
                { type: "2x4", color: "red", quantity: 5, createdAt: new Date() },
                { type: "2x2", color: "blue", quantity: 10, createdAt: new Date() },
                { type: "1x6", color: "red", quantity: 3, createdAt: new Date() },
            ]);

            const redBricks = await db.bricks.where("color").equals("red").toArray();
            expect(redBricks).toHaveLength(2);
            expect(redBricks.every((b) => b.color === "red")).toBe(true);
        });
    });

    describe("builds table", () => {
        it("should add and retrieve a build", async () => {
            const build: Build = {
                name: "Dragon Model",
                modelData: JSON.stringify({ vertices: [] }),
                currentStep: 0,
                createdAt: new Date(),
            };

            const id = await db.builds.add(build);
            const retrieved = await db.builds.get(id);

            expect(retrieved).toBeDefined();
            expect(retrieved?.name).toBe("Dragon Model");
            expect(retrieved?.currentStep).toBe(0);
        });

        it("should update build completion", async () => {
            const id = await db.builds.add({
                name: "Car",
                modelData: "{}",
                currentStep: 0,
                createdAt: new Date(),
            });

            await db.builds.update(id, { completedAt: new Date(), currentStep: 10 });

            const updated = await db.builds.get(id);
            expect(updated?.completedAt).toBeDefined();
            expect(updated?.currentStep).toBe(10);
        });
    });

    describe("userPreferences table", () => {
        it("should add a preference", async () => {
            const pref: UserPreference = {
                key: "theme",
                value: "dark",
            };

            const id = await db.userPreferences.add(pref);
            const retrieved = await db.userPreferences.get(id);

            expect(retrieved?.key).toBe("theme");
            expect(retrieved?.value).toBe("dark");
        });

        it("should enforce unique key constraint", async () => {
            await db.userPreferences.add({ key: "lang", value: "en" });

            // Attempt duplicate key should fail
            await expect(
                db.userPreferences.add({ key: "lang", value: "es" })
            ).rejects.toThrow();
        });

        it("should update preference by key", async () => {
            await db.userPreferences.add({ key: "volume", value: "50" });

            const pref = await db.userPreferences.where("key").equals("volume").first();
            expect(pref).toBeDefined();

            await db.userPreferences.update(pref!.id!, { value: "75" });

            const updated = await db.userPreferences.where("key").equals("volume").first();
            expect(updated?.value).toBe("75");
        });
    });

    describe("generationCache table", () => {
        it("should add cache entry with expiration", async () => {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

            const entry: GenerationCacheEntry = {
                prompt: "a small dragon",
                modelData: JSON.stringify({ stlUrl: "model.stl" }),
                createdAt: now,
                expiresAt,
            };

            const id = await db.generationCache.add(entry);
            const retrieved = await db.generationCache.get(id);

            expect(retrieved?.prompt).toBe("a small dragon");
            expect(retrieved?.expiresAt.getTime()).toBe(expiresAt.getTime());
        });

        it("should query expired entries for cleanup", async () => {
            const now = new Date();
            const pastDate = new Date(now.getTime() - 1000); // 1 second ago

            await db.generationCache.bulkAdd([
                {
                    prompt: "old",
                    modelData: "{}",
                    createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
                    expiresAt: pastDate,
                },
                {
                    prompt: "fresh",
                    modelData: "{}",
                    createdAt: now,
                    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                },
            ]);

            const expired = await db.generationCache
                .where("expiresAt")
                .below(now)
                .toArray();

            expect(expired).toHaveLength(1);
            expect(expired[0].prompt).toBe("old");
        });
    });
});
