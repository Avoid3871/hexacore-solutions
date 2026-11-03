import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from '../state';

gsap.registerPlugin(ScrollTrigger);

const TITLE_COLORS = ['#ffffff', '#fce7f3', '#fbcfe8', '#fde68a', '#bbf7d0', '#d1fae5', '#e9d5ff', '#ffffff'];

export const Hero = () => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
      intro
        .from('.hx-sub', { opacity: 0, letterSpacing: '1.4em', duration: 1.6 }, 0.9)
        .from('.hx-fade', { opacity: 0, y: 20, duration: 1, stagger: 0.15 }, 1.4)
        .to(state, { intro: 1, duration: 2.6, ease: 'power2.out' }, 0.6);

      const letters = gsap.utils.toArray<HTMLElement>('.hx-letter');
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        gsap.set(letters, { y: 0, opacity: 1, scaleX: 1, scaleY: 1 });
      } else {
        const dropHeight = -Math.max(window.innerHeight * 0.72, 420);
        const bounce = gsap.timeline();

        bounce.set(letters, {
          y: dropHeight,
          opacity: 0,
          scaleX: 0.92,
          scaleY: 1.08,
          transformOrigin: '50% 100%',
        });

        letters.forEach((letter, index) => {
          const at = 0.18 + index * 0.13;

          bounce
            .to(letter, { y: 0, opacity: 1, scaleX: 1, scaleY: 1, duration: 0.68, ease: 'power2.in' }, at)
            .to(letter, { scaleX: 1.09, scaleY: 0.72, duration: 0.08, ease: 'power2.out' }, at + 0.68)
            .to(letter, { y: '-0.2em', scaleX: 0.96, scaleY: 1.06, duration: 0.2, ease: 'power2.out' }, at + 0.76)
            .to(letter, { y: 0, scaleX: 1, scaleY: 1, duration: 0.28, ease: 'bounce.out' }, at + 0.96);
        });
      }

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
    <section ref={root} className="relative z-10 flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 sm:px-6 md:px-12">
      <div className="hx-title">
        <h1
          aria-label="Hexacore"
          className="flex font-bold tracking-tighter leading-[0.9] text-[clamp(3rem,15.5vw,15rem)] [filter:drop-shadow(0_0_18px_rgba(255,255,255,0.08))]"
        >
          {'HEXACORE'.split('').map((c, i) => (
            <span key={i} className="inline-block pb-[0.06em]">
              <span className="hx-letter inline-block will-change-transform cursor-pointer transition-transform duration-200 hover:-translate-y-2 hover:scale-105 active:scale-95" style={{ color: TITLE_COLORS[i] }}>
                {c}
              </span>
            </span>
          ))}
        </h1>
        <div aria-hidden="true" className="mt-1 flex items-center gap-3 text-white/30">
          <span className="h-px flex-1 bg-white/25" />
          <span className="font-mono text-[9px] tracking-[0.45em]">· · · · · · · ·</span>
          <span className="h-px flex-1 bg-white/25" />
        </div>
        <div className="hx-sub ml-1 mt-2 text-xs uppercase tracking-[0.42em] text-white/80 sm:text-sm sm:tracking-[0.5em] md:text-base">
          Solutions
        </div>
      </div>

      <div className="absolute bottom-6 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-10 sm:left-6 sm:right-6 md:left-12 md:right-12">
        <p className="hx-fade max-w-[75%] text-xs leading-relaxed text-white/60 sm:max-w-xs sm:text-sm md:text-base">
          Medienagentur. Wir bauen Websites und individuelle Lösungen.
        </p>
        <span className="hx-fade shrink-0 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:text-xs">Scroll ↓</span>
      </div>
    </section>
  );
};
