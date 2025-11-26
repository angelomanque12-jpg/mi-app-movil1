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
    // Prevenir comportamiento por defecto
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Navegando a Home desde barra inferior...');
    console.log('URL actual:', this.router.url);
    
    // Navegación directa y simple
    this.router.navigate(['/home']).then((success) => {
      if (success) {
        console.log('Navegación a Home desde barra inferior exitosa');
        console.log('Nueva URL:', this.router.url);
      } else {
        console.error('Fallo en la navegación a Home desde barra inferior');
      }
    }).catch(err => {
      console.error('Error navegando a Home desde barra inferior:', err);
    });
  }
  
  navigateLugares(event?: Event) {
    // Prevenir comportamiento por defecto
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Navegando a Lugares desde barra inferior...');
    console.log('URL actual:', this.router.url);
    
    // Navegación directa y simple
    this.router.navigate(['/lugares']).then((success) => {
      if (success) {
        console.log('Navegación a Lugares desde barra inferior exitosa');
        console.log('Nueva URL:', this.router.url);
      } else {
        console.error('Fallo en la navegación a Lugares desde barra inferior');
      }
    }).catch(err => {
      console.error('Error navegando a Lugares desde barra inferior:', err);
    });
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
