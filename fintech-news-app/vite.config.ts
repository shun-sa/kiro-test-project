import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      './aws-exports': path.resolve(__dirname, './src/aws-exports.js'),
      './aws-exports.js': path.resolve(__dirname, './src/aws-exports.js'),
    },
  },
  build: {
    rollupOptions: {
      // aws-exportsの動的インポートを外部化しない
      external: [],
    },
  },
})
