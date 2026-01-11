import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashFile, hashImagesWithPrompt, shortHash } from "./image-hash";

/**
 * Creates a mock File object with working arrayBuffer.
 */
function createMockFile(name: string, content: string): File {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const blob = new Blob([data], { type: "image/jpeg" });
  return new File([blob], name, { type: "image/jpeg" });
}

beforeEach(() => {
  // Mock crypto.subtle.digest for deterministic testing
  vi.spyOn(crypto.subtle, "digest").mockImplementation(
    async (_algorithm: string, data: ArrayBuffer): Promise<ArrayBuffer> => {
      // Create a deterministic hash based on data content
      const view = new Uint8Array(data);
      const sum = view.reduce((a, b) => (a + b) % 256, 0);
      const hash = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        hash[i] = (sum * (i + 1)) % 256;
      }
      return hash.buffer;
    }
  );
});

describe("hashFile", () => {
  it("returns a hex string hash", async () => {
    const file = createMockFile("test.jpg", "test content");
    const hash = await hashFile(file);

    expect(typeof hash).toBe("string");
    expect(hash).toMatch(/^[0-9a-f]+$/); // Only hex characters
    expect(hash.length).toBe(64); // SHA-256 produces 64 hex chars
  });

  it("returns same hash for same content", async () => {
    const file1 = createMockFile("test1.jpg", "identical content");
    const file2 = createMockFile("test2.jpg", "identical content");

    const hash1 = await hashFile(file1);
    const hash2 = await hashFile(file2);

    expect(hash1).toBe(hash2);
  });

  it("returns different hash for different content", async () => {
    const file1 = createMockFile("test1.jpg", "content A");
    const file2 = createMockFile("test2.jpg", "content B");

    const hash1 = await hashFile(file1);
    const hash2 = await hashFile(file2);

    expect(hash1).not.toBe(hash2);
  });
});

describe("hashImagesWithPrompt", () => {
  it("returns a hex string hash", async () => {
    const files = [createMockFile("test.jpg", "test content")];
    const hash = await hashImagesWithPrompt(files, "test prompt");

    expect(typeof hash).toBe("string");
    expect(hash).toMatch(/^[0-9a-f]+$/);
    expect(hash.length).toBe(64);
  });

  it("returns same hash for same files and prompt", async () => {
    const files1 = [
      createMockFile("a.jpg", "content A"),
      createMockFile("b.jpg", "content B"),
    ];
    const files2 = [
      createMockFile("a.jpg", "content A"),
      createMockFile("b.jpg", "content B"),
    ];

    const hash1 = await hashImagesWithPrompt(files1, "prompt");
    const hash2 = await hashImagesWithPrompt(files2, "prompt");

    expect(hash1).toBe(hash2);
  });

  it("returns different hash for different prompts", async () => {
    const files = [createMockFile("test.jpg", "content")];

    const hash1 = await hashImagesWithPrompt(files, "prompt A");
    const hash2 = await hashImagesWithPrompt(files, "prompt B");

    expect(hash1).not.toBe(hash2);
  });

  it("returns different hash for different files", async () => {
    const files1 = [createMockFile("test.jpg", "content A")];
    const files2 = [createMockFile("test.jpg", "content B")];

    const hash1 = await hashImagesWithPrompt(files1, "prompt");
    const hash2 = await hashImagesWithPrompt(files2, "prompt");

    expect(hash1).not.toBe(hash2);
  });

  it("handles empty prompt", async () => {
    const files = [createMockFile("test.jpg", "content")];

    const hash1 = await hashImagesWithPrompt(files);
    const hash2 = await hashImagesWithPrompt(files, "");

    expect(hash1).toBe(hash2);
  });

  it("produces same hash regardless of file order (sorted)", async () => {
    const fileA = createMockFile("a.jpg", "content A");
    const fileB = createMockFile("b.jpg", "content B");

    const hash1 = await hashImagesWithPrompt([fileA, fileB], "prompt");
    const hash2 = await hashImagesWithPrompt([fileB, fileA], "prompt");

    // Files are sorted by hash, so order shouldn't matter
    expect(hash1).toBe(hash2);
  });
});

describe("shortHash", () => {
  it("returns first 12 characters of hash", () => {
    const hash = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";
    const short = shortHash(hash);

    expect(short).toBe("a1b2c3d4e5f6");
    expect(short.length).toBe(12);
  });

  it("returns full string if shorter than 12 characters", () => {
    const hash = "abcdef";
    const short = shortHash(hash);

    expect(short).toBe("abcdef");
  });
});
