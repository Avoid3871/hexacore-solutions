import { useEffect, useState } from 'react';
import { GhostFibers } from './GhostFibers';
import { TypewriterText } from './TypewriterText';
import { SoundToggle } from './SoundController';
import { LegalModal, type LegalTab } from './LegalModal';

const showcaseIntro = 'Digitale Auftritte und individuelle Lösungen, gestaltet und entwickelt für Marken, die nicht aussehen wollen wie alle anderen.';

const projects = [
  {
    number: '01',
    title: "Mama's Streetfood Bar",
    type: 'Food & Community',
    description: 'Streetfood aus aller Welt, kreative Events und Gemeinschaftsgefühl – als lebendige digitale Heimat für Mamas Streetfood Bar in Weiden.',
    tags: ['Restaurant', 'Events', 'Web Design'],
    url: 'https://mamas-streetfood-bar.vercel.app/',
    site: 'mamas-streetfood-bar.vercel.app',
    accent: '#fbcfe8',
    layout: 'lg:col-span-7',
    delay: '-1.2s',
    tilt: '-0.7deg',
  },
  {
    number: '02',
    title: 'Sushihaus Weiden',
    type: 'Restaurant Experience',
    description: 'Ein moderner Auftritt für authentische japanische Küche – von Sushi und Ramen bis zu Abholung, Lieferung und Restaurantbesuch.',
    tags: ['Gastronomie', 'UX Design', 'Development'],
    url: 'https://sushihaus.vercel.app/',
    site: 'sushihaus.vercel.app',
    accent: '#fde68a',
    layout: 'lg:col-span-5 lg:mt-0',
    delay: '-3.6s',
    tilt: '0.9deg',
  },
  {
    number: '03',
    title: 'Hexacore Studio',
    type: 'Studio Portfolio',
    description: 'Ein früher Studioauftritt für modernes Webdesign, intuitive UX/UI-Systeme und performante Webshops für ambitionierte Marken.',
    tags: ['Identity', 'UX/UI', 'Webshops'],
    url: 'https://gexacore-juni2.vercel.app/',
    site: 'gexacore-juni2.vercel.app',
    accent: '#bbf7d0',
    layout: 'lg:col-span-5 lg:col-start-2',
    delay: '-2.3s',
    tilt: '0.6deg',
  },
  {
    number: '04',
    title: 'Slavic Soul Weiden',
    type: 'Restaurant Website',
    description: 'Slawische Küche in Weiden mit handgemachten Wareniki, Manti, Borsch und wechselnden Wochenend-Specials – warm und authentisch inszeniert.',
    tags: ['Gastronomie', 'Local Brand', 'Development'],
    url: 'https://webapp-black-six.vercel.app/',
    site: 'webapp-black-six.vercel.app',
    accent: '#e9d5ff',
    layout: 'lg:col-span-6 lg:col-start-7 lg:mt-8',
    delay: '-4.5s',
    tilt: '-0.5deg',
  },
];

