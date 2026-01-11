/**
 * IndexedDB database schema using Dexie.js for the LEGO Builder app.
 * Manages local storage for bricks, builds, templates, preferences, and generation cache.
 */

import Dexie, { type Table } from "dexie";
import type {
    Brick,
    Build,
    Template,
    UserPreference,
    GenerationCacheEntry,
} from "@/lib/types";

/**
 * LEGO Builder IndexedDB database.
 * Version 1: Initial schema with 5 tables.
 */
export class LegoDatabase extends Dexie {
    // Table declarations with TypeScript types
    bricks!: Table<Brick>;
    builds!: Table<Build>;
    templates!: Table<Template>;
    userPreferences!: Table<UserPreference>;
    generationCache!: Table<GenerationCacheEntry>;

    constructor() {
        super("LegoBuilderDB");

        // Define version 1 schema
        this.version(1).stores({
            // Bricks table: auto-increment ID, indexed on type, color, and createdAt
            bricks: "++id, type, color, createdAt",

            // Builds table: auto-increment ID, indexed on name, createdAt, and completedAt
            builds: "++id, name, createdAt, completedAt",

            // Templates table: auto-increment ID, indexed on category and name
            templates: "++id, category, name",

            // User preferences: auto-increment ID, unique index on key
            userPreferences: "++id, &key",

            // Generation cache: auto-increment ID, indexed on expiresAt (for TTL cleanup) and prompt (for deduplication)
            generationCache: "++id, expiresAt, prompt",
        });
    }
}

// Export singleton database instance
export const db = new LegoDatabase();

// ===========================
// USER PREFERENCE HELPERS
// ===========================

/**
 * Retrieves a user preference from IndexedDB.
 * Returns the stored value if found, otherwise returns the default value.
 *
 * @param key - The preference key to look up
 * @param defaultValue - Value to return if key is not found
 * @returns The stored preference value or defaultValue
 */
export async function getUserPreference<T extends string>(
  key: string,
  defaultValue: T
): Promise<T> {
  const pref = await db.userPreferences.where("key").equals(key).first();
  return pref ? (pref.value as T) : defaultValue;
}

/**
 * Sets a user preference in IndexedDB.
 * Creates a new entry if the key doesn't exist, otherwise updates the existing entry.
 *
 * @param key - The preference key to set
 * @param value - The value to store (must be serializable to string)
 */
export async function setUserPreference(
  key: string,
  value: string
): Promise<void> {
  const existing = await db.userPreferences.where("key").equals(key).first();
  if (existing) {
    await db.userPreferences.update(existing.id!, { value });
  } else {
    await db.userPreferences.add({ key, value });
  }
}

/**
 * Marks the user's first build as complete.
 * Sets the isFirstBuild preference to "false" in IndexedDB.
 * Called when the user completes their first build in Epic 5.
 */
export async function markFirstBuildComplete(): Promise<void> {
  await setUserPreference("isFirstBuild", "false");
}
