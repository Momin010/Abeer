import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Float, Environment } from '@react-three/drei';
import { Cake } from './Cake';
import { Balloons } from './Balloons';

interface ExperienceProps {
  candlesLit: boolean;
  flameIntensity: number;
  onBlow: () => void;
}

export const Experience: React.FC<ExperienceProps> = ({ candlesLit, flameIntensity, onBlow }) => {
  return (
    <Canvas
      camera={{ position: [0, 4, 8], fov: 45 }}
      shadows
      dpr={[1, 2]} 
      className="absolute inset-0 bg-slate-900"
    >
      <fog attach="fog" args={['#0f172a', 5, 30]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} color="#e879f9" />
      
      {/* Candle Light */}
      {candlesLit && (
         <pointLight position={[0, 2.5, 0]} intensity={2 * flameIntensity} color="#ff9800" distance={8} decay={2} />
      )}

      {/* Environment Reflectivity for Balloons */}
      <Environment preset="city" />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={80} scale={12} size={4} speed={0.4} opacity={0.5} color="#fff" />

      {/* Objects */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <Cake candlesLit={candlesLit} flameIntensity={flameIntensity} onBlow={onBlow} />
      </Float>
      
      <Balloons />

      {/* Controls: Explicitly default to ensure they work */}
      <OrbitControls 
        makeDefault
        minDistance={2}
        maxDistance={20}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
};