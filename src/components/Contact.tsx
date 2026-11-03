import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EMAIL = 'contact@hexacore-solutions.de';

export const Contact = () => {
  const root = useRef<HTMLElement>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ct-line', {
        yPercent: 110,
        duration: 1.2,
        stagger: 0.12,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.ct-title', start: 'top 80%' },
      });
      gsap.from('.ct-form', {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ct-form', start: 'top 90%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Anfrage von ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n${form.name}\n${form.email}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  const field =
    'w-full bg-transparent border-b border-white/25 focus:border-white outline-none py-4 text-lg placeholder:text-white/30 transition-colors';

  return (
    <section id="kontakt" ref={root} className="relative z-10 px-5 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-32 md:px-12 md:pt-48">
      <p className="mb-10 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:mb-16 sm:text-xs">Kontakt</p>
      <h2 className="ct-title mb-12 text-[clamp(2.5rem,9vw,8rem)] font-bold leading-[0.95] tracking-tighter sm:mb-20">
        <span className="block overflow-hidden pb-[0.08em]">
          <span className="ct-line block">Lassen Sie uns</span>
        </span>
        <span className="block overflow-hidden pb-[0.08em]">
          <span className="ct-line block">etwas bauen.</span>
        </span>
      </h2>

      <form onSubmit={onSubmit} className="ct-form grid max-w-5xl gap-x-12 gap-y-5 md:grid-cols-2 md:gap-y-6">
        <input className={field} name="name" placeholder="Name" required value={form.name} onChange={onChange} />
        <input
          className={field}
          name="email"
          type="email"
          placeholder="E-Mail"
          required
          value={form.email}
          onChange={onChange}
        />
        <textarea
          className={`${field} md:col-span-2 resize-none`}
          name="message"
          rows={4}
          placeholder="Worum geht es?"
          required
          value={form.message}
          onChange={onChange}
        />
        <div className="flex flex-col items-stretch gap-5 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8 md:col-span-2">
          <button
            type="submit"
            className="min-h-12 bg-white px-7 py-3.5 font-medium text-black transition-colors hover:bg-white/80 sm:px-8 sm:py-4"
          >
            Anfrage senden
          </button>
          <a href={`mailto:${EMAIL}`} className="break-all text-sm text-white/60 transition-colors hover:text-white sm:text-base">
            {EMAIL}
          </a>
        </div>
      </form>
    </section>
  );
};
