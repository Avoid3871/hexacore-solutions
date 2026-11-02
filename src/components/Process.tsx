import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { n: '01', title: 'Gespräch', text: 'Wir hören zu, klären Ziele und Rahmen und sagen ehrlich, was sinnvoll ist.' },
  { n: '02', title: 'Konzept', text: 'Struktur, Design und Funktionsumfang, abgestimmt, bevor die erste Zeile Code entsteht.' },
  { n: '03', title: 'Umsetzung', text: 'Entwicklung mit regelmäßigen Zwischenständen, die Sie jederzeit ansehen können.' },
  { n: '04', title: 'Launch', text: 'Test, Livegang und Übergabe. Auf Wunsch betreuen wir die Lösung weiter.' },
];

export const Process = () => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.pr-step').forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: 80,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
        gsap.to(el, {
          y: i % 2 === 0 ? -40 : 40,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="ablauf" ref={root} className="relative z-10 px-6 md:px-12 py-32 md:py-48">
      <p className="font-mono text-xs uppercase tracking-widest text-white/50 mb-16">Ablauf</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
        {steps.map((s) => (
          <div key={s.n} className="pr-step border-t border-white/20 pt-6">
            <div className="font-mono text-xs text-white/50 mb-6">{s.n}</div>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">{s.title}</h3>
            <p className="text-white/60 leading-relaxed text-sm md:text-base">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
