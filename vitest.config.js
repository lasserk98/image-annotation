import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    // Tests assume the default creator build; a stray VITE_APP_VARIANT in the
    // shell or CI must not change that. Tests needing study stub it themselves.
    env: { VITE_APP_VARIANT: 'creator' },
  },
})
