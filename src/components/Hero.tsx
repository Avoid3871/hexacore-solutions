import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from '../state';

gsap.registerPlugin(ScrollTrigger);

export const Hero = () => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.hx-letter', { yPercent: 115, duration: 1.3, stagger: 0.07 }, 0.2)
        .from('.hx-sub', { opacity: 0, letterSpacing: '1.4em', duration: 1.6 }, 0.9)
        .from('.hx-fade', { opacity: 0, y: 20, duration: 1, stagger: 0.15 }, 1.4)
        .to(state, { intro: 1, duration: 2.6, ease: 'power2.out' }, 0.6);

      gsap.to('.hx-title', {
        yPercent: -30,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative z-10 min-h-screen flex flex-col justify-center px-6 md:px-12">
      <div className="hx-title">
        <h1
          aria-label="Hexacore"
          className="flex font-bold tracking-tighter leading-[0.9] text-[clamp(3rem,15.5vw,15rem)]"
        >
          {'HEXACORE'.split('').map((c, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em]">
              <span className="hx-letter inline-block">{c}</span>
            </span>
          ))}
        </h1>
        <div className="hx-sub mt-2 ml-1 uppercase tracking-[0.5em] text-sm md:text-base text-white/80">
          Solutions
        </div>
      </div>

      <div className="absolute bottom-10 left-6 right-6 md:left-12 md:right-12 flex items-end justify-between">
        <p className="hx-fade max-w-xs text-sm md:text-base text-white/60 leading-relaxed">
          Medienagentur. Wir bauen Websites und individuelle Lösungen.
        </p>
        <span className="hx-fade font-mono text-xs uppercase tracking-widest text-white/50">Scroll ↓</span>
      </div>
    </section>
  );
};
