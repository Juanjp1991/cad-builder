"use client";

import React, {
  createContext,
  useContext,
  Suspense,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Bounds, Center, useBounds } from "@react-three/drei";
import { STLLoader } from "three-stdlib";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface ModelViewerContextValue {
  modelUrl: string;
  status: "loading" | "loaded" | "error";
  error: Error | null;
  onRetry?: () => void;
}

interface ModelViewerProps {
  modelUrl: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
}

interface ModelViewerComponent extends React.FC<ModelViewerProps> {
  Canvas: typeof ModelViewerCanvas;
  Controls: typeof ModelViewerControls;
  LoadingState: typeof ModelViewerLoadingState;
}

// ============================================================================
// Context
// ============================================================================

const ModelViewerContext = createContext<ModelViewerContextValue | null>(null);

function useModelViewerContext(): ModelViewerContextValue {
  const context = useContext(ModelViewerContext);
  if (!context) {
    throw new Error(
      "ModelViewer compound components must be used within a ModelViewer"
    );
  }
  return context;
}

// ============================================================================
// Custom Hook: useSTLModel - wraps useLoader for STL files
// ============================================================================

interface UseSTLModelResult {
  geometry: THREE.BufferGeometry;
  centeredGeometry: THREE.BufferGeometry;
}

/**
 * Custom hook that wraps useLoader for STL files.
 * Handles geometry loading, centering, and normal computation.
 */
function useSTLModel(url: string): UseSTLModelResult {
  const geometry = useLoader(STLLoader, url);

  // Center geometry and compute normals
  const centeredGeometry = useMemo(() => {
    if (!geometry) return geometry;
    const geo = geometry.clone();
    geo.computeBoundingBox();
    if (geo.boundingBox) {
      const center = new THREE.Vector3();
      geo.boundingBox.getCenter(center);
      geo.translate(-center.x, -center.y, -center.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, [geometry]);

  // Dispose cloned geometry on unmount to prevent memory leaks
  useEffect(() => {
    return (): void => {
      if (centeredGeometry && centeredGeometry !== geometry) {
        centeredGeometry.dispose();
      }
    };
  }, [centeredGeometry, geometry]);

  return { geometry, centeredGeometry };
}

// ============================================================================
// FPS Counter Component (dev mode only)
// ============================================================================

function FPSCounter(): React.JSX.Element | null {
  const [fps, setFps] = React.useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return undefined;

    let animationId: number;
    const updateFPS = (): void => {
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      animationId = requestAnimationFrame(updateFPS);
    };

    animationId = requestAnimationFrame(updateFPS);
    return (): void => cancelAnimationFrame(animationId);
  }, []);

  // Only render in development mode
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div
      className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono"
      aria-hidden="true"
    >
      {fps} FPS
    </div>
  );
}

// ============================================================================
// STL Model Component (renders inside Canvas)
// ============================================================================

interface STLModelProps {
  url: string;
  color?: string;
}

function STLModel({ url, color = "#0066CC" }: STLModelProps): React.JSX.Element {
  const { centeredGeometry } = useSTLModel(url);
  const bounds = useBounds();

  // Auto-frame model on load
  useEffect(() => {
    if (centeredGeometry && bounds) {
      // Small delay to ensure mesh is rendered before fitting bounds
      const timeout = setTimeout(() => {
        bounds.refresh().fit().clip();
      }, 100);
      return (): void => clearTimeout(timeout);
    }
    return undefined;
  }, [centeredGeometry, bounds]);

  return (
    <mesh geometry={centeredGeometry}>
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.1}
        flatShading={false}
      />
    </mesh>
  );
}

// ============================================================================
// Scene Component (lighting and model)
// ============================================================================

interface SceneProps {
  modelUrl: string;
}

function Scene({ modelUrl }: SceneProps): React.JSX.Element {
  return (
    <>
      {/* Lighting: ambient + 2 directional for depth */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Model with auto-framing bounds */}
      <Bounds fit clip observe margin={1.2}>
        <Center>
          <STLModel url={modelUrl} />
        </Center>
      </Bounds>
    </>
  );
}

// ============================================================================
// Compound Subcomponents
// ============================================================================

function ModelViewerCanvas(): React.JSX.Element | null {
  const { modelUrl, status } = useModelViewerContext();

  if (status === "error") {
    return null;
  }

  return (
    <Canvas
      camera={{
        position: [0, 0, 5],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      dpr={[1, 2]}
      frameloop="demand"
      style={{
        width: "100%",
        height: "100%",
        background: "#F7F5F3",
      }}
      gl={{ antialias: true, alpha: false }}
    >
      <Suspense fallback={null}>
        <Scene modelUrl={modelUrl} />
      </Suspense>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enableRotate
        enableZoom
        enablePan
        minDistance={1}
        maxDistance={100}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI - 0.1}
      />
    </Canvas>
  );
}

function ModelViewerControls(): React.JSX.Element {
  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm"
      aria-label="3D controls help"
    >
      <span className="hidden sm:inline">
        Drag to rotate &bull; Scroll to zoom &bull; Right-click to pan
      </span>
      <span className="sm:hidden">
        Drag to rotate &bull; Pinch to zoom
      </span>
    </div>
  );
}

