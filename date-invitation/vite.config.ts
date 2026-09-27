import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { CONFIG } from './src/config';

/** Fills %GIRLFRIEND_NAME% in index.html (the page title) from src/config.ts. */
function personalizeHtml(): Plugin {
  return {
    name: 'personalize-html',
    transformIndexHtml: (html) => html.replaceAll('%GIRLFRIEND_NAME%', CONFIG.GIRLFRIEND_NAME),
  };
}

// `base: './'` makes the build work from any path: a Cloud Run container,
// a Cloud Storage bucket, or a sub-folder on Firebase / App Engine.
export default defineConfig({
  base: './',
  plugins: [react(), personalizeHtml()],
});
