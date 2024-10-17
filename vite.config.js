import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ESM modülleri ile uyumlu hale getirmek için require yerine import kullanın
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
})
