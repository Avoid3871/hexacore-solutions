import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    n: '01',
    title: 'Websites',
    text: 'Individuell gestaltet und entwickelt. Schnell, klar und genau auf Ihre Marke zugeschnitten.',
  },
  {
    n: '02',
    title: 'Individuelle Lösungen',
    text: 'Konfiguratoren, Kundenportale, Buchungssysteme und Schnittstellen, die zu Ihren Abläufen passen.',
  },
  {
    n: '03',
    title: 'Design & Identität',
    text: 'Visuelle Gestaltung, Typografie und durchdachte Nutzerführung, die Ihre Marke unverwechselbar machen.',
  },
  {
    n: '04',
    title: 'Betreuung',
    text: 'Hosting, Wartung und Weiterentwicklung, damit Ihre Lösung dauerhaft läuft.',
  },
];

export const Services = () => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.sv-row').forEach((row) => {
        gsap.from(row, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 85%' },
        });
        gsap.fromTo(
          row.querySelector('.sv-title'),
          { x: isMobile ? 10 : 40 },
          { x: isMobile ? -10 : -40, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } }
        );
      });
      gsap.from('.sv-head', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.sv-head', start: 'top 85%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="leistungen" ref={root} className="relative z-10 px-5 py-24 sm:px-6 sm:py-32 md:px-12 md:py-48">
      <p className="sv-head mb-10 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:mb-16 sm:text-xs">Leistungen</p>
      <div className="divide-y divide-white/15 border-y border-white/15">
        {services.map((s) => (
          <div key={s.n} className="sv-row grid grid-cols-12 items-center gap-4 py-9 sm:gap-6 sm:py-12 md:py-16">
            <div className="col-span-12 md:col-span-2">
              <div
                data-ring
                className="flex h-14 w-14 items-center justify-center rounded-full font-mono text-xs text-white/80 sm:h-20 sm:w-20 sm:text-sm"
              >
                {s.n}
              </div>
            </div>
            <h3 className="sv-title col-span-12 md:col-span-6 text-4xl md:text-6xl font-semibold tracking-tight">
              {s.title}
            </h3>
            <p className="col-span-12 md:col-span-4 text-white/60 leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
