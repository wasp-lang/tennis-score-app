"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "../tailwind";

export function TennisCourtVisualisation({
  className,
  player1Name,
  player2Name,
}: {
  className?: string;
  player1Name: string;
  player2Name: string;
}) {
  return (
    <div className={cn("w-full h-full", className)}>
      <Canvas shadows camera={{ position: [0, 5, 15], fov: 30 }}>
        <fog attach="fog" args={["#87CEEB", 30, 90]} />

        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 15]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <hemisphereLight args={["#87CEEB", "#4CAF50", 0.7]} />

        <OrbitalCamera />
        <TennisCourt player1Name={player1Name} player2Name={player2Name} />
      </Canvas>
    </div>
  );
}

function OrbitalCamera() {
  const { camera } = useThree();
  const [radius] = useState(22);
  const [height] = useState(10);
  const [speed] = useState(0.15);

  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const x = Math.sin(t * speed) * radius;
    const z = Math.cos(t * speed) * radius;

    // Smooth camera movement with slight vertical oscillation
    camera.position.x = x;
    camera.position.z = z;
    camera.position.y = height + Math.sin(t * 0.3) * 1.5;

    camera.lookAt(0, 0, 0);
  });

  return null;
}

function TennisCourt({ player1Name = "Player 1", player2Name = "Player 2" }) {
  return (
    <group>
      {/* Court surface with improved materials */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[12, 24]} />
        <meshStandardMaterial color="#339966" roughness={0.7} metalness={0.1} />
      </mesh>

      <CourtLines />

      {/* Net with more detail */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[12.1, 1, 0.05]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.9}
          metalness={0}
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* Net mesh texture using simple wireframe for visual effect */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 0.9, 0.01]} />
        <meshStandardMaterial color="#DDDDDD" wireframe={true} />
      </mesh>

      {/* Net posts with better materials */}
      <mesh position={[-6.1, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 16]} />
        <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.4} />
      </mesh>

      <mesh position={[6.1, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 16]} />
        <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

function CourtLines() {
  // Create a reusable bright white material for all lines
  const lineMaterial = new THREE.MeshStandardMaterial({
    color: "#FFFFFF",
    roughness: 0.3,
    emissive: "#FFFFFF",
    emissiveIntensity: 0.1,
  });

  return (
    <group position={[0, 0.01, 0]}>
      {/* Baseline */}
      <mesh position={[0, 0, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[12, 0.1, 0.02]} />
        <primitive object={lineMaterial} />
      </mesh>

      <mesh position={[0, 0, 12]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[12, 0.1, 0.02]} />
        <primitive object={lineMaterial} />
      </mesh>

      {/* Sidelines */}
      <mesh position={[-6, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.1, 24, 0.02]} />
        <primitive object={lineMaterial} />
      </mesh>

      <mesh position={[6, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.1, 24, 0.02]} />
        <primitive object={lineMaterial} />
      </mesh>

      {/* Center service line */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.1, 12, 0.02]} />
        <primitive object={lineMaterial} />
      </mesh>

      {/* Service lines */}
      <mesh position={[0, 0, -6]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[12, 0.1, 0.02]} />
        <primitive object={lineMaterial} />
      </mesh>

      <mesh position={[0, 0, 6]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[12, 0.1, 0.02]} />
        <primitive object={lineMaterial} />
      </mesh>
    </group>
  );
}
