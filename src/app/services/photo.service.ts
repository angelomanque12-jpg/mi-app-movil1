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
    // read as base64, write to filesystem (dynamic import)
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
