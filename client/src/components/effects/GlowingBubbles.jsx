import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Bubble = ({ position, size, color, speed, distort }) => {
    return (
        <Float
            speed={speed}
            rotationIntensity={1}
            floatIntensity={2}
            position={position}
        >
            <Sphere args={[size, 16, 16]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1.5}
                    transparent
                    opacity={0.4}
                    roughness={0}
                    metalness={0.5}
                />
            </Sphere>
        </Float>
    );
};

const BubblesGroup = () => {
    // 🚀 Performance: Reduced bubble count to 12 for maximum stability
    const bubbles = useMemo(() => {
        return new Array(12).fill().map(() => ({
            position: [
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 8
            ],
            size: Math.random() * 0.15 + 0.05,
            color: Math.random() > 0.6 ? '#BEFF00' : '#EAB308',
            speed: Math.random() * 1.2 + 0.4,
            distort: Math.random() * 0.4 + 0.2
        }));
    }, []);

    return (
        <group>
            {bubbles.map((db, i) => (
                <Bubble key={i} {...db} />
            ))}
        </group>
    );
};

const GlowingBubbles = () => {
    // 🛡️ Error Handling Table:
    // 1. dpr [1, 2]: Limit resolution on high-PPI screens
    // 2. powerPreference: "low-power" helps stability for background effects
    // 3. failIfMajorPerformanceCaveat: prevents initialization if GPU is already overloaded

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            pointerEvents: 'none',
            background: 'radial-gradient(circle at center, #0a0a0a 0%, #000000 100%)'
        }}>
            <Canvas
                camera={{ position: [0, 0, 10], fov: 50 }}
                dpr={[1, 1.5]}
                gl={{
                    antialias: false,
                    powerPreference: "low-power",
                    stencil: false,
                    depth: true,
                    alpha: true
                }}
                onCreated={({ gl }) => {
                    // Listen for context loss to handle it gracefully if needed
                    gl.domElement.addEventListener('webglcontextlost', (event) => {
                        event.preventDefault();
                        console.warn('OLIVA: WebGL Context Lost. Attempting to recover...');
                    }, false);

                    gl.domElement.addEventListener('webglcontextrestored', () => {
                        console.log('OLIVA: WebGL Context Restored.');
                    }, false);
                }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#BEFF00" />
                <BubblesGroup />
            </Canvas>
        </div>
    );
};

export default GlowingBubbles;
