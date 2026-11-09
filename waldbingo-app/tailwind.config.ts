import type { Config } from 'tailwindcss'

// Wald-Designsystem „Gemütlicher Wald“ (Spielwelt mit Wingo).
// Kernfarben bleiben konstant; die Szene (Himmel, Bäume, Licht) wird zur
// Laufzeit über CSS-Variablen aus src/lib/scene.ts gesetzt (--sc-*).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#0f2617',
          900: '#14331f',
          800: '#1a4429',
          700: '#1f5b38',
          600: '#2f7d4f',
          500: '#3f9d63',
          400: '#5fb87c',
          300: '#8ed3a0',
          200: '#bfe6c9',
          100: '#dcefe1',
        },
        // Wingos Fell / Moos-Akzent
        moss: { DEFAULT: '#5bb88a', dark: '#3f9a70', deep: '#2f7d63', light: '#d8f3dc' },
        bark: { DEFAULT: '#a06d44', dark: '#7a4f2e', light: '#d9b48f' },
        // Holz für Schilder/Rahmen
        wood: { DEFAULT: '#b98352', dark: '#8a5a33', light: '#e2bb8c', lip: '#6e4426' },
        // Papier-Oberflächen (Panels)
        cream: { DEFAULT: '#fff8ec', 2: '#fbefd9', 3: '#f3e2c4', line: '#ead8b8' },
        amber: { DEFAULT: '#e8913c', 600: '#c4702f' },
        sun: { DEFAULT: '#f3c44d', light: '#ffe08a', dark: '#d9a21f' },
        berry: { DEFAULT: '#e85d75', dark: '#c2405a', light: '#ffc2cd' },
        sky: { DEFAULT: '#7cc6f2', dark: '#3f8fc4', light: '#d4eefc' },
        night: { DEFAULT: '#1b2447', deep: '#0e1430', light: '#3a4a86' },
        ink: '#1d2a22',
        muted: '#62716a',
        line: { DEFAULT: '#e3eae2', 2: '#eef3ec' },
        wbg: '#eaf1e8',
        card: '#ffffff',
        ok: { DEFAULT: '#2f9e54', bg: '#dcf3e2', line: '#8fd6a5' },
        // Kategorie-Farben (Modal-Pille, Foto-Rahmen)
        kat: {
          tier: '#c4702f',
          vogel: '#3f7fb8',
          insekt: '#e8913c',
          pflanze: '#2f9e54',
          baum: '#8a5a36',
          pilz: '#d8564c',
          spur: '#6e787d',
          landschaft: '#2f9e8e',
        },
      },
      borderRadius: {
        sm: '10px',
        DEFAULT: '14px',
        lg: '20px',
        xl: '26px',
        '2xl': '32px',
      },
      boxShadow: {
        wb1: '0 1px 2px rgba(20,51,31,.06), 0 2px 8px rgba(20,51,31,.05)',
        wb2: '0 6px 22px rgba(20,51,31,.10)',
        wb3: '0 18px 50px rgba(20,51,31,.22)',
        // Weiche „schwebende“ Panels über der Szene
        panel: '0 2px 0 rgba(255,255,255,.7) inset, 0 10px 30px rgba(15,38,23,.22), 0 2px 6px rgba(15,38,23,.12)',
        // Innerer Glanz für Kacheln
        tile: '0 1.5px 0 rgba(255,255,255,.85) inset, 0 3px 0 rgba(110,68,38,.18), 0 6px 14px rgba(15,38,23,.12)',
        glow: '0 0 0 3px rgba(243,196,77,.55), 0 0 22px rgba(243,196,77,.65)',
      },
      fontFamily: {
        // Display: Überschriften, Buttons, Zahlen. Body: Fließtext.
        display: ['"Fredoka Variable"', 'Fredoka', 'system-ui', 'sans-serif'],
        sans: ['"Nunito Variable"', 'Nunito', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      transitionTimingFunction: {
        // Federnd, aber sanft (Wohlfühl-Spiel, nicht hektisch)
        spring: 'cubic-bezier(.34,1.56,.64,1)',
        soft: 'cubic-bezier(.22,1,.36,1)',
      },
    },
  },
  plugins: [],
} satisfies Config
