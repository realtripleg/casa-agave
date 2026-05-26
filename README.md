# Casa Agave Mexican Restaurant

A static marketing site for Casa Agave Mexican Restaurant (Greencastle, PA), served by a
small Node.js / Express server so it slots cleanly into a PM2-managed environment.

- **Stack:** Node.js 18+, Express, Helmet, Compression, Morgan
- **Frontend:** static HTML/CSS/JS in `public/` (no build step)
- **Process manager:** PM2 (see `ecosystem.config.js`)

## Project layout

```
casa-agave/
├── index.js                  # Express server (static + page routes + 404)
├── package.json
└── public/
    ├── index.html            # Home
    ├── menu.html             # Full menu
    ├── specials.html         # Specials / Molcajetes
    ├── story.html            # Our Story / Hermes tribute
    ├── gallery.html          # Photo gallery
    ├── 404.html              # Not-found page
    ├── css/style.css         # Design system
    ├── js/main.js            # Mobile nav, scroll behavior, reveal-on-scroll
    └── images/
        ├── logo.svg
        ├── agave-icon.svg    # Favicon / nav mark
        └── gallery/          # Drop owner-supplied photos here
```

## Local development

```bash
npm install
npm start            # serves on http://localhost:3939
```

Visit:

- `/` — Home
- `/menu` — Full menu
- `/specials` — Specials & Molcajetes
- `/story` — Our Story
- `/gallery` — Gallery
- `/healthz` — JSON health check (useful for load balancers)

## Running under PM2 (production)

```bash
cd /path/to/casa-agave
npm install --omit=dev
pm2 start index.js --name casa-agave
pm2 save
```

That's it. Common follow-up commands:

```bash
pm2 logs casa-agave          # tail logs
pm2 restart casa-agave       # restart after edits
pm2 reload casa-agave        # zero-downtime reload
pm2 stop casa-agave
pm2 delete casa-agave
```

By default the server listens on `PORT=3939`, `HOST=0.0.0.0`. Override at start time:

```bash
PORT=4000 pm2 start index.js --name casa-agave
```

Put it behind nginx / Caddy and proxy `https://casaagavepa.com → http://127.0.0.1:3939`.

### Example nginx snippet

```nginx
server {
    listen 443 ssl http2;
    server_name casaagavepa.com www.casaagavepa.com;

    # ssl_certificate ...
    # ssl_certificate_key ...

    location / {
        proxy_pass http://127.0.0.1:3939;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Updating content

Everything is plain HTML — there is no template/build step. Edit the files in `public/`
and either restart (`pm2 restart casa-agave`) or just refresh (no restart is needed for
static asset changes, since they're served straight from disk).

### Adding gallery photos

Just drop image files into `public/images/gallery/` and refresh `/gallery`.

- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`
- Photos are sorted alphabetically — prefix filenames like `01-`, `02-` if you want a
  specific order.
- The caption shown on hover and in the lightbox is generated from the filename. So
  `carne-asada.jpg` becomes "Carne Asada" and `street_tacos.jpg` becomes "Street Tacos".
  Keep filenames descriptive.
- No restart needed — `/api/gallery` re-reads the folder on every request.

That's it. The masonry layout adjusts automatically and clicking any photo opens a
lightbox with arrow-key / swipe navigation.

### Replacing the logo

The logo is an SVG at `public/images/logo.svg` (and a square icon variant at
`agave-icon.svg`). You can replace either with a higher-fidelity version. Keep the same
file names so nothing else has to change.

### Updating menu prices or items

Edit `public/menu.html` — items follow this pattern:

```html
<div class="menu-item">
  <div class="menu-item__head">
    <span class="menu-item__name">Dish Name</span>
    <span class="menu-item__dots"></span>
    <span class="menu-item__price">9.99</span>
  </div>
  <p class="menu-item__desc">Short description.</p>
</div>
```

## Security notes

`server.js` ships with sane defaults via [helmet](https://helmetjs.github.io/):

- A Content Security Policy that allows Google Fonts, self-hosted assets, and Google Maps
  embeds, but blocks inline `<script>` injection.
- Compression for faster loads.
- Morgan request logging (combined format in production, dev format otherwise).

If you embed third-party widgets (e.g. an online ordering iframe), you'll need to
extend the `frame-src` / `script-src` directives in `server.js`.

## License

Site content (text, menu, photos, logo) © Casa Agave Mexican Restaurant. All rights
reserved.
