import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface CakeProps {
  candlesLit: boolean;
  flameIntensity: number; // 0 to 1
  onBlow: () => void;
}

const Candle: React.FC<{ position: [number, number, number]; lit: boolean; intensity: number }> = ({ position, lit, intensity }) => {
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (flameRef.current && lit) {
      const t = clock.getElapsedTime();
      const baseScale = 0.8 * Math.max(0.1, intensity); 
      const flickerSpeed = 10 + (1 - intensity) * 20; 
      const flickerAmp = 0.1 + (1 - intensity) * 0.2; 
      
      flameRef.current.scale.setScalar(
        baseScale + Math.sin(t * flickerSpeed) * flickerAmp
      );
      flameRef.current.position.y = 0.35 + Math.sin(t * 20) * 0.02;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 16]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.1]} />
        <meshStandardMaterial color="black" />
      </mesh>
      {lit && (
        <mesh ref={flameRef} position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            color="#ff5722" 
            emissive="#ff9800" 
            emissiveIntensity={2 * Math.max(0.2, intensity)} 
            transparent 
            opacity={0.9 * Math.max(0, intensity)} 
          />
          <pointLight distance={3} intensity={5 * intensity} color="#ff9800" decay={2} />
        </mesh>
      )}
    </group>
  );
};

export const Cake: React.FC<CakeProps> = ({ candlesLit, flameIntensity, onBlow }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Candles positioning on top tier
  const candleCount = 8;
  const candles = Array.from({ length: candleCount }).map((_, i) => {
    const angle = (i / candleCount) * Math.PI * 2;
    const radius = 0.85; 
    return (
      <Candle 
        key={i} 
        position={[Math.cos(angle) * radius, 2.1, Math.sin(angle) * radius]} 
        lit={candlesLit} 
        intensity={flameIntensity}
      />
    );
  });

  return (
    <group ref={groupRef} onClick={onBlow} position={[0, -1, 0]}>
      {/* Plate */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[2.2, 2.0, 0.1, 64]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Bottom Tier (Layer 1) */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 1, 64]} />
        <meshStandardMaterial color="#fbcfe8" />
      </mesh>

      {/* Top Tier (Layer 2) */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.8, 64]} />
        <meshStandardMaterial color="#fce7f3" />
      </mesh>
      
      {/* 47 on the Front of the Bottom Layer */}
      <Text
        position={[0, 0.6, 1.81]} // Moved to front of bottom cylinder
        rotation={[0, 0, 0]}
        fontSize={0.8}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#b45309"
      >
        47
      </Text>

      {candles}
    </group>
  );
};