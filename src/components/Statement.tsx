import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const text = 'Keine Vorlagen. Kein Baukasten. Jede Seite wird von Grund auf für ein Unternehmen gebaut.';

export const Statement = () => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.st-word',
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: '.st-text', start: 'top 80%', end: 'bottom 40%', scrub: true },
        }
      );
      gsap.fromTo(
        '.st-text',
        { y: 60 },
        { y: -60, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative z-10 px-5 py-16 sm:px-6 sm:py-24 md:px-12 md:py-40">
      <div data-frame className="px-4 py-14 sm:px-8 sm:py-20 md:px-16 md:py-32">
        <p className="st-text max-w-5xl text-2xl font-semibold leading-[1.12] tracking-tight sm:text-3xl md:text-6xl">
          {text.split(' ').map((w, i) => (
            <span key={i} className="st-word inline-block mr-[0.28em]">
              {w}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
};
