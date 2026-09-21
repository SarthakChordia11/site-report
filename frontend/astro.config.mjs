import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Tailwind v4 is used via the @tailwindcss/vite plugin directly in the Vite
// pipeline — NOT through @astrojs/tailwind which only supports Tailwind v3.
export default defineConfig({
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
