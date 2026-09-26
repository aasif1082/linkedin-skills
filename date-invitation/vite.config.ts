import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` makes the build work from any path: a Cloud Run container,
// a Cloud Storage bucket, or a sub-folder on Firebase / App Engine.
export default defineConfig({
  base: './',
  plugins: [react()],
});
