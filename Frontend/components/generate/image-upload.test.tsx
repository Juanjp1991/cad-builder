import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  ImageUpload,
  validateFile,
  validateFiles,
  MAX_IMAGES,
  MAX_IMAGE_SIZE_BYTES,
  SUPPORTED_IMAGE_TYPES,
} from "./image-upload";

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => "blob:test-url");
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

/**
 * Creates a mock File object.
 */
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe("ImageUpload", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders drop zone with instructions", () => {
    render(<ImageUpload onSubmit={mockOnSubmit} />);

    expect(
      screen.getByText(/drag & drop images or click to browse/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/jpg, png, webp • max 4 images • 10mb each/i)
    ).toBeInTheDocument();
  });

  it("renders generate button disabled when no images", () => {
    render(<ImageUpload onSubmit={mockOnSubmit} />);

    const button = screen.getByRole("button", { name: /generate/i });
    expect(button).toBeDisabled();
  });

  it("enables generate button when images are added", async () => {
    render(<ImageUpload onSubmit={mockOnSubmit} />);

    const file = createMockFile("test.jpg", 1024, "image/jpeg");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Simulate file selection
    Object.defineProperty(input, "files", {
      value: [file],
    });
    fireEvent.change(input);

    await waitFor(() => {
      const button = screen.getByRole("button", { name: /generate/i });
      expect(button).not.toBeDisabled();
    });
  });

  it("shows error when too many images are selected", async () => {
    render(<ImageUpload onSubmit={mockOnSubmit} />);

    const files = Array.from({ length: 5 }, (_, i) =>
      createMockFile(`test${i}.jpg`, 1024, "image/jpeg")
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, "files", {
      value: files,
    });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/too many images/i)).toBeInTheDocument();
    });
  });

  it("shows error for unsupported file format", async () => {
    render(<ImageUpload onSubmit={mockOnSubmit} />);

    const file = createMockFile("test.gif", 1024, "image/gif");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, "files", {
      value: [file],
    });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/unsupported file format/i)).toBeInTheDocument();
    });
  });

  it("shows error for file that is too large", async () => {
    render(<ImageUpload onSubmit={mockOnSubmit} />);

    const file = createMockFile("test.jpg", MAX_IMAGE_SIZE_BYTES + 1, "image/jpeg");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, "files", {
      value: [file],
    });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/too large/i)).toBeInTheDocument();
    });
  });

  it("displays preview for uploaded images", async () => {
    render(<ImageUpload onSubmit={mockOnSubmit} />);

    const file = createMockFile("test.jpg", 1024, "image/jpeg");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, "files", {
      value: [file],
    });
    fireEvent.change(input);

    await waitFor(() => {
      const preview = screen.getByAltText(/preview 1/i);
      expect(preview).toBeInTheDocument();
    });
  });

  it("marks first image as primary", async () => {
    render(<ImageUpload onSubmit={mockOnSubmit} />);

    const file = createMockFile("test.jpg", 1024, "image/jpeg");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, "files", {
      value: [file],
    });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText("Primary")).toBeInTheDocument();
    });
  });

  it("allows removing an image", async () => {
    render(<ImageUpload onSubmit={mockOnSubmit} />);

    const file = createMockFile("test.jpg", 1024, "image/jpeg");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, "files", {
      value: [file],
    });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByAltText(/preview 1/i)).toBeInTheDocument();
    });

    const removeButton = screen.getByRole("button", { name: /remove image 1/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByAltText(/preview 1/i)).not.toBeInTheDocument();
    });
  });

  it("calls onSubmit with prompt and images when form is submitted", async () => {
    render(<ImageUpload onSubmit={mockOnSubmit} />);

    const file = createMockFile("test.jpg", 1024, "image/jpeg");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, "files", {
      value: [file],
    });
    fireEvent.change(input);

    // Wait for image to be added
    await waitFor(() => {
      expect(screen.getByAltText(/preview 1/i)).toBeInTheDocument();
    });

    // Enter prompt
    const promptInput = screen.getByRole("textbox");
    fireEvent.change(promptInput, { target: { value: "test prompt" } });

    // Submit
    const submitButton = screen.getByRole("button", { name: /generate/i });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith("test prompt", [file]);
  });

  it("has proper accessibility attributes", () => {
    render(<ImageUpload onSubmit={mockOnSubmit} />);

    const dropZone = screen.getByRole("button", { name: /upload images/i });
    expect(dropZone).toHaveAttribute("tabindex", "0");

    const promptInput = screen.getByRole("textbox");
    expect(promptInput).toHaveAttribute(
      "aria-label",
      "Add a description for the images (optional)"
    );
  });

  it("disables interaction when disabled prop is true", () => {
    render(<ImageUpload onSubmit={mockOnSubmit} disabled />);

    const dropZone = screen.getByRole("button", { name: /upload images/i });
    expect(dropZone).toHaveAttribute("tabindex", "-1");

    const promptInput = screen.getByRole("textbox");
    expect(promptInput).toBeDisabled();

    const submitButton = screen.getByRole("button", { name: /generate/i });
    expect(submitButton).toBeDisabled();
  });
});

