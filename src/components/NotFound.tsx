import { useEffect } from 'react';
import { Ascii } from 'ascii.rest/react';
import { notFound } from 'ascii.rest/pieces';

export const NotFound = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = '404 // Hexacore Solutions';

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(circle at center, black, transparent 78%)',
        }}
      />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 sm:px-6 sm:py-6 md:px-12">
        <a href="/" className="font-bold tracking-tight transition-opacity hover:opacity-70">
          HEXACORE
        </a>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 sm:text-xs">
          Error // 404
        </span>
      </header>

      <main className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-3 py-24 text-center sm:px-4 sm:py-28">
        <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.32em] text-white/40 sm:text-xs">
          Lost in the system
        </div>

        <div className="w-full max-w-4xl overflow-hidden" aria-label="Fehler 404: Seite nicht gefunden">
          <Ascii
            piece={notFound}
            options={{
              code: '404',
              title: 'seite nicht gefunden',
              message: 'diese seite ist umgezogen oder existiert nicht',
            }}
            label="Animierte 404-Anzeige mit einem schwebenden Geist"
            className="mx-auto origin-center scale-[0.56] whitespace-pre font-mono text-[13px] leading-[1.05] text-white sm:scale-75 md:scale-100"
          />
        </div>

        <a
          href="/"
          className="group mt-2 inline-flex items-center gap-3 border border-white/25 px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] transition-colors hover:border-white hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-4 focus:ring-offset-black"
        >
          <span aria-hidden="true">←</span>
          Zur Startseite
          <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
            [01]
          </span>
        </a>
      </main>

      <div className="absolute bottom-6 left-6 right-6 flex justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-white/25 md:left-12 md:right-12">
        <span>Hexacore Solutions</span>
        <span>404 // Not Found</span>
      </div>
    </div>
  );
};
