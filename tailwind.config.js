/** @type {import('tailwindcss').Config} */
// Square design: all border radii are forced to 0 (except `rounded-full` for tiny dots).
// Colours are sampled from the Nabodiganta logo.
module.exports = {
  // Every file that contains Tailwind class names (including classes added by JS)
  content: ['./*.html', './assets/js/**/*.js', './tools/**/*.js'],
  theme: {
    borderRadius: {
      none: '0',
      DEFAULT: '0',
      sm: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      full: '9999px',
    },
    extend: {
      colors: {
        forest: {
          50: '#eef5f0',
          100: '#d6e8dc',
          200: '#a9cdb5',
          500: '#16713f',
          600: '#0c5c31',
          700: '#084a27', // logo dark green
          800: '#063a1f',
          900: '#042915',
        },
        leaf: {
          100: '#e8f1dc',
          400: '#84af39', // logo light green
          500: '#6b9e30',
          600: '#558f27', // logo mid green
        },
        sun: {
          100: '#fff4dc',
          400: '#fcb72a', // logo sun
          500: '#f7a21c',
          600: '#e38a0c',
        },
        cream: '#faf8f2',
        ink: '#12211a',
      },
      fontFamily: {
        sans: ['Inter', 'Hind Siliguri', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        bangla: ['Hind Siliguri', 'sans-serif'],
      },
    },
  },
};
