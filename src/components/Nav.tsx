import { useEffect, useState } from 'react';
import { SoundToggle } from './SoundController';

const links = [
  { id: 'leistungen', label: 'Leistungen' },
  { id: 'ablauf', label: 'Ablauf' },
  { id: 'kontakt', label: 'Kontakt' },
];

export const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 py-4 text-white mix-blend-difference sm:px-6 sm:py-6 md:px-12">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="min-h-11 font-bold tracking-tight"
        >
          HEXACORE
        </button>

        <nav className="hidden items-center gap-6 text-sm sm:flex md:gap-10">
          {links.map((l) => (
            <button key={l.id} onClick={() => go(l.id)} className="min-h-11 opacity-70 transition-opacity hover:opacity-100">
              {l.label}
            </button>
          ))}
          <a href="/showcase" className="inline-flex min-h-11 items-center opacity-70 transition-opacity hover:opacity-100">Showcase</a>
          <SoundToggle />
        </nav>

        <div className="flex items-center gap-4 sm:hidden">
          <SoundToggle />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex min-h-11 min-w-11 items-center justify-end font-mono text-[10px] uppercase tracking-[0.18em]"
          >
            {menuOpen ? 'Schließen' : 'Menü'}
          </button>
        </div>
      </header>

      <nav
        id="mobile-navigation"
        className={`fixed inset-x-0 top-[76px] z-40 border-y border-white/15 bg-black/95 px-5 py-3 backdrop-blur-xl transition-all duration-300 sm:hidden ${
          menuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-3 opacity-0'
        }`}
      >
        {links.map((l) => (
          <button
            key={l.id}
            onClick={() => go(l.id)}
            className="flex min-h-12 w-full items-center justify-between border-b border-white/10 text-left text-sm"
          >
            {l.label}<span className="font-mono text-white/35">↘</span>
          </button>
        ))}
        <a href="/showcase" className="flex min-h-12 items-center justify-between text-sm">
          Showcase<span className="font-mono text-white/35">↗</span>
        </a>
      </nav>
    </>
  );
};
