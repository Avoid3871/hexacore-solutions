import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Background } from './components/Background';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Statement } from './components/Statement';
import { Process } from './components/Process';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export const App = () => {
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative bg-black text-white min-h-screen">
      <Background />
      <Nav />
      <main>
        <Hero />
        <Services />
        <Statement />
        <Process />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
