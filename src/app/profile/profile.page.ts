import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ActionSheetController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  userEmail: string = '';
  displayName: string = '';
  memberSince: string = '';
  profilePhoto: string = '';
  favoriteCount: number = 0;
  shareCount: number = 0;
  viewCount: number = 0;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadProfilePhoto();
    this.loadUserStats();
  }

  ionViewWillEnter() {
    this.loadUserData();
    this.loadProfilePhoto();
  }

  private loadUserData() {
    this.userEmail = this.userService.getUsername();
    this.displayName = this.userService.getDisplayName();
    this.memberSince = this.userService.getMemberSince();
  }

  private loadProfilePhoto() {
    const photo = localStorage.getItem('profilePhoto');
    if (photo) {
      this.profilePhoto = photo;
    }
  }

  private loadUserStats() {
    const stats = this.userService.getUserStats();
    this.favoriteCount = stats.favoriteCount;
    this.shareCount = stats.shareCount;
    this.viewCount = stats.viewCount;
  }

  async presentPhotoActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar foto',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera',
          handler: () => {
            this.takePhoto();
          }
        },
        {
          text: 'Seleccionar de galería',
          icon: 'image',
          handler: () => {
            this.selectFromGallery();
          }
        },
        {
          text: 'Eliminar foto actual',
          icon: 'trash',
          role: 'destructive',
          handler: () => {
            this.removePhoto();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async takePhoto() {
    try {
      const loading = await this.loadingController.create({
        message: 'Abriendo cámara...'
      });
      await loading.present();

      // Importación dinámica de Capacitor Camera
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      await loading.dismiss();

      if (image.dataUrl) {
        this.profilePhoto = image.dataUrl;
        localStorage.setItem('profilePhoto', image.dataUrl);
        this.showToast('Foto actualizada correctamente');
      }
    } catch (error) {
      await this.loadingController.dismiss();
      this.showToast('Error al tomar la foto');
      console.error('Error taking photo:', error);
    }
  }

  async selectFromGallery() {
    try {
      const loading = await this.loadingController.create({
        message: 'Abriendo galería...'
      });
      await loading.present();

      // Importación dinámica de Capacitor Camera
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      await loading.dismiss();

      if (image.dataUrl) {
        this.profilePhoto = image.dataUrl;
        localStorage.setItem('profilePhoto', image.dataUrl);
        this.showToast('Foto actualizada correctamente');
      }
    } catch (error) {
      await this.loadingController.dismiss();
      this.showToast('Error al seleccionar la foto');
      console.error('Error selecting photo:', error);
    }
  }

  async removePhoto() {
    const alert = await this.alertController.create({
      header: 'Eliminar foto',
      message: '¿Estás seguro de que quieres eliminar tu foto de perfil?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.profilePhoto = '';
            localStorage.removeItem('profilePhoto');
            this.showToast('Foto eliminada');
          }
        }
      ]
    });
    await alert.present();
  }

  async editDisplayName() {
    const alert = await this.alertController.create({
      header: 'Editar nombre',
      inputs: [
        {
          name: 'displayName',
          type: 'text',
          placeholder: 'Ingresa tu nombre',
          value: this.displayName
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.displayName && data.displayName.trim()) {
              this.displayName = data.displayName.trim();
              this.userService.setDisplayName(this.displayName);
              this.showToast('Nombre actualizado');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async clearCache() {
    const alert = await this.alertController.create({
      header: 'Limpiar caché',
      message: 'Esto eliminará datos temporales y configuraciones locales. ¿Continuar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Limpiar',
          handler: () => {
            // Mantener datos esenciales como login y foto de perfil
            const username = this.userService.getUsername();
            const profilePhoto = localStorage.getItem('profilePhoto');
            const displayName = this.userService.getDisplayName();
            
            // Limpiar localStorage excepto datos críticos
            localStorage.clear();
            
            // Restaurar datos críticos
            // El username se mantendrá automáticamente al no limpiar la sesión activa
            if (profilePhoto) localStorage.setItem('profilePhoto', profilePhoto);
            if (displayName) this.userService.setDisplayName(displayName);
            
            this.showToast('Caché limpiado correctamente');
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            this.userService.logout();
            this.router.navigate(['/login'], { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmDeleteAccount() {
    const alert = await this.alertController.create({
      header: 'Eliminar cuenta',
      message: 'Esta acción no se puede deshacer. Se eliminarán todos tus datos y configuraciones.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar cuenta',
          role: 'destructive',
          handler: () => {
            // Limpiar completamente todos los datos
            localStorage.clear();
            this.showToast('Cuenta eliminada');
            this.router.navigate(['/login'], { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
/ *   P r o f i l e   p a g e   u p d a t e d   * / 
 
 