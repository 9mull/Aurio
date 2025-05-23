class ImageCacheService {
  private static instance: ImageCacheService;
  private cache: { [key: string]: HTMLImageElement } = {};
  private loadingPromises: { [key: string]: Promise<void> } = {};

  private constructor() {}

  public static getInstance(): ImageCacheService {
    if (!ImageCacheService.instance) {
      ImageCacheService.instance = new ImageCacheService();
    }
    return ImageCacheService.instance;
  }

  public preloadImage(src: string): Promise<void> {
    if (this.cache[src]) {
      return Promise.resolve();
    }

    if (Object.prototype.hasOwnProperty.call(this.loadingPromises, src)) {
      return this.loadingPromises[src];
    }

    this.loadingPromises[src] = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache[src] = img;
        delete this.loadingPromises[src];
        resolve();
      };

      img.onerror = () => {
        delete this.loadingPromises[src];
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });

    return this.loadingPromises[src];
  }

  public isImageCached(src: string): boolean {
    return !!this.cache[src];
  }

  public preloadImages(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map(src => this.preloadImage(src)));
  }
}

export const imageCache = ImageCacheService.getInstance(); 