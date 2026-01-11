import React, { useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { STLLoader } from "three-stdlib";
import { Mesh } from "three";

interface STLModelProps {
    url: string;
}

/**
 * Internal component to load and render the STL model.
 *
 * @param props - Component props.
 * @param props.url - The URL of the STL file to load.
 * @returns The rendered mesh component.
 */
export default function STLModel({ url }: STLModelProps): React.JSX.Element {
    const geom = useLoader(STLLoader, url);
    const meshRef = useRef<Mesh>(null);

    return (
        <mesh ref={meshRef} geometry={geom} castShadow receiveShadow>
            <meshStandardMaterial color="#6366f1" roughness={0.5} metalness={0.1} />
        </mesh>
    );
}
