import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { PlacesService } from './services/places.service';
import { AlertController } from '@ionic/angular';
import { UserService } from './services/user.service';
import { BoardsService } from './services/boards.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  showBottomNav = true;
  capturing = false;
  private placesService = inject(PlacesService);
  private userService = inject(UserService);
  private boardsService = inject(BoardsService);
  private alertCtrl = inject(AlertController);

  constructor(private router: Router) {
    // Mostrar barra de navegación inferior en home y lugares
    router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects || e.url;
      this.showBottomNav = url === '/home' || url.startsWith('/home/') || url === '/lugares' || url.startsWith('/lugares/');
    });
  }

  navigateHome(event?: Event) {
    // Prevenir comportamiento por defecto y propagación
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Agregar feedback visual temporal
    this.addClickFeedback(event?.target as HTMLElement);
    
    console.log('🏠 Navegando a Home...');
    console.log('📍 URL actual:', this.router.url);
    
    // Usar navigateByUrl para forzar navegación
    this.router.navigateByUrl('/home', { replaceUrl: false }).then((success) => {
      if (success) {
        console.log('✅ Navegación a Home exitosa');
        console.log('📍 Nueva URL:', this.router.url);
      } else {
        console.error('❌ Fallo en la navegación a Home');
        // Intentar con navigate como fallback
        this.router.navigate(['/home']);
      }
    }).catch(err => {
      console.error('💥 Error navegando a Home:', err);
      // Fallback directo
      this.router.navigate(['/home']);
    });
  }
  
  navigateLugares(event?: Event) {
    // Prevenir comportamiento por defecto y propagación
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Agregar feedback visual temporal
    this.addClickFeedback(event?.target as HTMLElement);
    
    console.log('🔍 Navegando a Lugares...');
    console.log('📍 URL actual:', this.router.url);
    
    // Usar navigateByUrl para forzar navegación
    this.router.navigateByUrl('/lugares', { replaceUrl: false }).then((success) => {
      if (success) {
        console.log('✅ Navegación a Lugares exitosa');
        console.log('📍 Nueva URL:', this.router.url);
      } else {
        console.error('❌ Fallo en la navegación a Lugares');
        // Intentar con navigate como fallback
        this.router.navigate(['/lugares']);
      }
    }).catch(err => {
      console.error('💥 Error navegando a Lugares:', err);
      // Fallback directo
      this.router.navigate(['/lugares']);
    });
  }

  /**
   * Añade feedback visual cuando se hace click en un botón
   */
  private addClickFeedback(target: HTMLElement | null) {
    if (!target) return;
    
    // Encontrar el botón padre si el target es un icono o texto
    let button = target.closest('.nav-button') as HTMLElement;
    if (!button) button = target;
    
    // Agregar clase de feedback
    if (button) {
      button.classList.add('nav-button-clicked');
      
      // Remover la clase después de la animación
      setTimeout(() => {
        button?.classList.remove('nav-button-clicked');
      }, 200);
    }
  }

  async openCamera() {
    if (this.capturing) return;
    
    try {
      this.capturing = true;
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 90,
        saveToGallery: false,
        correctOrientation: true,
        webUseInput: false
      });

      if (!photo || !photo.base64String) return;

      const imageUrl = `data:image/jpeg;base64,${photo.base64String}`;
      const username = this.userService.getUsername() || 'Usuario';

      // Crear nuevo lugar con la foto
      const newPlace = {
        id: Date.now().toString(),
        place: 'Nueva foto',
        imageUrl,
        rating: 0,
        location: '',
        user: username,
        likes: 0,
        shares: 0,
        likedByUser: false
      };

      // Añadir la foto al servicio de lugares
      this.placesService.addPlace(newPlace);

      // Mostrar confirmación
      const alert = await this.alertCtrl.create({
        header: '¡Foto capturada!',
        message: 'Tu foto ha sido guardada exitosamente',
        buttons: ['OK']
      });
      await alert.present();

    } catch (err) {
      console.error('Error al abrir cámara:', err);
      const errorAlert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo acceder a la cámara',
        buttons: ['OK']
      });
      await errorAlert.present();
    } finally {
      this.capturing = false;
    }
  }
}
