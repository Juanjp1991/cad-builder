"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Center, Html } from "@react-three/drei";
import STLModel from "./model-viewer/STLModel";

interface ModelViewerProps {
    stlUrl: string | null;
}


/**
 * Component to view a 3D model from an STL URL.
 *
 * @param props - Component props.
 * @param props.stlUrl - The URL of the STL file to display. Returns a placeholder if null.
 * @returns The rendered ModelViewer component.
 */
export default function ModelViewer({ stlUrl }: ModelViewerProps): React.JSX.Element {
    if (!stlUrl) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400">
                <p>No model generated yet.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
            <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }}>
                <Suspense fallback={<Html center><div className="text-white">Loading 3D Model...</div></Html>}>
                    <Stage environment="city" intensity={0.6}>
                        <Center>
                            <STLModel url={stlUrl} />
                        </Center>
                    </Stage>
                </Suspense>
                <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
            </Canvas>
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-xs backdrop-blur-sm">
                Interactive 3D View
            </div>
        </div>
    );
}
