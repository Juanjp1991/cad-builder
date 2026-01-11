/**
 * TypeScript interfaces for database tables and API functions.
 * All database interfaces use camelCase naming and optional auto-increment IDs.
 */

// ===========================
// DATABASE TABLE INTERFACES
// ===========================

/**
 * Represents a LEGO brick in the user's inventory.
 */
export interface Brick {
    id?: number; // Auto-increment primary key
    type: string; // e.g., "2x4", "2x2", "1x6"
    color: string; // e.g., "red", "blue", "yellow"
    quantity: number; // Number of bricks in inventory
    createdAt: Date; // When the brick was added
}

/**
 * Represents a user's LEGO build project.
 */
export interface Build {
    id?: number; // Auto-increment primary key
    name: string; // User-assigned build name
    modelData: string; // JSON stringified STL or build metadata
    currentStep: number; // Current assembly step (0-indexed)
    createdAt: Date; // When the build was created
    completedAt?: Date; // When the build was marked complete (optional)
}

/**
 * Represents a pre-built LEGO template.
 */
export interface Template {
    id?: number; // Auto-increment primary key
    category: string; // e.g., "animals", "vehicles", "buildings"
    name: string; // Template name (e.g., "Dragon", "Car")
    modelData: string; // JSON stringified model data
    inventoryMatch: boolean; // Whether template matches user's inventory
}

/**
 * User preferences stored in IndexedDB.
 */
export interface UserPreference {
    id?: number; // Auto-increment primary key
    key: string; // Unique preference key (e.g., "theme", "language")
    value: string; // Preference value (JSON string for complex values)
}

/**
 * Cached AI-generated models with TTL.
 */
export interface GenerationCacheEntry {
    id?: number; // Auto-increment primary key
    prompt: string; // User prompt (for deduplication)
    modelData: string; // JSON stringified model data
    createdAt: Date; // When the entry was cached
    expiresAt: Date; // When the entry expires (7 days from createdAt)
}

// ===========================
// STRUCTURAL ANALYSIS INTERFACES
// ===========================

/**
 * Types of structural issues that can be detected in a LEGO model.
 */
export type StructuralIssueType =
  | "weak_base"
  | "cantilever"
  | "floating_brick"
  | "unstable_joint"
  | "other";

/**
 * Severity levels for structural issues.
 */
export type StructuralIssueSeverity = "warning" | "error";

/**
 * Represents a structural issue detected in a LEGO model.
 */
export interface StructuralIssue {
  type: StructuralIssueType;
  severity: StructuralIssueSeverity;
  description: string;
  location?: string; // Optional: "Layer 3, brick at (2,4)"
}

/**
 * Structural analysis metadata for a generated LEGO model.
 * Includes buildability score, issues, and recommendations.
 */
export interface StructuralAnalysis {
  buildabilityScore: number; // 0-100
  issues: StructuralIssue[];
  recommendations: string[];
}

// ===========================
// API FUNCTION INTERFACES
// ===========================

/**
 * Options for generating a LEGO model.
 */
export interface GenerateOptions {
    complexity?: "simple" | "normal"; // Model complexity level (simple for First-Build Guarantee)
    size?: "small" | "medium" | "large"; // Physical model size
    useInventory?: boolean; // Whether to match user's brick inventory
}

/**
 * Response from generateLegoModel API function.
 */
export interface GeneratedModel {
  taskId: string; // A2A task ID
  modelUrl: string; // URL to download STL file
  stlData?: string; // Optional STL file content
  brickCount?: number; // Estimated number of bricks
  structuralAnalysis?: StructuralAnalysis; // Optional structural feedback from backend
}

/**
 * Options for scanning bricks via camera.
 */
export interface ScanOptions {
    autoDetect?: boolean; // Auto-detect brick colors
    colorCorrection?: boolean; // Apply color correction
}

/**
 * Response from scanBricks API function.
 */
export interface ScannedBricks {
    taskId: string; // A2A task ID
    bricks: Brick[]; // Detected bricks
    confidence: number; // Detection confidence (0-1)
}

/**
 * Response from getTemplates API function.
 */
export interface TemplateList {
    templates: Template[]; // List of templates
    totalCount: number; // Total number of templates available
}
