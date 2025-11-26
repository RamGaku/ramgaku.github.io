# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GitHub Pages static site (`ramgaku.github.io`) featuring an interactive black hole simulation as a blog landing page. The UI is in Korean.

## Architecture

Single-page application with everything contained in `index.html`:
- **Physics Engine**: Gravity simulation using inverse-square law, asteroid collision/fragmentation system
- **Rendering**: HTML5 Canvas with pixel-art style rendering (no external dependencies)
- **Core Objects**: Black hole (with event horizon, gravity range, core), asteroids, particles/debris, background stars

Key simulation parameters are stored in the `blackHole` object (mass, gravity range, core radius) and can be dynamically modified as particles are absorbed.

## Development

No build tools required. Open `index.html` directly in a browser or serve with any static file server:
```bash
npx serve .
```

## Deployment

Push to `main` branch to deploy via GitHub Pages.
