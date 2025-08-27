// components/listening/NoiseLadderPlayer.tsx
import React, { useEffect, useRef } from 'react';

export type NoiseLayer = {
  label: string;
  src: string | null;
  volume?: number;
};

export type NoiseLadderPlayerProps = {
  audioRef: React.RefObject<HTMLAudioElement>;
  layers: NoiseLayer[];
  level: number;
  onLevelChange?: (level: number) => void;
  className?: string;
};

// Simple player that overlays a looping noise track on top of a base audio element.
export const NoiseLadderPlayer: React.FC<NoiseLadderPlayerProps> = ({
  audioRef,
  layers,
  level,
  onLevelChange,
  className = '',
}) => {
  const noiseRef = useRef<HTMLAudioElement | null>(null);

  // load the selected noise layer
  useEffect(() => {
    const noise = noiseRef.current;
    if (!noise) return;
    const layer = layers[level];
    if (layer && layer.src) {
      noise.src = layer.src;
      noise.loop = true;
      noise.volume = layer.volume ?? 0.3;
    } else {
      noise.src = '';
    }
  }, [level, layers]);

  // sync noise with the main audio
  useEffect(() => {
    const base = audioRef.current;
    const noise = noiseRef.current;
    if (!base || !noise) return;

    const handlePlay = () => {
      if (level > 0 && noise.src) {
        noise.currentTime = base.currentTime;
        noise.play().catch(() => {});
      }
    };
    const handlePause = () => noise.pause();

    base.addEventListener('play', handlePlay);
    base.addEventListener('pause', handlePause);

    return () => {
      base.removeEventListener('play', handlePlay);
      base.removeEventListener('pause', handlePause);
    };
  }, [audioRef, level]);

  const step = (delta: number) => {
    const max = layers.length - 1;
    const next = Math.max(0, Math.min(max, level + delta));
    if (next !== level) {
      onLevelChange?.(next);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={level <= 0}
        className="px-2 py-1 rounded-ds border border-gray-200 dark:border-white/10"
        aria-label="Decrease noise"
      >
        -
      </button>
      <span className="text-small">
        {layers[level]?.label ?? 'Off'}
      </span>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={level >= layers.length - 1}
        className="px-2 py-1 rounded-ds border border-gray-200 dark:border-white/10"
        aria-label="Increase noise"
      >
        +
      </button>
      <audio ref={noiseRef} className="hidden" />
    </div>
  );
};

export default NoiseLadderPlayer;
