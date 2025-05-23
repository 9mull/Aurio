import { Artist, Music } from '../types/music';
import musicJson from './music.json';

export const musics: Music[] = musicJson.musics;
export const featuredMusics: Music[] = musicJson.featuredMusics;

export const artists: Artist[] = musicJson.artists.map(artist => ({
  ...artist,
  songs: musics
    .filter(m => m.song.artist === artist.name)
    .map(m => m.song)
}));