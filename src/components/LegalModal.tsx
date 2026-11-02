import React, { useEffect } from 'react';

export type LegalTab = 'impressum' | 'datenschutz' | 'agb';

interface LegalModalProps {
  isOpen: boolean;
  activeTab: LegalTab;
  onClose: () => void;
  onTabChange: (tab: LegalTab) => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  activeTab,
  onClose,
  onTabChange,
}) => {
  // Close on Escape key press & prevent background scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[88vh] bg-black border border-white/20 p-6 sm:p-10 flex flex-col justify-between shadow-2xl text-white select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5">
          <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs uppercase">
            <button
              onClick={() => onTabChange('impressum')}
              className={`px-3 py-1.5 transition-colors border ${
                activeTab === 'impressum'
                  ? 'bg-white text-black font-bold border-white'
                  : 'text-white/60 border-white/20 hover:border-white hover:text-white'
              }`}
            >
              Impressum
            </button>
            <button
              onClick={() => onTabChange('datenschutz')}
              className={`px-3 py-1.5 transition-colors border ${
                activeTab === 'datenschutz'
                  ? 'bg-white text-black font-bold border-white'
                  : 'text-white/60 border-white/20 hover:border-white hover:text-white'
              }`}
            >
              Datenschutz
            </button>
            <button
              onClick={() => onTabChange('agb')}
              className={`px-3 py-1.5 transition-colors border ${
                activeTab === 'agb'
                  ? 'bg-white text-black font-bold border-white'
                  : 'text-white/60 border-white/20 hover:border-white hover:text-white'
              }`}
            >
              AGB
            </button>
          </div>

          <button
            onClick={onClose}
            className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 border border-white/30 hover:border-white hover:bg-white hover:text-black transition-all flex items-center gap-1.5"
            aria-label="Schließen"
          >
            <span>Schließen</span>
            <span>✕</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-2 sm:pr-4 py-6 space-y-8 text-sm text-white/80 leading-relaxed font-sans scrollbar-thin">
          {activeTab === 'impressum' && (
            <div className="space-y-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-1">
                  // RECHTLICHE ANGABEN GEMÄß § 5 DDG (DIGITALE-DIENSTE-GESETZ)
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Impressum</h2>
              </div>

              <div className="space-y-3 border-l-2 border-white/20 pl-4">
                <p className="font-semibold text-white">Hexacore Solutions</p>
                <p className="text-white/70">
                  Medienagentur für Webentwicklung &amp; digitale Individuallösungen<br />
                  Musterstraße 42<br />
                  10115 Berlin, Deutschland
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono text-xs uppercase tracking-wider text-white/50">Kontakt</h3>
                <p>
                  E-Mail:{' '}
                  <a
                    href="mailto:contact@hexacore-solutions.de"
                    className="text-white underline hover:opacity-80"
                  >
                    contact@hexacore-solutions.de
                  </a>
                  <br />
                  Telefon: +49 (0) 30 8920 4400<br />
                  Internet: www.hexacore-solutions.de
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono text-xs uppercase tracking-wider text-white/50">
                  Vertretungsberechtigte Personen
                </h3>
                <p>Geschäftsführung: Bruno Fischer (Inhaber / Lead Developer)</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono text-xs uppercase tracking-wider text-white/50">
                  Umsatzsteuer-Identifikationsnummer
                </h3>
                <p>
                  Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                  <span className="font-mono text-white">DE 394 882 104</span>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono text-xs uppercase tracking-wider text-white/50">
                  Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
                </h3>
                <p>
                  Bruno Fischer<br />
                  Musterstraße 42<br />
                  10115 Berlin
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-white/60">
                <h4 className="font-semibold text-white/70 uppercase">EU-Streitschlichtung</h4>
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                  <a
                    href="https://ec.europa.eu/consumers/odr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-white/80"
                  >
                    https://ec.europa.eu/consumers/odr
                  </a>
                  .<br />
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                  Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'datenschutz' && (
            <div className="space-y-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-1">
                  // DATENSCHUTZERKLÄRUNG NACH DSGVO (ART. 13 &amp; 14)
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Datenschutzerklärung
                </h2>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white">1. Datenschutz auf einen Blick</h3>
                <p>
                  Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
                  personenbezogenen Daten vertraulich und entsprechend den gesetzlichen
                  Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                </p>
                <p className="text-white/70">
                  Diese Website kommt vollständig ohne invasive Tracking-Tools (wie Google Analytics, Meta Pixel)
                  und ohne Werbe-Cookies aus.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white">2. Verantwortliche Stelle</h3>
                <div className="border-l-2 border-white/20 pl-4 text-white/70">
                  Hexacore Solutions<br />
                  Musterstraße 42, 10115 Berlin<br />
                  E-Mail: contact@hexacore-solutions.de
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white">3. Datenerfassung auf dieser Website</h3>
                <h4 className="font-mono text-xs uppercase tracking-wider text-white/60">
                  Server-Log-Dateien
                </h4>
                <p>
                  Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten
                  Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt:
                </p>
                <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-white/70">
                  <li>Browsertyp und Browserversion</li>
                  <li>Verwendetes Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>Uhrzeit der Serveranfrage</li>
                  <li>IP-Adresse (anonymisiert)</li>
                </ul>
                <p className="text-xs text-white/60">
                  Grundlage für die Datenverarbeitung ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an
                  der technisch fehlerfreien Darstellung und Optimierung der Website).
                </p>

                <h4 className="font-mono text-xs uppercase tracking-wider text-white/60 pt-2">
                  Kontaktformular &amp; E-Mail-Kontakt
                </h4>
                <p>
                  Wenn Sie uns per Kontaktformular oder E-Mail Anfragen zukommen lassen, werden Ihre Angaben aus
                  dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung
                  der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir
                  nicht ohne Ihre Einwilligung weiter.
                </p>
                <p className="text-xs text-white/60">
                  Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre
                  Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher
                  Maßnahmen erforderlich ist.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white">4. Ihre Rechte als betroffene Person</h3>
                <p>
                  Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf
                  unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und
                  Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder
                  Löschung dieser Daten.
                </p>
                <p>Hierzu sowie zu weiteren Fragen können Sie sich jederzeit an uns wenden.</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-white/60">
                <h4 className="font-semibold text-white/70 uppercase">SSL- bzw. TLS-Verschlüsselung</h4>
                <p>
                  Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte
                  eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie an dem Schloss-Symbol
                  in Ihrer Browserzeile und an https://.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'agb' && (
            <div className="space-y-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-1">
                  // ALLGEMEINE GESCHÄFTSBEDINGUNGEN FÜR DIGITALE DIENSTLEISTUNGEN
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Allgemeine Geschäftsbedingungen (AGB)
                </h2>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white">§ 1 Geltungsbereich &amp; Vertragsgegenstand</h3>
                <p>
                  Diese Geschäftsbedingungen gelten für alle Verträge zwischen Hexacore Solutions (nachfolgend
                  „Agentur“) und Auftraggebern über die Konzeption, Gestaltung und technische Entwicklung von
                  Websites, Web-Applikationen und individuellen Softwarelösungen.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white">§ 2 Leistungsumfang &amp; Projektablauf</h3>
                <p>
                  Der genaue Leistungsumfang wird im jeweiligen individuellen Angebot oder Lastenheft
                  festgelegt. Die Umsetzung erfolgt nach agilen Meilensteinen mit regelmäßigen
                  Zwischenabnahmen durch den Kunden.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white">§ 3 Urheberrecht &amp; Nutzungsrechte</h3>
                <p>
                  Nach vollständiger Bezahlung der vereinbarten Vergütung erhält der Auftraggeber das räumlich
                  und zeitlich unbeschränkte, ausschließliche Nutzungsrecht an dem für ihn individuell erstellten
                  Source Code und Design.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white">§ 4 Vergütung &amp; Zahlungsbedingungen</h3>
                <p>
                  Sofern nicht anders vereinbart, erfolgt die Rechnungsstellung in transparenten Meilensteinen
                  (Anzahlung bei Projektstart, Zwischenabnahme, Endabnahme vor Livegang). Zahlungsziel: 14 Tage
                  ohne Abzug.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white">§ 5 Gewährleistung &amp; Support</h3>
                <p>
                  Die Agentur gewährleistet, dass die erstellte Software den vereinbarten Spezifikationen
                  entspricht und auf modernen Standard-Browsern fehlerfrei funktioniert. Nach dem Livegang steht
                  auf Wunsch ein kontinuierlicher Wartungsvertrag bereit.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-white/50 font-mono">
          <span>HEXACORE SOLUTIONS // LEGAL DEPT</span>
          <span>STAND: {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
};
