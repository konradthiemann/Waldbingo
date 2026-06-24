import { useEffect } from 'react'
import { Glyph } from '../Svg'

export type LegalPage = 'impressum' | 'datenschutz'

interface Props {
  page: LegalPage
  onClose: () => void
  onNavigate: (page: LegalPage) => void
}

/** Rechtstexte (Impressum & Datenschutz), an Waldbingo angepasst. */
export function LegalView({ page, onClose, onNavigate }: Props) {
  // Bei Seitenwechsel an den Anfang scrollen.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [page])

  // Escape schließt die Rechtstexte.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="anim-fade">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-forest-700 shadow-wb1 hover:bg-line-2"
        >
          <Glyph name="leaf" className="block h-4 w-4 text-forest-600" />
          Zurück zum Spiel
        </button>
        <div className="ml-auto flex gap-1.5">
          <Tab active={page === 'impressum'} onClick={() => onNavigate('impressum')}>
            Impressum
          </Tab>
          <Tab active={page === 'datenschutz'} onClick={() => onNavigate('datenschutz')}>
            Datenschutz
          </Tab>
        </div>
      </div>

      <article className="rounded-lg border border-line bg-white px-5 py-6 shadow-wb1 sm:px-8 sm:py-8">
        {page === 'impressum' ? <Impressum /> : <Datenschutz />}
      </article>
    </div>
  )
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={
        'focus-ring rounded-full px-3 py-1.5 text-[12.5px] font-bold transition ' +
        (active
          ? 'bg-forest-700 text-white shadow-wb1'
          : 'bg-white text-forest-700 shadow-wb1 hover:bg-line-2')
      }
    >
      {children}
    </button>
  )
}

// ── Typografie-Bausteine ─────────────────────────────────────────────────────
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 mt-7 text-[18px] font-extrabold text-forest-900 first:mt-0">{children}</h2>
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1 mt-4 text-[14.5px] font-extrabold text-amber-600">{children}</h3>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="my-2 text-[14.5px] leading-relaxed text-ink">{children}</p>
}

function Stand() {
  return <p className="mb-5 text-[12.5px] font-semibold text-muted">Stand: 24. Juni 2026</p>
}

function Address() {
  return (
    <address className="my-2 text-[14.5px] not-italic leading-relaxed text-ink">
      Konrad Thiemann
      <br />
      Olfermannstr. 7
      <br />
      38102 Braunschweig
      <br />
      Deutschland
    </address>
  )
}

// ── Impressum ────────────────────────────────────────────────────────────────
function Impressum() {
  return (
    <>
      <h1 className="text-[24px] font-extrabold text-forest-900">Impressum</h1>
      <Stand />

      <H2>Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</H2>
      <Address />

      <H3>Kontakt</H3>
      <P>
        Telefon: 0161 67325218
        <br />
        E-Mail:{' '}
        <a className="text-forest-700 underline" href="mailto:konrad.thiemann@gmail.com">
          konrad.thiemann@gmail.com
        </a>
      </P>

      <H3>Verantwortlich für den Inhalt</H3>
      <P>Konrad Thiemann (Anschrift wie oben)</P>

      <H2>Art des Angebots</H2>
      <P>
        Waldbingo ist ein privates, nicht-kommerzielles Projekt – ein Such-Spiel für den Wald, das als
        offline-fähige Web-App (PWA) bereitgestellt wird. Es werden keine Waren oder Dienstleistungen
        entgeltlich angeboten; die Nutzung ist kostenlos.
      </P>

      <H2>Verbraucherstreitbeilegung</H2>
      <P>
        Es besteht keine Verpflichtung und keine Bereitschaft zur Teilnahme an einem
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle.
      </P>

      <H2>Haftung für Inhalte</H2>
      <P>
        Die Inhalte dieser Anwendung wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit,
        Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Als
        Diensteanbieter bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte nach den allgemeinen Gesetzen
        verantwortlich. Nach §§ 8 bis 10 DDG bin ich als Diensteanbieter jedoch nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
        forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </P>

      <H2>Haftung für Links</H2>
      <P>
        Diese Anwendung kann Links zu externen Websites Dritter enthalten, auf deren Inhalte ich keinen
        Einfluss habe. Für diese fremden Inhalte kann keine Gewähr übernommen werden. Für die Inhalte der
        verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
      </P>

      <H2>Urheberrecht</H2>
      <P>
        Die durch den Betreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
        Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb
        der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw.
        Erstellers.
      </P>

      <H2>Bildnachweise und Drittinhalte</H2>
      <P>
        Waldbingo verwendet Inhalte Dritter unter den jeweiligen Lizenzen: Symbole stammen von{' '}
        <a
          className="text-forest-700 underline"
          href="https://openmoji.org"
          target="_blank"
          rel="noreferrer"
        >
          OpenMoji
        </a>{' '}
        (CC BY-SA 4.0). Arten-Informationen und Fotos stammen von iNaturalist, das Kartenmaterial von
        © OpenStreetMap-Mitwirkenden, die Wetterdaten von Open-Meteo. Die Rechte an den jeweiligen
        Inhalten verbleiben bei den genannten Anbietern bzw. Urhebern.
      </P>
    </>
  )
}

