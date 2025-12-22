import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from './types';
import { Experience } from './components/Experience';
import { useMicrophone } from './hooks/useMicrophone';
import { generateBirthdayWish } from './services/geminiService';

// --- DIFFICULTY SETTINGS ---
const BLOW_THRESHOLD = 30;    
const REGEN_RATE = 0.5;       
const DAMAGE_MULTIPLIER = 0.8; 
// ---------------------------

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [candlesLit, setCandlesLit] = useState(true);
  
  // Flame Strength: 100 = full fire, 0 = extinguished
  const [flameStrength, setFlameStrength] = useState(100);

  const [birthdayMessage, setBirthdayMessage] = useState("Happy 47th Birthday, Abeer!");

  const { initializeAudio, hasPermission, volume } = useMicrophone(
    gameState === GameState.CELEBRATING
  );

  // Audio Reference for Background Music
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Generate wish on mount
    generateBirthdayWish().then(setBirthdayMessage);
  }, []);

  // Initialize and Play Audio on Mount
  useEffect(() => {
    // In Vite/Vercel, files in 'public' are served at root '/'
    const audio = new Audio('/birthdaysong.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    // Attempt autoplay
    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.log("Autoplay blocked. Waiting for interaction.");
        // Fallback: Play on first user interaction
        const handleInteraction = () => {
          audio.play();
          window.removeEventListener('click', handleInteraction);
          window.removeEventListener('touchstart', handleInteraction);
        };
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
      }
    };

    playAudio();

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Game Loop for Candle Physics
  useEffect(() => {
    if (gameState !== GameState.CELEBRATING || !candlesLit) return;

    let animationFrameId: number;

    const updateCandles = () => {
      setFlameStrength((prevStrength) => {
        let change = 0;
        
        if (volume > BLOW_THRESHOLD) {
          // Blowing hard decreases strength
          const power = volume - BLOW_THRESHOLD;
          change = -power * DAMAGE_MULTIPLIER;
        } else {
          // Not blowing enough regens strength
          change = REGEN_RATE;
        }

        const newStrength = Math.min(100, Math.max(0, prevStrength + change));
        
        // Check win condition
        if (newStrength <= 0) {
            handleSuccess(); 
            return 0;
        }
        
        return newStrength;
      });

      animationFrameId = requestAnimationFrame(updateCandles);
    };

    updateCandles();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, candlesLit, volume]);

  const handleSuccess = () => {
    setCandlesLit(false);
    triggerConfetti();
    setGameState(GameState.FINISHED);
  };

  const handleRestart = () => {
    setCandlesLit(true);
    setFlameStrength(100);
    setGameState(GameState.INTRO);
  };

  const handleManualBlow = () => {
    setFlameStrength(prev => {
        const next = prev - 15; 
        if (next <= 0) {
            setTimeout(handleSuccess, 100);
            return 0;
        }
        return next;
    });
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 8,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f472b6', '#fbbf24', '#60a5fa']
      });
      confetti({
        particleCount: 8,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f472b6', '#fbbf24', '#60a5fa']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleStart = async () => {
    await initializeAudio();
    // Ensure audio is playing if it wasn't already (double check)
    if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
    setGameState(GameState.CELEBRATING);
  };

  const getMeterColor = () => {
      if (volume > BLOW_THRESHOLD) return 'bg-red-500';
      return 'bg-blue-400';
  };

  return (
    <div className="relative w-full h-full bg-slate-900 text-white overflow-hidden font-hand select-none">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0 cursor-move">
        <Experience 
            candlesLit={candlesLit} 
            flameIntensity={flameStrength / 100} 
            onBlow={handleManualBlow} 
        />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Header */}
        <div className="w-full flex justify-between items-start pt-4 px-4 pointer-events-none">
           {/* Confetti Button - Pointer events auto to enable clicking */}
           <button 
             onClick={triggerConfetti}
             className="pointer-events-auto backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-yellow-300 p-3 rounded-full shadow-lg transform transition active:scale-95 flex items-center gap-2"
             title="Throw Confetti"
           >
             🎉 <span className="hidden md:inline font-bold">Confetti</span>
           </button>
        </div>

        {/* Center/Main Interactions */}
        <div className="flex-1 flex items-center justify-center pointer-events-none">
          
          {/* Start Screen */}
          {gameState === GameState.INTRO && (
            <div className="pointer-events-auto bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center shadow-2xl max-w-md animate-[fadeIn_0.5s_ease-out]">
              <p className="text-xl mb-6 font-arabic text-gray-100 leading-relaxed">
                Welcome to your private party, Abeer! <br/>
                We have a cake ready just for you.
              </p>
              <button
                onClick={handleStart}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full transform transition hover:scale-110 shadow-lg text-lg active:scale-95"
              >
                Let's Celebrate! 🎂
              </button>
            </div>
          )}

          {/* Celebration / Blowing Screen */}
          {gameState === GameState.CELEBRATING && (
            <div className="absolute bottom-10 w-full max-w-md flex flex-col items-center gap-4">
               
               {/* Instructions */}
               <div className="pointer-events-auto bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                   <p className="text-xl text-yellow-300 drop-shadow-md text-center">
                     {hasPermission 
                       ? "Blow HARD to put out the candles!" 
                       : "Tap the cake to blow!"}
                   </p>
               </div>

               {/* Blow Meter / Candle Health */}
               {hasPermission && (
                  <div className="pointer-events-auto w-full px-8">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                        <span>Candle Strength</span>
                        <span>{Math.round(flameStrength)}%</span>
                    </div>
                    {/* Health Bar Container */}
                    <div className="h-6 w-full bg-gray-800 rounded-full overflow-hidden border-2 border-gray-600 relative">
                        {/* Threshold Marker */}
                        <div 
                            className="absolute top-0 bottom-0 w-1 bg-white/50 z-20" 
                            style={{ left: `${(BLOW_THRESHOLD / 100) * 100}%` }}
                            title="Blow Threshold"
                        />
                        
                        <div 
                          className={`h-full transition-all duration-100 ease-linear ${flameStrength < 30 ? 'bg-green-500' : 'bg-orange-500'}`}
                          style={{ width: `${flameStrength}%` }}
                        />
                    </div>

                    {/* Input Volume Visualizer */}
                    <div className="mt-2 flex items-center gap-2">
                         <span className="text-xs text-gray-400">Force:</span>
                         <div className="h-3 flex-1 bg-gray-900 rounded-full overflow-hidden">
                             <div 
                                className={`h-full ${getMeterColor()} transition-all duration-75`}
                                style={{ width: `${Math.min(volume * 2, 100)}%` }}
                             />
                         </div>
                    </div>
                  </div>
               )}
            </div>
          )}

          {/* Finished State: Restart Button */}
          {gameState === GameState.FINISHED && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <button 
                    onClick={handleRestart}
                    className="pointer-events-auto mt-32 backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/20 text-white px-8 py-3 rounded-full transition text-lg font-bold shadow-xl"
                 >
                    Restart / إعادة
                 </button>
             </div>
          )}
        </div>

        {/* Bottom Left Birthday Message */}
        {gameState === GameState.FINISHED && (
            <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 pointer-events-none z-20 max-w-2xl">
                <h1 className="text-2xl md:text-5xl font-bold font-arabic text-yellow-300 drop-shadow-[0_4px_15px_rgba(251,191,36,0.6)] leading-tight whitespace-pre-line">
                     {birthdayMessage}
                </h1>
            </div>
        )}

      </div>
    </div>
  );
}
