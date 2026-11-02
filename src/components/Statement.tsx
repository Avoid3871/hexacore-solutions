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
    <section ref={root} className="relative z-10 px-6 md:px-12 py-24 md:py-40">
      <div data-frame className="px-8 md:px-16 py-20 md:py-32">
        <p className="st-text text-3xl md:text-6xl font-semibold tracking-tight leading-[1.1] max-w-5xl">
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
