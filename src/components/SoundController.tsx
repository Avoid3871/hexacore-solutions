import { useEffect, useState } from 'react';
import { sound } from '../utils/sound';

/**
 * Global sound interaction listener
 * Attaches intelligent hover and click audio to all interactive UI elements
 */
export const useGlobalSoundEffects = () => {
  useEffect(() => {
    let lastTarget: Element | null = null;

    const handlePointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target === lastTarget) return;

      // Check for Hero letters first
      const letter = target.closest('.hx-letter');
      if (letter) {
        lastTarget = letter;
        const allLetters = Array.from(document.querySelectorAll('.hx-letter'));
        const index = allLetters.indexOf(letter);
        sound.playLetterNote(index >= 0 ? index : 0);
        return;
      }

      // Check for cards or large sections
      const card = target.closest('.showcase-float, .sv-row, [data-sound="card"]');
      if (card && card !== lastTarget) {
        lastTarget = card;
        sound.playHover('card');
        return;
      }

      // Check for regular interactive items
      const interactive = target.closest(
        'a, button, [role="button"], input, textarea, select, [data-sound="hover"]'
      );
      if (interactive && interactive !== lastTarget) {
        lastTarget = interactive;
        sound.playHover('default');
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest('a, button, [role="button"]');
      if (clickable) {
        sound.playClick();
      }
    };

    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);
};

/**
 * Minimalist high-tech Sound Toggle button
 */
export const SoundToggle = ({ className = '' }: { className?: string }) => {
  const [muted, setMuted] = useState(sound.muted);

  useEffect(() => {
    return sound.subscribe((isMuted) => setMuted(isMuted));
  }, []);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        sound.toggleMute();
      }}
      title={muted ? 'Soundeffekte aktivieren' : 'Soundeffekte stummschalten'}
      aria-label={muted ? 'Soundeffekte aktivieren' : 'Soundeffekte stummschalten'}
      className={`group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-all hover:opacity-100 ${
        muted ? 'opacity-40 hover:opacity-75' : 'opacity-85 text-white'
      } ${className}`}
    >
      <span className="hidden sm:inline">SFX</span>
      <span className="flex items-center gap-[2.5px] h-3 px-1 py-0.5 rounded border border-white/20 bg-white/[0.04]">
        {muted ? (
          <span className="text-[9px] text-white/50 leading-none">OFF</span>
        ) : (
          <>
            <span className="w-[2px] h-2 bg-white/90 rounded-full animate-pulse" style={{ animationDuration: '0.8s' }} />
            <span className="w-[2px] h-3 bg-white rounded-full animate-pulse" style={{ animationDuration: '1.2s', animationDelay: '0.2s' }} />
            <span className="w-[2px] h-1.5 bg-white/80 rounded-full animate-pulse" style={{ animationDuration: '0.9s', animationDelay: '0.4s' }} />
          </>
        )}
      </span>
    </button>
  );
};
