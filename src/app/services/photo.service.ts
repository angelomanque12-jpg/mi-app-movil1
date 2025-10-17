import { Injectable } from '@angular/core';
// Use dynamic imports for Capacitor modules to allow building without them during development

export interface SavedPhoto {
  id: string;
  filepath: string; // filesystem path or webPath
  webviewPath?: string; // path usable in <img>
  createdAt: string;
  latitude?: number;
  longitude?: number;
}

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private STORAGE_KEY = 'user_photos_v1';

  constructor() {}

  async saveCapturedPhoto(photo: any): Promise<SavedPhoto> {
    /**
     * Save a captured photo.
     *
     * Behavior:
     * - Converts the incoming `photo` (which may be a Capacitor Camera result object or
     *   a web fallback object with `webPath`/`base64String`) into a base64 data URL.
     * - Creates a `SavedPhoto` entry and persists a list to localStorage under `STORAGE_KEY`.
     *
     * Inputs:
     * - photo: object { webPath?: string, base64String?: string } or Capacitor Camera result
     *
     * Output:
     * - Returns the SavedPhoto object that was stored.
     *
     * Error modes:
     * - If fetch/readAsBase64 fails this will throw (caller should handle UI feedback).
     */
    const base64Data = await this.readAsBase64(photo);
    const fileName = `photo_${new Date().getTime()}.jpeg`;
    // For web fallback we persist as data URL in localStorage (no Filesystem dependency)
    const dataUrl = `data:image/jpeg;base64,${base64Data}`;
    const saved: SavedPhoto = {
      id: fileName,
      filepath: fileName,
      webviewPath: dataUrl,
      createdAt: new Date().toISOString()
    };

    const list = this.getSaved() || [];
    list.unshift(saved);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    return saved;
  }

  async readAsBase64(photo: any) {
    /**
     * Read the provided photo as a base64 string.
     *
     * The function attempts to `fetch()` the `photo.webPath` and convert the returned Blob
     * into a base64 string. This supports both native plugin results (which provide a
     * webPath) and data-URLs created from file inputs.
     *
     * Returns: base64 string without data:<mime>;base64, prefix.
     */
    // fetch the photo, read as blob, convert to base64
    const response = await fetch(photo.webPath || '');
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const res = reader.result as string;
      // remove prefix
      const idx = res.indexOf(',');
      resolve(res.substring(idx + 1));
    };
    reader.readAsDataURL(blob);
  });

  getSaved(): SavedPhoto[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
}
