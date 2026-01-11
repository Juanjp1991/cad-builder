"use client";

/**
 * Image upload component for multi-image LEGO model generation.
 * Supports drag-and-drop and click-to-browse with preview thumbnails.
 * AC: upload 1-4 images with validation, preview, reorder, and remove.
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, GripVertical, Sparkles, AlertCircle } from "lucide-react";

/**
 * Validation constants - CRITICAL: Must match story requirements.
 */
export const MAX_IMAGES = 4;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Validation error type.
 */
export interface ValidationError {
  type: "too_many" | "too_large" | "invalid_format";
  message: string;
  filename?: string;
}

/**
 * Image with preview URL.
 */
interface ImageWithPreview {
  file: File;
  previewUrl: string;
  id: string;
}

interface ImageUploadProps {
  onSubmit: (prompt: string, images: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Validates a single file against constraints.
 */
export function validateFile(file: File): ValidationError | null {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return {
      type: "invalid_format",
      message: "Unsupported file format. Use JPG, PNG, or WebP.",
      filename: file.name,
    };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      type: "too_large",
      message: `Image "${file.name}" is too large. Maximum 10MB per image.`,
      filename: file.name,
    };
  }
  return null;
}

/**
 * Validates a collection of files.
 */
export function validateFiles(
  currentCount: number,
  newFiles: File[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check total count
  if (currentCount + newFiles.length > MAX_IMAGES) {
    errors.push({
      type: "too_many",
      message: `Too many images. Maximum ${MAX_IMAGES} allowed.`,
    });
    return errors; // Return early if count exceeded
  }

  // Check each file
  for (const file of newFiles) {
    const error = validateFile(file);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

/**
 * Generates a unique ID for tracking images.
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Image upload component with drag-and-drop, preview, and validation.
 */
export function ImageUpload({
  onSubmit,
  disabled = false,
  placeholder = "Add a description (optional)...",
}: ImageUploadProps): React.JSX.Element {
  const [images, setImages] = useState<ImageWithPreview[]>([]);
  const [prompt, setPrompt] = useState("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ImageWithPreview[]>([]);

  // Keep ref in sync with state for cleanup
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, []);

  /**
   * Handles file selection from input or drop.
   */
  const handleFiles = useCallback(
    (files: FileList | null): void => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validationErrors = validateFiles(images.length, fileArray);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Clear previous errors
      setErrors([]);

      // Create preview URLs and add images
      const newImages: ImageWithPreview[] = fileArray.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        id: generateId(),
      }));

      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length]
  );

  /**
   * Handles click to browse files.
   */
  const handleClick = useCallback((): void => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handles file input change.
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      handleFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleFiles]
  );

  /**
   * Handles drag over event.
   */
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  /**
   * Handles drag leave event.
   */
  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  /**
   * Handles drop event.
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [disabled, handleFiles]
  );

  /**
   * Removes an image by ID.
   */
  const handleRemove = useCallback((id: string): void => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
    setErrors([]);
  }, []);

  /**
   * Handles drag start for reordering.
   */
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number): void => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  /**
   * Handles drag over for reordering.
   */
  const handleImageDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number): void => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;

      // Reorder images
      setImages((prev) => {
        const newImages = [...prev];
        const [draggedImage] = newImages.splice(draggedIndex, 1);
        newImages.splice(index, 0, draggedImage);
        return newImages;
      });
      setDraggedIndex(index);
    },
    [draggedIndex]
  );

  /**
   * Handles drag end for reordering.
   */
  const handleDragEnd = useCallback((): void => {
    setDraggedIndex(null);
  }, []);

  /**
   * Handles form submission.
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent): void => {
      e.preventDefault();
      if (images.length === 0 || disabled) return;

      onSubmit(
        prompt,
        images.map((img) => img.file)
      );
    },
    [images, prompt, disabled, onSubmit]
  );

  const canSubmit = images.length > 0 && !disabled;
  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className="w-full space-y-4">
      {/* Error display */}
      {errors.length > 0 && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2"
        >
          {errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 text-destructive">
              <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{error.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone - shown when no images or can add more */}
      {canAddMore && (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 p-8",
            "border-2 border-dashed rounded-lg transition-all cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "min-h-[200px]",
            isDragging
              ? "border-accent bg-accent/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label={`Upload images. ${images.length} of ${MAX_IMAGES} images selected.`}
        >
          <Upload
            className={cn(
              "size-10 transition-colors",
              isDragging ? "text-accent" : "text-muted-foreground"
            )}
          />
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragging
                ? "Drop images here"
                : "Drag & drop images or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP • Max {MAX_IMAGES} images • 10MB each
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_IMAGE_TYPES.join(",")}
            multiple
            onChange={handleInputChange}
            disabled={disabled}
            className="sr-only"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden bg-muted",
                "group cursor-move",
                draggedIndex === index && "opacity-50"
              )}
            >
              {/* Image */}
              {/* Using native img element - previewUrl is blob URL, not remote */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.previewUrl}
                alt={`Preview ${index + 1}: ${image.file.name}`}
                className="w-full h-full object-cover"
              />

              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded">
                  Primary
                </div>
              )}

              {/* Drag handle */}
              <div className="absolute top-2 right-10 p-1.5 bg-background/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="size-4" />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                disabled={disabled}
                className={cn(
                  "absolute top-2 right-2 p-1.5 bg-background/80 rounded",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  "hover:bg-destructive hover:text-destructive-foreground",
                  "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "min-w-[44px] min-h-[44px] flex items-center justify-center"
                )}
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Prompt input and submit */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 h-12 text-base"
          aria-label="Add a description for the images (optional)"
        />
        <Button
          type="submit"
          disabled={!canSubmit}
          size="lg"
          className="h-12 px-6 bg-accent text-accent-foreground hover:bg-accent/90"
          aria-label="Generate LEGO model from your images"
        >
          <Sparkles className="size-5 mr-2" />
          Generate
        </Button>
      </form>
    </div>
  );
}
