declare module 'ascii-magic-art/runtime/player.js' {
  type PieceModule = {
    meta: {
      fps?: number;
      palette?: Record<string, string>;
      cell?: string;
    };
    default: () => (time: number) => string | { text: string; color: string };
  };

  export function play(element: HTMLPreElement, piece: PieceModule, options?: Record<string, unknown>): () => void;
}

declare module 'ascii-magic-art/pieces/jellyfish.js' {
  const piece: {
    meta: {
      fps: number;
      palette: Record<string, string>;
    };
    default: () => (time: number) => string | { text: string; color: string };
  };
  export = piece;
}
