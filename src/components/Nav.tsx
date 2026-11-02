import { useEffect } from 'react';

const links = [
  { id: 'leistungen', label: 'Leistungen' },
  { id: 'ablauf', label: 'Ablauf' },
  { id: 'kontakt', label: 'Kontakt' },
];

export const Nav = () => {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 mix-blend-difference text-white">
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-bold tracking-tight">
        HEXACORE
      </button>
      <nav className="flex items-center gap-6 md:gap-10 text-sm">
        {links.map((l) => (
          <button key={l.id} onClick={() => go(l.id)} className="opacity-70 hover:opacity-100 transition-opacity">
            {l.label}
          </button>
        ))}
      </nav>
    </header>
  );
};
