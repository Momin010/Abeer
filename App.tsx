import React, { useState, useEffect } from 'react';
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

  // Added Arabic to the final message
  const birthdayMessage = "Happy 47th Birthday, Abeer!\nكل عام وأنتِ بخير يا عبير ❤️";

  const { initializeAudio, hasPermission, volume } = useMicrophone(
    gameState === GameState.CELEBRATING
  );

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
            className="pointer-events-auto backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-yellow-300 p-3 rounded-full shadow-lg active:scale-95 flex items-center gap-2 font-arabic"
          >
            <span>🎉</span>
            <span>Confetti / احتفال</span>
          </button>
        </div>

        {/* Center */}
        <div className="flex-1 flex items-center justify-center">

          {gameState === GameState.INTRO && (
            <div className="pointer-events-auto bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center shadow-2xl max-w-md animate-[fadeIn_0.5s_ease-out]">
              <div className="text-xl mb-6 font-arabic leading-relaxed text-gray-100">
                <p className="text-2xl mb-2 font-bold" dir="rtl">عيد ميلاد سعيد يا عبير!</p>
                <p dir="rtl">لقد صنعنا لكِ كعكة خاصة للاحتقال.</p>
                <hr className="border-white/20 my-3"/>
                <p className="text-base font-sans">
                  Welcome to your private party, Abeer! <br />
                  We have a cake ready just for you.
                </p>
              </div>
              <button
                onClick={handleStart}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-8 rounded-full hover:scale-110 transition shadow-lg font-arabic text-lg"
              >
                Let’s Celebrate! / هيّا نحتفل 🎂
              </button>
            </div>
          )}

          {gameState === GameState.CELEBRATING && (
            <div className="absolute bottom-10 w-full max-w-md flex flex-col items-center gap-4">

              <div className="pointer-events-auto bg-black/40 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                <p className="text-xl text-yellow-300 text-center font-arabic whitespace-pre-line leading-relaxed">
                  {hasPermission
                    ? 'انفخي بقوة لإطفاء الشموع! 💨\nBlow HARD to put out the candles!'
                    : 'اضغطي على الكعكة للنفخ! 👆\nTap the cake to blow!'}
                </p>
              </div>

              {hasPermission && (
                <div className="pointer-events-auto w-full px-8">
                  <div className="flex justify-between text-xs font-bold text-gray-400 mb-1 font-arabic uppercase tracking-widest">
                    <span>Strength / القوة</span>
                    <span>{Math.round(flameStrength)}%</span>
                  </div>

                  <div className="h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-100 ease-out"
                      style={{ width: `${flameStrength}%` }}
                    />
                  </div>

                  <div className="mt-2 h-3 bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getMeterColor()} transition-all duration-75`}
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
              className="pointer-events-auto mt-32 backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/20 text-white px-8 py-3 rounded-full transition text-lg font-bold shadow-xl font-arabic"
            >
              Restart / إعادة المحاولة 🔄
            </button>
          )}
        </div>

        {gameState === GameState.FINISHED && (
          <div className="absolute bottom-6 left-0 right-0 md:left-12 md:right-auto text-center md:text-left z-20 pointer-events-none p-4">
             <h1 className="text-4xl md:text-6xl font-bold font-arabic text-yellow-300 drop-shadow-[0_4px_15px_rgba(251,191,36,0.6)] leading-tight whitespace-pre-line animate-[fadeIn_1s_ease-out]">
              {birthdayMessage}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}