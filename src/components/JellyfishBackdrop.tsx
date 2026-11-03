import { useEffect, useRef } from 'react';
import { play } from 'ascii-magic-art/runtime/player.js';
import * as jellyfish from 'ascii-magic-art/pieces/jellyfish.js';

export const JellyfishBackdrop = () => {
  const pre = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const element = pre.current;
    if (!element) return;
    return play(element, jellyfish, { speed: 0.72, still: false });
  }, []);

  return (
    <div className="jellyfish-backdrop pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <pre
        ref={pre}
        className="absolute left-1/2 top-1/2 m-0 -translate-x-1/2 -translate-y-1/2 select-none whitespace-pre font-mono text-[clamp(22px,2.15vw,34px)] leading-[0.72] opacity-[0.16] saturate-75 sm:opacity-[0.22]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_0%,rgba(0,0,0,0.12)_48%,rgba(0,0,0,0.58)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/55" />
    </div>
  );
};
