/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        festival: {
          pink: '#E91E63',
          orange: '#FF7A00',
          yellow: '#FFD43B',
          cyan: '#19CFE8',
          green: '#7ED957',
          purple: '#8E44FF',
          dark: '#121217',
          cream: '#FAF8F5',
          creamDark: '#F3EFEA',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Cabinet Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'fest': '4px 4px 0px 0px #121217',
        'fest-lg': '6px 6px 0px 0px #121217',
        'fest-xl': '8px 8px 0px 0px #121217',
        'fest-pink': '4px 4px 0px 0px #E91E63',
        'fest-orange': '4px 4px 0px 0px #FF7A00',
        'fest-cyan': '4px 4px 0px 0px #19CFE8',
        'fest-purple': '4px 4px 0px 0px #8E44FF',
        'fest-green': '4px 4px 0px 0px #7ED957',
        'card-soft': '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'blob': '40% 60% 70% 30% / 40% 50% 60% 50%',
      }
    },
  },
  plugins: [],
}
