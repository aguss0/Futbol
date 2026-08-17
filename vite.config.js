import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Durante desarrollo local, si corrés `vercel dev` esto no hace falta,
      // pero si usás `vite dev` solo, podés levantar las funciones aparte.
      '/api': 'http://localhost:3000',
    },
  },
});
