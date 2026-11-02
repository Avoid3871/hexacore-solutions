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
    <section id="kontakt" ref={root} className="relative z-10 px-6 md:px-12 pt-32 md:pt-48 pb-24">
      <p className="font-mono text-xs uppercase tracking-widest text-white/50 mb-16">Kontakt</p>
      <h2 className="ct-title font-bold tracking-tighter leading-[0.95] text-[clamp(2.5rem,9vw,8rem)] mb-20">
        <span className="block overflow-hidden pb-[0.08em]">
          <span className="ct-line block">Lassen Sie uns</span>
        </span>
        <span className="block overflow-hidden pb-[0.08em]">
          <span className="ct-line block">etwas bauen.</span>
        </span>
      </h2>

      <form onSubmit={onSubmit} className="ct-form grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl">
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
        <div className="md:col-span-2 flex flex-wrap items-center gap-8 pt-4">
          <button
            type="submit"
            className="px-8 py-4 bg-white text-black font-medium hover:bg-white/80 transition-colors"
          >
            Anfrage senden
          </button>
          <a href={`mailto:${EMAIL}`} className="text-white/60 hover:text-white transition-colors">
            {EMAIL}
          </a>
        </div>
      </form>
    </section>
  );
};
