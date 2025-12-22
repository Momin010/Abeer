import { useState, useEffect, useRef, useCallback } from 'react';

export const useMicrophone = (isActive: boolean) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef<number | null>(null);
  const [volume, setVolume] = useState(0);

  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      const source = ctx.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      analyserRef.current = analyser;
      setAudioContext(ctx);
      setHasPermission(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      setHasPermission(false);
    }
  }, []);

  useEffect(() => {
    if (!isActive || !hasPermission || !analyserRef.current) return;

    const analyze = () => {
      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      setVolume(average);

      requestRef.current = requestAnimationFrame(analyze);
    };

    analyze();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, hasPermission]);

  return { initializeAudio, hasPermission, volume };
};