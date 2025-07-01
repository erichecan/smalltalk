/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 移动端优先的断点系统
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      // 移动端优化的最大宽度
      maxWidth: {
        'mobile': '100vw',
        'safe': 'calc(100vw - 2rem)',
      },
      // 防溢出工具类
      spacing: {
        'safe-x': '1rem',
        'safe-y': '0.5rem',
      },
      // 项目色彩系统
      colors: {
        primary: {
          50: '#F8FCF8',
          100: '#E7F3E7',
          200: '#CFE8CF',
          500: '#CAECCA',
          600: '#4c9a4c',
          700: '#0D1C0D',
          900: '#111811',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}