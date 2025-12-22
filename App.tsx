import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from './types';
import { Experience } from './components/Experience';
import { useMicrophone } from './hooks/useMicrophone';

// --- DIFFICULTY SETTINGS ---
const BLOW_THRESHOLD = 30;
const REGEN_RATE = 0.5;
const DAMAGE_MULTIPLIER = 0.8;
// ---------------------------

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [candlesLit, setCandlesLit] = useState(true);
  const [flameStrength, setFlameStrength] = useState(100);

  const birthdayMessage = "Happy 47th Birthday, Abeer!";

  const { initializeAudio, hasPermission, volume } = useMicrophone(
    gameState === GameState.CELEBRATING
  );

  // 🎵 Audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // -----------------------------
  // Initialize background music
  // -----------------------------
  useEffect(() => {
    const audio = new Audio('/fixed.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';
    audioRef.current = audio;

    const tryPlay = async () => {
      try {
        await audio.play();
        console.log('Audio autoplay success');
      } catch {
        console.log('Autoplay blocked, waiting for user interaction');

        const resume = () => {
          audio.play().catch(err =>
            console.warn('Audio play failed on interaction:', err)
          );
          window.removeEventListener('click', resume);
          window.removeEventListener('touchstart', resume);
        };

        window.addEventListener('click', resume, { once: true });
        window.addEventListener('touchstart', resume, { once: true });
      }
    };

    tryPlay();

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // -----------------------------
  // Candle physics loop
  // -----------------------------
  useEffect(() => {
    if (gameState !== GameState.CELEBRATING || !candlesLit) return;

    let raf: number;

    const update = () => {
      setFlameStrength(prev => {
        let delta = 0;

        if (volume > BLOW_THRESHOLD) {
          delta = -(volume - BLOW_THRESHOLD) * DAMAGE_MULTIPLIER;
        } else {
          delta = REGEN_RATE;
        }

        const next = Math.max(0, Math.min(100, prev + delta));

        if (next <= 0) {
          handleSuccess();
          return 0;
        }

        return next;
      });

      raf = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(raf);
  }, [gameState, candlesLit, volume]);

  // -----------------------------
  // Handlers
  // -----------------------------
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

  const handleStart = async () => {
    await initializeAudio();

    // Ensure music is running
    if (audioRef.current?.paused) {
      audioRef.current.play().catch(() => {});
    }

    setGameState(GameState.CELEBRATING);
  };

  // -----------------------------
  // Confetti
  // -----------------------------
  const triggerConfetti = () => {
    const end = Date.now() + 3000;

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

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  };

  const getMeterColor = () =>
    volume > BLOW_THRESHOLD ? 'bg-red-500' : 'bg-blue-400';

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="relative w-full h-full bg-slate-900 text-white overflow-hidden font-hand select-none">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0 cursor-move">
        <Experience
          candlesLit={candlesLit}
          flameIntensity={flameStrength / 100}
          onBlow={handleManualBlow}
        />
      </div>

      {/* UI */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">

        {/* Header */}
        <div className="w-full flex justify-between pt-4 px-4">
          <button
            onClick={triggerConfetti}
            className="pointer-events-auto backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-yellow-300 p-3 rounded-full shadow-lg active:scale-95"
          >
            🎉 Confetti
          </button>
        </div>

        {/* Center */}
        <div className="flex-1 flex items-center justify-center">

          {gameState === GameState.INTRO && (
            <div className="pointer-events-auto bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center shadow-2xl max-w-md">
              <p className="text-xl mb-6 font-arabic">
                Welcome to your private party, Abeer! <br />
                We have a cake ready just for you.
              </p>
              <button
                onClick={handleStart}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-8 rounded-full hover:scale-110 transition"
              >
                Let’s Celebrate! 🎂
              </button>
            </div>
          )}

          {gameState === GameState.CELEBRATING && (
            <div className="absolute bottom-10 w-full max-w-md flex flex-col items-center gap-4">

              <div className="pointer-events-auto bg-black/40 px-6 py-3 rounded-full">
                <p className="text-xl text-yellow-300">
                  {hasPermission
                    ? 'Blow HARD to put out the candles!'
                    : 'Tap the cake to blow!'}
                </p>
              </div>

              {hasPermission && (
                <div className="pointer-events-auto w-full px-8">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Candle Strength</span>
                    <span>{Math.round(flameStrength)}%</span>
                  </div>

                  <div className="h-6 bg-gray-800 rounded-full overflow-hidden border">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${flameStrength}%` }}
                    />
                  </div>

                  <div className="mt-2 h-3 bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getMeterColor()}`}
                      style={{ width: `${Math.min(volume * 2, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {gameState === GameState.FINISHED && (
            <button
              onClick={handleRestart}
              className="pointer-events-auto mt-32 bg-white/20 px-8 py-3 rounded-full font-bold"
            >
              Restart / إعادة
            </button>
          )}
        </div>

        {gameState === GameState.FINISHED && (
          <div className="absolute bottom-6 left-6 max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-arabic text-yellow-300">
              {birthdayMessage}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
