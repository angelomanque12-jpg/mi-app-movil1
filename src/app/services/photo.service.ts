import { Injectable } from '@angular/core';
// Usar importaciones dinámicas para los módulos de Capacitor para permitir la compilación sin ellos durante el desarrollo

export interface SavedPhoto {
  id: string;
  filepath: string; // ruta del sistema de archivos o webPath
  webviewPath?: string; // ruta utilizable en etiquetas <img>
  createdAt: string;
  latitude?: number;  // latitud de la ubicación de la foto
  longitude?: number; // longitud de la ubicación de la foto
}

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private STORAGE_KEY = 'user_photos_v1';

  constructor() {}

  async saveCapturedPhoto(photo: any): Promise<SavedPhoto> {
    /**
     * Guarda una foto capturada.
     *
     * Comportamiento:
     * - Convierte la `photo` entrante (que puede ser un objeto resultado de Capacitor Camera o
     *   un objeto de respaldo web con `webPath`/`base64String`) en una URL de datos base64.
     * - Crea una entrada `SavedPhoto` y persiste una lista en localStorage bajo `STORAGE_KEY`.
     *
     * Entradas:
     * - photo: objeto { webPath?: string, base64String?: string } o resultado de Capacitor Camera
     *
     * Salida:
     * - Devuelve el objeto SavedPhoto que fue almacenado.
     *
     * Modos de error:
     * - Si fetch/readAsBase64 falla, esto lanzará una excepción (el llamador debe manejar la retroalimentación de la UI).
     */
    const base64Data = await this.readAsBase64(photo);
    const fileName = `photo_${new Date().getTime()}.jpeg`;
    // Para el respaldo web, persistimos como URL de datos en localStorage (sin dependencia del sistema de archivos)
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
     * Lee la foto proporcionada como una cadena base64.
     *
     * La función intenta hacer `fetch()` del `photo.webPath` y convertir el Blob devuelto
     * en una cadena base64. Esto soporta tanto resultados de plugins nativos (que proporcionan un
     * webPath) como URLs de datos creadas desde entradas de archivo.
     *
     * Devuelve: cadena base64 sin el prefijo data:<mime>;base64,
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
      // eliminar prefijo
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
