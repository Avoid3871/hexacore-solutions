import { useEffect, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  className?: string;
}

export const TypewriterText = ({ text, className = '' }: TypewriterTextProps) => {
  const [visibleText, setVisibleText] = useState('');
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisibleText(text);
      setFinished(true);
      return;
    }

    let index = 0;
    let timeout = 0;

    const typeNext = () => {
      index += 1;
      setVisibleText(text.slice(0, index));

      if (index >= text.length) {
        setFinished(true);
        return;
      }

      const character = text[index - 1];
      const humanVariation = 34 + ((index * 29) % 52);
      const pause = character === ',' ? 220 : character === '.' ? 320 : character === ' ' ? 28 : 0;
      timeout = window.setTimeout(typeNext, humanVariation + pause);
    };

    timeout = window.setTimeout(typeNext, 500);
    return () => window.clearTimeout(timeout);
  }, [text]);

  return (
    <p className={`relative ${className}`} aria-label={text}>
      <span className="invisible" aria-hidden="true">{text}</span>
      <span className="absolute inset-0" aria-hidden="true">
        {visibleText}
        {!finished && <span className="typewriter-cursor">▌</span>}
      </span>
    </p>
  );
};
