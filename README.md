# Bumblebee

A modern web application for the [NASA Astrophysics Data System (ADS)](https://ui.adsabs.harvard.edu).

---

[![Build Status](https://travis-ci.org/adsabs/bumblebee.svg?branch=master)](https://travis-ci.org/adsabs/bumblebee)
[![Coverage Status](https://coveralls.io/repos/github/adsabs/bumblebee/badge.svg)](https://coveralls.io/github/adsabs/bumblebee)

---

## 🚀 Features

- Built with Webpack
- Fast dependency management with [PNPM](https://pnpm.io)
- Docker support for QA/Production parity
- Modular architecture with support for remote assets via CDN
- Source map uploading to Sentry for production builds

---

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [PNPM](https://pnpm.io)
- [Docker](https://docs.docker.com/get-docker/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (for asset uploads)

---

## 📦 Installation

```bash
git clone git@github.com:adsabs/bumblebee.git
cd bumblebee

# Ensure PNPM is used
pnpm install
```

---

## 🧪 Development

Start a local development server with hot reload:

```bash
pnpm dev
```

App will be available at `http://localhost:8000` (or configured port).

---

## ⚙️ Configuration

Create a local config file from the template:

```bash
cp src/config/discovery.vars.js.default src/config/discovery.vars.js
```

Customize values as needed.

---

## 🔨 Building

### Local production build (uses relative paths):

```bash
pnpm build
```

### CDN-based production build (uses full URLs for assets):

```bash
pnpm build:release
```

Artifacts will be output to the `dist/` directory.

---

## 🚚 Deployment

After building with `build:release`, run:

```bash
pnpm upload:assets
```

This will:
- Upload static assets to Cloudflare Pages
- Upload source maps to Sentry (via `sentry-cli`)

**Note:** In CI, this step should be automated and triggered post-build.

---

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

---

## 📁 Project Structure

```text
src/
├── components/      # UI widgets and reusable elements
├── config/          # Environment-specific configuration
├── core/            # Application logic, routers, managers
├── styles/          # Sass/CSS files
└── index.js         # Entry point
```

---

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [Search Cycle Explanation](docs/search-cycle.md)
- [How to Write a Widget](docs/how-to-write-widget.md)

---

## 🧵 Scripts Reference

| Script                 | Description                                          |
|------------------------|------------------------------------------------------|
| `pnpm dev`             | Start dev server with hot reload                     |
| `pnpm build`           | Local production build                               |
| `pnpm build:release`   | CDN-ready production build                           |
| `pnpm upload:assets`   | Uploads assets to Cloudflare + sourcemaps to Sentry |
| `pnpm test`            | Run test suite                                       |
| `pnpm start[:env]`     | Run Docker container (`dev`, `qa`, `prod`)           |

---

## 👥 License & Contributors

See `LICENSE.md`.
