import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about/index.html'),
        services: resolve(__dirname, 'services/index.html'),
        packages: resolve(__dirname, 'packages/index.html'),
        advertising: resolve(__dirname, 'advertising/index.html'),
        projects: resolve(__dirname, 'projects/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        hosting: resolve(__dirname, 'hosting/index.html'),
        maintenance: resolve(__dirname, 'maintenance/index.html'),
      },
    },
  },
});
