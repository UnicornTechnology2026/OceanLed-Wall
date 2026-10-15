# OCEAN LED — Premium LED Display Website

A modern, fully responsive React + Vite + Tailwind CSS website featuring an animated mosaic LED-style loading screen and a professional corporate home page for **OCEAN LED**.

## Features

- **Animated Fullscreen Loader**
  - Colorful mosaic grid background (cyan, electric blue, purple, magenta, teal, emerald)
  - Circular OCEAN LED logo with SVG mark
  - "OCEAN LED" title + "INITIALIZING OCEAN WORLD" subtitle
  - Smooth gradient progress bar (0 → 100%)
  - Fade-out transition into the main site (~3.5 s)
  - Respects `prefers-reduced-motion`

- **Home Page**
  - Responsive navbar with mobile hamburger menu
  - Cinematic hero section
  - Solutions, Why OCEAN LED, Featured Projects, About, Contact form, Footer
  - Smooth scroll navigation
  - Contact form with client-side validation

## Tech Stack

- React 19 + Vite 8
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React (icons)
- Pure CSS keyframes + React state (no external animation libraries)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open the URL shown in the terminal (usually http://localhost:5173)
```

Build for production:

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Loader.tsx            # Fullscreen loading screen
│   ├── MosaicBackground.tsx  # Animated LED mosaic grid
│   ├── OceanLedLogo.tsx      # Reusable circular logo (SVG)
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Solutions.tsx
│   ├── WhyOceanLed.tsx
│   ├── Projects.tsx
│   ├── About.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── App.tsx                   # Loader → Home transition logic
├── main.tsx
└── index.css                 # Tailwind + custom animations
```

## Customization Guide

### Loading Duration
In `src/components/Loader.tsx`, adjust the progress interval speed or the final timeout values to make the loader longer/shorter.

### Logo
Edit the SVG inside `src/components/OceanLedLogo.tsx`. The component accepts a `size` prop.

### Colors
Primary palette is defined in `src/index.css` under `@theme` and used via Tailwind classes (`ocean-blue`, `ocean-cyan`, etc.). You can also tweak the mosaic colors array in `MosaicBackground.tsx`.

### Content
- Solutions cards → `Solutions.tsx`
- Why section → `WhyOceanLed.tsx`
- Project placeholders → `Projects.tsx`
- About copy → `About.tsx`
- Contact placeholders & form → `Contact.tsx` / `Footer.tsx`

### Contact Details
Replace the `[Email placeholder]`, `[Phone placeholder]`, and `[Address placeholder]` strings in `Footer.tsx` with real information.

## Notes

- No backend is required; the contact form only performs client-side validation and shows a success state.
- The mosaic grid is generated with CSS Grid and dynamically sized tiles.
- All intervals/timeouts are cleaned up on unmount.
- Page scroll is locked while the loader is visible.
