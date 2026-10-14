import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

// Keep a standalone build available for the single-process demo and local QA.
const standalone = process.env.DEPLOY_TARGET === 'node';
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const site = process.env.PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : 'http://localhost:4321');

export default defineConfig({
  site,
  output: 'static',
  adapter: standalone ? node({ mode: 'standalone' }) : vercel(),
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  server: { host: '0.0.0.0', port: 4321 },
});
