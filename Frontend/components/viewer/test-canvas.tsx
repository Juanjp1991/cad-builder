"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

/**
 * Test component to verify Three.js and @react-three/fiber setup.
 * Renders a simple 3D box with orbit controls for interaction.
 */
export default function TestCanvas(): React.JSX.Element {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ width: "100%", height: "100%" }}
        >
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />

            {/* Test mesh - rotating box */}
            <mesh>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="royalblue" />
            </mesh>

            {/* Orbit controls for camera interaction */}
            <OrbitControls enableDamping dampingFactor={0.05} />
        </Canvas>
    );
}