function ModelViewerLoadingState(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50"
      aria-busy="true"
      aria-label="Loading 3D model"
    >
      {/* Skeleton shimmer animation */}
      <div className="relative w-32 h-32 mb-4">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse" />
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">
        Loading model...
      </p>
    </motion.div>
  );
}

// ============================================================================
// Error Fallback Component
// ============================================================================

interface ErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps): React.JSX.Element {
  // Determine user-friendly message based on error type
  const getMessage = (): string => {
    const msg = error.message.toLowerCase();
    if (msg.includes("network") || msg.includes("fetch")) {
      return "Connection lost. Check your internet and try again.";
    }
    if (msg.includes("webgl") || msg.includes("context")) {
      return "3D rendering not supported on this device.";
    }
    if (msg.includes("stl") || msg.includes("parse") || msg.includes("invalid")) {
      return "Invalid model file. Try regenerating.";
    }
    return "Model couldn't be displayed. Please try again.";
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-destructive mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm text-center text-muted-foreground mb-4 max-w-xs">
        {getMessage()}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent/90 transition-colors min-h-[44px] min-w-[44px]"
          aria-label="Retry loading model"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ModelViewerErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    onError?: (error: Error) => void;
    onRetry?: () => void;
  },
  ErrorBoundaryState
> {
  constructor(props: {
    children: React.ReactNode;
    onError?: (error: Error) => void;
    onRetry?: () => void;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log errors in development, could be replaced with analytics in production
    if (process.env.NODE_ENV === "development") {
      console.error("ModelViewer error:", error, errorInfo);
    }
    // TODO: Add production error tracking (e.g., Sentry, LogRocket)
    this.props.onError?.(error);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// Main ModelViewer Component
// ============================================================================

// Minimum loading display time to prevent flicker
const MIN_LOADING_DISPLAY_MS = 300;

const ModelViewer: ModelViewerComponent = ({
  modelUrl,
  className,
  onLoad,
  onError,
  children,
}: ModelViewerProps): React.JSX.Element => {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const [error, setError] = React.useState<Error | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);
  const loadStartTimeRef = useRef<number>(Date.now());

  const handleRetry = React.useCallback((): void => {
    setStatus("loading");
    setError(null);
    loadStartTimeRef.current = Date.now();
    setRetryKey((prev) => prev + 1);
  }, []);

  const handleError = React.useCallback(
    (err: Error): void => {
      setStatus("error");
      setError(err);
      onError?.(err);
    },
    [onError]
  );

  // Track loading completion with minimum display time to prevent flicker
  React.useEffect(() => {
    const elapsed = Date.now() - loadStartTimeRef.current;
    const remainingTime = Math.max(0, MIN_LOADING_DISPLAY_MS - elapsed);

    // Wait at least MIN_LOADING_DISPLAY_MS before transitioning to loaded
    const timeout = setTimeout(() => {
      if (status === "loading") {
        setStatus("loaded");
        onLoad?.();
      }
    }, remainingTime + 200); // +200ms buffer for actual load

    return () => clearTimeout(timeout);
  }, [modelUrl, retryKey, status, onLoad]);

  const contextValue = useMemo<ModelViewerContextValue>(
    () => ({
      modelUrl,
      status,
      error,
      onRetry: handleRetry,
    }),
    [modelUrl, status, error, handleRetry]
  );

  return (
    <ModelViewerContext.Provider value={contextValue}>
      <div
        data-testid="model-viewer-container"
        className={cn(
          "relative w-full h-full min-h-[300px] rounded-lg overflow-hidden bg-muted",
          className
        )}
        role="img"
        aria-label="3D model viewer"
      >
        <ModelViewerErrorBoundary onError={handleError} onRetry={handleRetry}>
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <ModelViewerLoadingState key="loading" />
            )}
          </AnimatePresence>

          {children || (
            <>
              <ModelViewerCanvas key={retryKey} />
              <ModelViewerControls />
              <FPSCounter />
            </>
          )}
        </ModelViewerErrorBoundary>
      </div>
    </ModelViewerContext.Provider>
  );
};

// Attach subcomponents for compound pattern
ModelViewer.Canvas = ModelViewerCanvas;
ModelViewer.Controls = ModelViewerControls;
ModelViewer.LoadingState = ModelViewerLoadingState;

// Named export for compound component
export { ModelViewer, useModelViewerContext };

// Default export
export default ModelViewer;
