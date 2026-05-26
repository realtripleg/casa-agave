'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3939;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');
const GALLERY_DIR = path.join(PUBLIC_DIR, 'images', 'gallery');
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

function humanizeFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

app.set('trust proxy', 1);

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const cspDirectives = {
  'default-src': ["'self'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
  'script-src': ["'self'"],
  'frame-src': ["'self'", 'https://www.google.com', 'https://maps.google.com'],
  'connect-src': ["'self'"],
};

if (!IS_PRODUCTION) {
  // In dev / over HTTP these would force browsers to upgrade subresource
  // requests to HTTPS and then refuse to downgrade — which breaks CSS, JS
  // and image loading on phones hitting the site via the LAN IP.
  cspDirectives['upgrade-insecure-requests'] = null;
}

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: cspDirectives,
    },
    crossOriginEmbedderPolicy: false,
    strictTransportSecurity: IS_PRODUCTION ? undefined : false,
  })
);

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(
  express.static(PUBLIC_DIR, {
    extensions: ['html'],
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  })
);

const PAGE_ROUTES = [
  { route: '/', file: 'index.html' },
  { route: '/menu', file: 'menu.html' },
  { route: '/specials', file: 'specials.html' },
  { route: '/story', file: 'story.html' },
  { route: '/gallery', file: 'gallery.html' },
];

for (const { route, file } of PAGE_ROUTES) {
  app.get(route, (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, file));
  });
}

app.get('/api/gallery', (_req, res) => {
  fs.readdir(GALLERY_DIR, (err, files) => {
    if (err) {
      if (err.code === 'ENOENT') return res.json({ photos: [] });
      console.error('Failed to read gallery directory:', err);
      return res.status(500).json({ error: 'Failed to read gallery' });
    }
    const photos = files
      .filter((name) => IMAGE_EXT.test(name) && !name.startsWith('.'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((name) => ({
        src: `/images/gallery/${encodeURIComponent(name)}`,
        alt: humanizeFilename(name),
      }));
    res.set('Cache-Control', 'no-cache');
    res.json({ photos });
  });
});

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'casa-agave', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'));
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Casa Agave site listening on http://${HOST}:${PORT}`);
});

const shutdown = (signal) => {
  console.log(`Received ${signal}, shutting down gracefully.`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
