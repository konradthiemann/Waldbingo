import type { Config } from 'tailwindcss'

// Wald-Designsystem – portiert aus den CSS-Variablen des Vanilla-Prototyps
// (waldbingo-app/index.html, :root). Eine Quelle für die Farbwelt.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#14331f',
          800: '#1a4429',
          700: '#1f5b38',
          600: '#2f7d4f',
          500: '#3f9d63',
          300: '#8ed3a0',
          100: '#dcefe1',
        },
        bark: '#a06d44',
        amber: { DEFAULT: '#e8913c', 600: '#c4702f' },
        sun: '#f3c44d',
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
      },
      boxShadow: {
        wb1: '0 1px 2px rgba(20,51,31,.06), 0 2px 8px rgba(20,51,31,.05)',
        wb2: '0 6px 22px rgba(20,51,31,.10)',
        wb3: '0 18px 50px rgba(20,51,31,.22)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
