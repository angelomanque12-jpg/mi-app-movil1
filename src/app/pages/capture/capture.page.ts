import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PhotoService } from '../../services/photo.service';
import { PlacesService } from '../../services/places.service';

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class CapturePage {
  saving = false;
  placeName = '';
  placeLocation = '';

  constructor(public photoService: PhotoService, private toastCtrl: ToastController, private placesService: PlacesService) {}

  async takePhoto() {
    let saved = false;
    try {
      // dynamic import of Capacitor Camera so the project can build even if Capacitor isn't installed
      // Try to use Capacitor Camera if available at runtime (no static import to avoid build errors)
      /**
       * Try to use a native Camera plugin at runtime.
       *
       * Notes:
       * - We use a runtime lookup (window.Capacitor.Plugins.Camera) instead of a static
       *   import so the web build doesn't fail when Capacitor isn't installed.
       * - If the plugin exists and exposes `getPhoto`, call it to capture an image.
       * - On success we pass the captured object to `PhotoService.saveCapturedPhoto`.
       * - On any error or if the plugin is not available, we fall back to the file input selector.
       *
       * Input: none (uses `window` runtime plugin if available)
       * Output: saves a photo via PhotoService or triggers file selector fallback
       * Error modes: plugin not present, plugin call rejected, fetch/read errors inside PhotoService
       */
      try {
        const win: any = window as any;
        const CameraPlugin = win?.Capacitor?.Plugins?.Camera || win?.Camera || null;
        if (CameraPlugin && CameraPlugin.getPhoto) {
          // Using Capacitor Camera plugin available at runtime
          const captured = await CameraPlugin.getPhoto({ resultType: 0, source: 1, quality: 80 });
          await this.photoService.saveCapturedPhoto(captured as any);
          saved = true;
        } else {
          const toast = await this.toastCtrl.create({ message: 'Cámara no disponible, usa el selector de archivo', duration: 2000 });
          await toast.present();
          this.openFileSelector();
        }
      } catch (err) {
        const toast = await this.toastCtrl.create({ message: 'Error al acceder a la cámara', duration: 2000 });
        await toast.present();
        this.openFileSelector();
      }

      if (saved) {
        const toast = await this.toastCtrl.create({ message: 'Foto guardada', duration: 1500 });
        await toast.present();
      }
    } catch (e) {
      const toast = await this.toastCtrl.create({ message: 'Error al tomar la foto', duration: 1500 });
      await toast.present();
    }
  }

  openFileSelector() {
    const el = document.getElementById('fileInput') as HTMLInputElement | null;
    if (el) el.click();
  }

  async onFileSelected(e: any) {
    const file: File = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      // dataUrl includes prefix like data:image/jpeg;base64,...; strip prefix for service
      const idx = dataUrl.indexOf(',');
      const base64 = dataUrl.substring(idx + 1);
      await this.photoService.saveCapturedPhoto({ webPath: dataUrl, base64String: base64 });
      const toast = await this.toastCtrl.create({ message: 'Foto guardada desde archivo', duration: 1500 });
      await toast.present();
    };
    reader.readAsDataURL(file);
  }

  attachLastPhoto() {
    const saved = this.photoService.getSaved();
    if (!saved || !saved.length) return;
    const last = saved[0];
    const name = this.placeName && this.placeName.trim() ? this.placeName.trim() : `Lugar ${new Date().toLocaleString()}`;
    this.placesService.addPlace({ place: name, imageUrl: last.webviewPath || last.filepath, location: this.placeLocation });
    // clear inputs
    this.placeName = '';
    this.placeLocation = '';
  }
}
