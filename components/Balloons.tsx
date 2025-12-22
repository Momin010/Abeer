import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BalloonData } from '../types';

const Balloon: React.FC<{ data: BalloonData }> = ({ data }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Random phase for movement
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      // Bobbing motion
      meshRef.current.position.y = data.y + Math.sin(t * data.speed + phase) * 0.5;
      // Slight rotation
      meshRef.current.rotation.z = Math.sin(t * 0.5 + phase) * 0.1;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={meshRef} position={[data.x, data.y, data.z]}>
      {/* Balloon Shape */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshPhysicalMaterial 
          color={data.color} 
          roughness={0.15} 
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.2} // Slight transparency
          thickness={0.1}
        />
      </mesh>
      {/* Knot */}
      <mesh position={[0, -0.38, 0]}>
        <coneGeometry args={[0.08, 0.1, 8]} />
        <meshStandardMaterial color={data.color} />
      </mesh>
      {/* String */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 1.5]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export const Balloons: React.FC = () => {
  const balloons = useMemo(() => {
    const colors = ['#f472b6', '#60a5fa', '#fbbf24', '#a78bfa', '#34d399'];
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 12,
      y: (Math.random() * 5) + 0.5, 
      z: (Math.random() - 0.5) * 10 - 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 0.3 + Math.random() * 0.5
    }));
  }, []);

  return (
    <>
      {balloons.map((b) => (
        <Balloon key={b.id} data={b} />
      ))}
    </>
  );
};