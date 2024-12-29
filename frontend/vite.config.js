import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build' //changed from dist
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
})
