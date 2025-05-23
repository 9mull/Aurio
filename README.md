# Aurio

A modern, responsive music player web application built with **React**, **TypeScript**, and **Vite**.

## Features
- 🎵 Browse, search, and play a curated collection of tracks and artists
- 📱 Responsive design for desktop and mobile
- 🎧 Playlist management: create, rename, delete, and manage playlists
- ❤️ Favourites: like and collect your favourite tracks
- 🔍 Fast search and quick preview
- 🖼️ Artist pages with dynamic backgrounds
- 🎚️ Custom audio player with progress, volume, and like controls
- 🪟 Smooth modals and transitions

## Tech Stack
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (dev/build tool)
- [React Router](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/)
- [Framer Motion](https://www.framer.com/motion/)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm (v8+ recommended)

### Install dependencies
```bash
npm install
```

### Start development server
```bash
npm run dev
```
Visit localhost in your browser.

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Project Structure
- `src/` — main source code (components, pages, context, styles)
- `src/data/` — music and artist data in JSON format
- `src/types/` — TypeScript types for music and artists
- `public/` — static assets (logo)

## Data Model
```ts
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  musicArt: string;
  musicSrc: string;
}

export interface Artist {
  id: string;
  name: string;
  photo: string;
  songs: Song[];
  description?: string;
  bgColor?: string;
  bgColorLight?: string;
}
```

## License
This project is for educational/demo purposes. 