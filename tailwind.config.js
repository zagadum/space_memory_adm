/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'app-bg': 'var(--app-bg)',
                'app-card': 'var(--app-card)',
                'app-text': 'var(--app-text-main)',
                'app-dim': 'var(--app-text-dim)',
                'app-border': 'var(--app-border)',
                'app-blue': 'var(--blue)',
                'app-green': 'var(--green)',
                'app-red': 'var(--red)',
                'app-amber': 'var(--amber)',
                'app-pink': 'var(--pink)',
                'app-surface': 'var(--app-surface)',
                'app-sidebar': 'var(--app-sidebar)',
                'app-topbar': 'var(--app-topbar)',
            },
            boxShadow: {
                'app': 'var(--app-shadow)',
                'glow': 'var(--app-glow)',
            },
            fontFamily: {
                'outfit': ['Outfit', 'sans-serif'],
                'space': ['Space Mono', 'monospace'],
            }
        },
    },
    plugins: [],
}