describe("validateFile", () => {
  it("returns null for valid JPEG file", () => {
    const file = createMockFile("test.jpg", 1024, "image/jpeg");
    expect(validateFile(file)).toBeNull();
  });

  it("returns null for valid PNG file", () => {
    const file = createMockFile("test.png", 1024, "image/png");
    expect(validateFile(file)).toBeNull();
  });

  it("returns null for valid WebP file", () => {
    const file = createMockFile("test.webp", 1024, "image/webp");
    expect(validateFile(file)).toBeNull();
  });

  it("returns error for unsupported format", () => {
    const file = createMockFile("test.gif", 1024, "image/gif");
    const error = validateFile(file);

    expect(error).not.toBeNull();
    expect(error?.type).toBe("invalid_format");
    expect(error?.message).toContain("Unsupported file format");
  });

  it("returns error for file exceeding size limit", () => {
    const file = createMockFile("test.jpg", MAX_IMAGE_SIZE_BYTES + 1, "image/jpeg");
    const error = validateFile(file);

    expect(error).not.toBeNull();
    expect(error?.type).toBe("too_large");
    expect(error?.message).toContain("too large");
  });

  it("accepts file at exactly size limit", () => {
    const file = createMockFile("test.jpg", MAX_IMAGE_SIZE_BYTES, "image/jpeg");
    expect(validateFile(file)).toBeNull();
  });
});

describe("validateFiles", () => {
  it("returns empty array for valid files within limit", () => {
    const files = [
      createMockFile("test1.jpg", 1024, "image/jpeg"),
      createMockFile("test2.png", 1024, "image/png"),
    ];
    expect(validateFiles(0, files)).toHaveLength(0);
  });

  it("returns error when total exceeds MAX_IMAGES", () => {
    const files = [
      createMockFile("test1.jpg", 1024, "image/jpeg"),
      createMockFile("test2.jpg", 1024, "image/jpeg"),
    ];
    const errors = validateFiles(3, files); // 3 existing + 2 new = 5 > 4

    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe("too_many");
  });

  it("returns errors for invalid files", () => {
    const files = [
      createMockFile("test.gif", 1024, "image/gif"),
      createMockFile("large.jpg", MAX_IMAGE_SIZE_BYTES + 1, "image/jpeg"),
    ];
    const errors = validateFiles(0, files);

    expect(errors).toHaveLength(2);
    expect(errors.some((e) => e.type === "invalid_format")).toBe(true);
    expect(errors.some((e) => e.type === "too_large")).toBe(true);
  });
});

describe("Constants", () => {
  it("MAX_IMAGES is 4", () => {
    expect(MAX_IMAGES).toBe(4);
  });

  it("MAX_IMAGE_SIZE_BYTES is 10MB", () => {
    expect(MAX_IMAGE_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });

  it("SUPPORTED_IMAGE_TYPES includes jpeg, png, webp", () => {
    expect(SUPPORTED_IMAGE_TYPES).toContain("image/jpeg");
    expect(SUPPORTED_IMAGE_TYPES).toContain("image/png");
    expect(SUPPORTED_IMAGE_TYPES).toContain("image/webp");
  });
});
