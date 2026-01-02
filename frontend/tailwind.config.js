/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 黑白配色系统
        lab: {
          // 深色模式
          dark: {
            bg: '#0a0a0a',
            surface: '#141414',
            card: '#1a1a1a',
            elevated: '#242424',
            border: '#2a2a2a',
            borderLight: '#3a3a3a',
          },
          // 浅色模式
          light: {
            bg: '#ffffff',
            surface: '#fafafa',
            card: '#f5f5f5',
            elevated: '#eeeeee',
            border: '#e0e0e0',
            borderLight: '#d0d0d0',
          },
          // 强调色 - 保持简洁
          accent: '#000000',
          accentLight: '#ffffff',
          // 功能色
          success: '#22c55e',
          warning: '#eab308',
          error: '#ef4444',
          info: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Noto Sans', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace']
      },
    },
  },
  plugins: [],
}
