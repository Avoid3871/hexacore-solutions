import { useState } from 'react';
import { LegalModal, type LegalTab } from './LegalModal';

export const Footer = () => {
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('impressum');

  const openLegal = (tab: LegalTab) => {
    setLegalTab(tab);
    setLegalOpen(true);
  };

  return (
    <>
      <footer className="relative z-10 flex flex-col items-start justify-between gap-6 border-t border-white/15 px-5 py-8 text-xs text-white/50 select-none sm:flex-row sm:flex-wrap sm:items-center sm:px-6 sm:py-10 sm:text-sm md:px-12">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span>© {new Date().getFullYear()} Hexacore Solutions</span>
        </div>

        {/* Legal Links */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
          <button
            onClick={() => openLegal('impressum')}
            className="hover:text-white transition-colors underline decoration-white/20 hover:decoration-white underline-offset-4"
          >
            Impressum
          </button>
          <button
            onClick={() => openLegal('datenschutz')}
            className="hover:text-white transition-colors underline decoration-white/20 hover:decoration-white underline-offset-4"
          >
            Datenschutz
          </button>
          <button
            onClick={() => openLegal('agb')}
            className="hover:text-white transition-colors underline decoration-white/20 hover:decoration-white underline-offset-4"
          >
            AGB
          </button>
        </div>
      </footer>

      {/* Legal Modal Dialog */}
      <LegalModal
        isOpen={legalOpen}
        activeTab={legalTab}
        onClose={() => setLegalOpen(false)}
        onTabChange={(tab) => setLegalTab(tab)}
      />
    </>
  );
};