// ── Datenschutzerklärung ─────────────────────────────────────────────────────
function Datenschutz() {
  return (
    <>
      <h1 className="text-[24px] font-extrabold text-forest-900">Datenschutzerklärung</h1>
      <Stand />

      <H2>1. Verantwortlicher</H2>
      <P>
        Verantwortlich für die Verarbeitung personenbezogener Daten in dieser Anwendung im Sinne der
        Datenschutz-Grundverordnung (DSGVO) ist:
      </P>
      <Address />
      <P>
        Telefon: 0161 67325218
        <br />
        E-Mail:{' '}
        <a className="text-forest-700 underline" href="mailto:konrad.thiemann@gmail.com">
          konrad.thiemann@gmail.com
        </a>
      </P>

      <H2>2. Überblick</H2>
      <P>
        Waldbingo ist ein privates, kostenloses Such-Spiel für den Wald, das als Web-App (PWA)
        bereitgestellt wird. Es gibt kein Nutzerkonto und keine Anmeldung. Deine Spielstände und
        Einstellungen werden ausschließlich lokal auf deinem Gerät in deinem Browser gespeichert und
        nicht an einen Server des Betreibers übertragen. Deine Daten werden nicht verkauft und nicht zu
        Werbezwecken an Dritte weitergegeben. Personenbezogene Daten werden nur in dem Umfang
        verarbeitet, der für den Betrieb der Anwendung und ihre Funktionen (Karte, Wetter, regionale
        Arten) erforderlich ist.
      </P>

      <H2>3. Hosting und Auslieferung</H2>
      <P>
        Diese Anwendung wird bei Railway gehostet (Railway Corp., USA). Als Server-Region ist eine
        Region innerhalb der Europäischen Union (Europe West) gewählt, sodass die beim Betrieb
        anfallenden Daten innerhalb der EU verarbeitet werden. Beim Aufruf werden die Programmdateien der
        Anwendung von den Servern des Anbieters an deinen Browser ausgeliefert; eine zentrale Datenbank
        mit deinen Spielinhalten wird dabei nicht geführt.
      </P>
      <P>
        Railway verarbeitet die beim Aufruf anfallenden Daten – insbesondere Server-Logfiles – in meinem
        Auftrag auf Grundlage eines Vertrags über Auftragsverarbeitung gemäß Art. 28 DSGVO.
        Rechtsgrundlage für den Einsatz ist mein berechtigtes Interesse an einem stabilen und sicheren
        Betrieb der Anwendung (Art. 6 Abs. 1 lit. f DSGVO).
      </P>
      <P>
        Da der Anbieter Railway Corp. ein US-Unternehmen ist, kann ein Zugriff aus den USA nicht
        vollständig ausgeschlossen werden. Soweit personenbezogene Daten in ein Drittland übermittelt
        werden, erfolgt dies auf Grundlage der Standardvertragsklauseln der EU-Kommission bzw. eines
        geeigneten Angemessenheitsbeschlusses (EU-US Data Privacy Framework).
      </P>

      <H2>4. Server-Logfiles</H2>
      <P>
        Beim Aufruf der Anwendung werden automatisch Informationen in sogenannten Server-Logfiles
        erfasst, die dein Browser übermittelt: Browsertyp und -version, verwendetes Betriebssystem,
        Referrer-URL, Zeitpunkt der Serveranfrage sowie die IP-Adresse. Diese Daten werden nicht mit
        anderen Datenquellen zusammengeführt und dienen dem störungsfreien und sicheren Betrieb der
        Anwendung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
      </P>

      <H2>5. Cookies und lokale Speicherung</H2>
      <P>
        Diese Anwendung setzt keine Cookies und verwendet keine Tracking- oder Analyse-Werkzeuge. Für
        den Offline-Betrieb und zum Speichern deines Spielstands werden ausschließlich technisch
        notwendige Speichermechanismen deines Browsers genutzt: ein Service Worker mit Cache-Speicher
        (damit die App offline funktioniert) sowie eine lokale Datenbank (IndexedDB). Diese Daten
        verbleiben ausschließlich auf deinem Gerät; eine Einwilligung ist hierfür nicht erforderlich
        (§ 25 Abs. 2 Nr. 2 TDDDG). Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. f DSGVO.
      </P>

      <H2>6. Lokal gespeicherte Spieldaten</H2>
      <P>
        Im Rahmen der Nutzung speichert die Anwendung folgende Daten ausschließlich lokal in deinem
        Browser (IndexedDB): das aktuell laufende Spiel (Bingo-Karten, abgehakte Felder, Spielerzahl),
        deine zuletzt verwendeten Einstellungen (u. a. ein grob gerundeter Standort und das zuletzt
        abgerufene Wetter) sowie einen Zwischenspeicher für geladene Arten und Bilder, um wiederholte
        Abrufe zu vermeiden. Diese Daten werden nicht an einen Server des Betreibers übertragen, sind nur
        auf deinem Gerät vorhanden und können von dir jederzeit durch Verlassen des Spiels oder Löschen
        der Browserdaten entfernt werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
      </P>

      <H2>7. Standortdaten</H2>
      <P>
        Wenn du die Funktion „Mein Standort“ nutzt, fragt dein Browser deine Zustimmung zur Standortabfrage
        ab. Deine Koordinaten werden dann verarbeitet, um die Karte zu zentrieren, das Wetter sowie
        regional passende Arten in deiner Umgebung zu ermitteln. Die Koordinaten können in grob gerundeter
        Form lokal in deinem Browser gespeichert werden (siehe Ziffer 6). Rechtsgrundlage ist deine
        Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sowie das berechtigte Interesse an der Bereitstellung
        der Standortfunktionen (Art. 6 Abs. 1 lit. f DSGVO). Du kannst die Standortabfrage ablehnen; die
        Anwendung bleibt nutzbar, indem du deinen Ort direkt auf der Karte antippst.
      </P>

      <H2>8. Externe Dienste (Karte, Wetter, Arten)</H2>
      <P>
        Um Karte, Wetter und regionale Arten bereitzustellen, ruft die Anwendung – nur wenn du online
        bist – Inhalte von folgenden Drittanbietern direkt aus deinem Browser ab. Dabei wird technisch
        bedingt deine IP-Adresse und ggf. der ausgewählte Standort (Koordinaten) an den jeweiligen
        Anbieter übermittelt. Rechtsgrundlage ist jeweils das berechtigte Interesse an der Bereitstellung
        dieser Funktionen (Art. 6 Abs. 1 lit. f DSGVO):
      </P>
      <P>
        <b>OpenStreetMap</b> – Kartenkacheln und Reverse-Geocoding (OpenStreetMap Foundation, Vereinigtes
        Königreich) über tile.openstreetmap.org und nominatim.openstreetmap.org.
        <br />
        <b>Open-Meteo</b> – Wetter- und Höhendaten (Open-Meteo, Schweiz) über api.open-meteo.com.
        <br />
        <b>iNaturalist</b> – Arten-Informationen und Fotos (California Academy of Sciences, USA) über
        api.inaturalist.org. Da es sich um einen US-Anbieter handelt, kann dabei eine Übermittlung in die
        USA erfolgen; diese stützt sich auf die Standardvertragsklauseln bzw. das EU-US Data Privacy
        Framework.
      </P>
      <P>
        Diese Dienste werden ausschließlich zur Bereitstellung der genannten Funktionen kontaktiert. Im
        Offline-Modus erfolgt kein Abruf; bereits erstellte Spiele bleiben spielbar.
      </P>

      <H2>9. Empfänger der Daten</H2>
      <P>
        Empfänger bzw. Kategorien von Empfängern personenbezogener Daten sind der Hosting-Anbieter
        (Railway) als Auftragsverarbeiter sowie die unter Ziffer 8 genannten Anbieter von Karten-, Wetter-
        und Artendaten. Eine darüber hinausgehende Weitergabe an Dritte findet nicht statt, es sei denn,
        ich bin gesetzlich dazu verpflichtet.
      </P>

      <H2>10. Speicherdauer</H2>
      <P>
        Lokal gespeicherte Spieldaten verbleiben so lange auf deinem Gerät, bis du das Spiel verlässt, die
        Daten überschreibst oder die Speicherdaten deines Browsers löschst. Zwischengespeicherte Arten
        werden automatisch nach kurzer Zeit verworfen (Zwischenspeicher mit begrenzter Gültigkeit).
        Server-Logfiles werden nur für einen kurzen Zeitraum gespeichert und anschließend gelöscht.
        Gesetzliche Aufbewahrungspflichten bleiben unberührt.
      </P>

      <H2>11. Deine Rechte</H2>
      <P>
        Du hast jederzeit das Recht auf Auskunft über die zu deiner Person gespeicherten Daten (Art. 15
        DSGVO), Berichtigung unrichtiger Daten (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung
        der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) sowie Widerspruch gegen die
        Verarbeitung (Art. 21 DSGVO). Soweit eine Verarbeitung auf einer Einwilligung beruht, kannst du
        diese jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO). Da die meisten Daten
        ausschließlich lokal in deinem Browser gespeichert werden, kannst du sie zudem jederzeit selbst
        durch Löschen der Browserdaten entfernen. Zur Ausübung deiner Rechte genügt eine Nachricht an die
        oben genannte Kontaktadresse.
      </P>

      <H2>12. Beschwerderecht bei der Aufsichtsbehörde</H2>
      <P>
        Unbeschadet anderweitiger Rechtsbehelfe steht dir das Recht zu, dich bei einer
        Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO). Die zuständige Aufsichtsbehörde ist:
      </P>
      <P>
        Die Landesbeauftragte für den Datenschutz Niedersachsen
        <br />
        Prinzenstraße 5, 30159 Hannover
        <br />
        Postfach 221, 30002 Hannover
        <br />
        Telefon: 0511 120-4500
        <br />
        E-Mail:{' '}
        <a className="text-forest-700 underline" href="mailto:poststelle@lfd.niedersachsen.de">
          poststelle@lfd.niedersachsen.de
        </a>
        <br />
        <a
          className="text-forest-700 underline"
          href="https://www.lfd.niedersachsen.de"
          target="_blank"
          rel="noreferrer"
        >
          www.lfd.niedersachsen.de
        </a>
      </P>

      <H2>13. SSL-/TLS-Verschlüsselung</H2>
      <P>
        Diese Anwendung nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine
        verschlüsselte Verbindung erkennst du daran, dass die Adresszeile des Browsers mit „https://“
        beginnt. Bei aktiver Verschlüsselung können die Daten, die du an die Anwendung übermittelst, nicht
        von Dritten mitgelesen werden.
      </P>

      <H2>14. Pflicht zur Bereitstellung</H2>
      <P>
        Für die Nutzung von Waldbingo ist kein Nutzerkonto und keine Angabe personenbezogener Daten
        erforderlich. Die Freigabe deines Standorts ist freiwillig; ohne sie kannst du deinen Ort
        stattdessen manuell auf der Karte wählen und die Anwendung uneingeschränkt nutzen.
      </P>
    </>
  )
}
