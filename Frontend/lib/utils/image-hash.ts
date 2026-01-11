/**
 * Image hashing utilities for cache deduplication.
 * Uses Web Crypto API for deterministic SHA-256 hashing.
 */

/**
 * Checks if Web Crypto API is available.
 * crypto.subtle is only available in secure contexts (HTTPS or localhost).
 */
function isCryptoAvailable(): boolean {
  return typeof crypto !== "undefined" && crypto.subtle !== undefined;
}

/**
 * Simple fallback hash when crypto.subtle is unavailable.
 * Uses file metadata for a deterministic but less secure hash.
 * @param file - The file to hash.
 * @returns A deterministic string based on file properties.
 */
function fallbackHash(file: File): string {
  const str = `${file.name}-${file.size}-${file.type}-${file.lastModified}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

/**
 * Reads a File as ArrayBuffer using FileReader (for jsdom compatibility).
 * @param file - The file to read.
 * @returns Promise resolving to ArrayBuffer.
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (): void => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = (): void => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Computes SHA-256 hash of a File's content.
 * Falls back to metadata-based hash if crypto.subtle is unavailable.
 * @param file - The file to hash.
 * @returns Promise resolving to hex-encoded hash string.
 */
export async function hashFile(file: File): Promise<string> {
  // Fallback for non-secure contexts where crypto.subtle is unavailable
  if (!isCryptoAvailable()) {
    return fallbackHash(file);
  }

  const arrayBuffer = await readFileAsArrayBuffer(file);
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Computes combined hash from multiple files and an optional prompt.
 * Creates a deterministic cache key for image-to-model generation.
 *
 * @param files - Array of image files.
 * @param prompt - Optional text prompt.
 * @returns Promise resolving to combined hex-encoded hash string.
 */
export async function hashImagesWithPrompt(
  files: File[],
  prompt: string = ""
): Promise<string> {
  // Hash each file
  const fileHashes = await Promise.all(files.map(hashFile));

  // Sort hashes to ensure deterministic ordering regardless of upload order.
  // DESIGN DECISION: Same images in different order = same cache key.
  // The "Primary" badge in the UI is purely cosmetic for user reference.
  // The backend AI model processes all images as equal context, not ordered input.
  // This maximizes cache hits when users upload the same images in any order.
  const sortedHashes = [...fileHashes].sort();

  // Combine hashes with prompt
  const combinedString = sortedHashes.join("|") + "|" + prompt;

  // Hash the combined string
  if (!isCryptoAvailable()) {
    // Simple string hash fallback
    let hash = 0;
    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(combinedString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex;
}

/**
 * Generates a short cache key prefix for display/debugging.
 * @param hash - Full hex hash string.
 * @returns First 12 characters of hash.
 */
export function shortHash(hash: string): string {
  return hash.substring(0, 12);
}
