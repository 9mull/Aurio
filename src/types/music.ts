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

export interface Music {
  id: string;
  song: Song;
} 