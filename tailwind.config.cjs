/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false, // 다크모드를 수동 전환 방식으로 변경
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/**/**'                     // 🔼 혹시나 빠진 폴더가 있다면 전체 포함
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