export const Showcase = () => {
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('impressum');

  const openLegal = (tab: LegalTab) => {
    setLegalTab(tab);
    setLegalOpen(true);
  };

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Showcase // Hexacore Solutions';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#01030a] text-white">
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <GhostFibers className="h-full w-full" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 text-white mix-blend-difference sm:px-6 sm:py-6 md:px-12">
        <a href="/" className="font-bold tracking-tight transition-opacity hover:opacity-65">
          HEXACORE
        </a>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] sm:gap-8 sm:text-xs">
          <span className="hidden text-white/45 sm:inline">Selected Work // 2026</span>
          <SoundToggle />
          <a href="/" className="inline-flex min-h-11 items-center border-b border-white/35 transition-colors hover:border-white">
            Zurück
          </a>
        </div>
      </header>

      <main className="relative z-10 px-5 pb-24 pt-28 sm:px-6 sm:pb-32 sm:pt-36 md:px-12 md:pt-48">
        <section className="mx-auto max-w-[1500px]">
          <div className="mb-16 grid items-end gap-7 sm:mb-24 sm:gap-10 lg:grid-cols-12 lg:mb-36">
            <div className="lg:col-span-8">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 sm:mb-5 sm:text-xs sm:tracking-[0.28em]">Showcase // Our work</p>
              <h1 className="max-w-5xl text-[clamp(3rem,10vw,10rem)] font-bold leading-[0.84] tracking-[-0.06em]">
                Selected
                <br />
                <span className="text-white/45">Work.</span>
              </h1>
            </div>
            <TypewriterText
              text={showcaseIntro}
              className="max-w-md text-sm leading-relaxed text-white/60 md:text-base lg:col-span-4 lg:pb-3"
            />
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
            {projects.map((project) => (
              <div
                key={project.number}
                className={`showcase-float ${project.layout}`}
                style={{ '--float-delay': project.delay, '--float-tilt': project.tilt } as React.CSSProperties}
              >
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden border border-white/15 bg-black/45 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-white/40 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  <div className="border-b border-white/10 p-3">
                    <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                      <span className="min-w-0 max-w-[calc(100%-3.5rem)] truncate">{project.site}</span>
                      <span className="flex gap-1.5" aria-hidden="true">
                        <i className="h-1.5 w-1.5 rounded-full bg-white/20" />
                        <i className="h-1.5 w-1.5 rounded-full bg-white/20" />
                        <i className="h-1.5 w-1.5 rounded-full bg-white/20" />
                      </span>
                    </div>
                  </div>

                  <div className="relative flex min-h-[210px] items-center overflow-hidden p-6 sm:min-h-[310px] sm:p-10">
                    <div
                      className="absolute inset-0 opacity-[0.12] transition-opacity duration-500 group-hover:opacity-[0.2]"
                      style={{ background: `radial-gradient(circle at 72% 35%, ${project.accent}, transparent 52%)` }}
                    />
                    <div className="absolute right-[-4%] top-[8%] font-mono text-[clamp(8rem,19vw,18rem)] font-bold leading-none text-white/[0.025]">
                      {project.number}
                    </div>
                    <div className="relative z-10">
                      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: project.accent }}>
                        {project.type}
                      </p>
                      <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.045em] sm:text-6xl">{project.title}</h2>
                    </div>
                  </div>

                  <div className="grid gap-6 border-t border-white/10 p-5 sm:grid-cols-[1fr_auto] sm:gap-7 sm:p-8">
                    <div>
                      <p className="max-w-xl text-sm leading-relaxed text-white/55">{project.description}</p>
                      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                        {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                    </div>
                    <span className="self-end font-mono text-xs text-white/50 transition-colors group-hover:text-white">Website öffnen ↗</span>
                  </div>
                </a>
              </div>
            ))}
          </div>

          <section className="mt-20 border-t border-white/10 pt-8 sm:mt-28 sm:pt-10 md:mt-40 md:pt-16">
            <a
              href="https://github.com/Avoid3871?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="group grid grid-cols-[auto_1fr] items-center gap-4 border border-white/15 bg-black/40 p-4 backdrop-blur-md transition-all duration-500 hover:border-white/40 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/70 sm:grid-cols-[auto_1fr_auto] sm:gap-7 sm:p-7"
            >
              <img
                src="https://avatars.githubusercontent.com/u/159593889?v=4"
                alt="GitHub-Profilbild von Avoid3871"
                className="h-16 w-16 rounded-full border border-white/20 object-cover grayscale transition-all duration-500 group-hover:grayscale-0 sm:h-24 sm:w-24"
              />
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">Code // Open Source</p>
                <h2 className="text-2xl font-bold tracking-[-0.04em] sm:text-5xl">Avoid3871</h2>
                <p className="mt-1 text-xs text-white/50 sm:mt-2 sm:text-sm">Hexacore Studio auf GitHub · 11 öffentliche Repositories</p>
              </div>
              <span className="col-span-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 transition-colors group-hover:text-white sm:col-span-1 sm:text-xs">
                Repositories ↗
              </span>
            </a>
          </section>
        </section>
      </main>

      <footer className="relative z-10 flex flex-col items-start justify-between gap-4 border-t border-white/10 px-5 py-7 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35 sm:flex-row sm:items-center sm:px-6 sm:py-8 sm:text-[10px] sm:tracking-[0.18em] md:px-12">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span>© {new Date().getFullYear()} Hexacore Solutions</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <button
            onClick={() => openLegal('impressum')}
            className="transition-colors hover:text-white underline decoration-white/20 hover:decoration-white underline-offset-4"
          >
            Impressum
          </button>
          <button
            onClick={() => openLegal('datenschutz')}
            className="transition-colors hover:text-white underline decoration-white/20 hover:decoration-white underline-offset-4"
          >
            Datenschutz
          </button>
          <button
            onClick={() => openLegal('agb')}
            className="transition-colors hover:text-white underline decoration-white/20 hover:decoration-white underline-offset-4"
          >
            AGB
          </button>
        </div>
        <a href="mailto:contact@hexacore-solutions.de" className="transition-colors hover:text-white">Start a project ↗</a>
      </footer>

      <LegalModal
        isOpen={legalOpen}
        activeTab={legalTab}
        onClose={() => setLegalOpen(false)}
        onTabChange={(tab) => setLegalTab(tab)}
      />
    </div>
  );
};
