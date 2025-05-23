declare module '*.json' {
  const value: {
    musics: Array<{
      id: string;
      song: {
        id: string;
        title: string;
        artist: string;
        musicArt: string;
        duration: number;
        musicSrc: string;
      };
    }>;
    featuredMusics: Array<{
      id: string;
      song: {
        id: string;
        title: string;
        artist: string;
        musicArt: string;
        duration: number;
        musicSrc: string;
      };
    }>;
    artists: Array<{
      id: string;
      name: string;
      photo: string;
      bgColor: string;
      bgColorLight: string;
    }>;
  };
  export default value;
} 