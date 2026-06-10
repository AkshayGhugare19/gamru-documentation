import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static docs site. base './' so the built bundle works from any sub-path
// or even opened directly. Routing uses HashRouter for the same reason.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5174, open: true },
})
