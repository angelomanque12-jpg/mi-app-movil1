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
    // Mostrar barra de navegación inferior solo en /home
    router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects || e.url;
      this.showBottomNav = url === '/home' || url.startsWith('/home/');
    });
  }
  navigateHome() {
    this.router.navigateByUrl('/home');
  }
  navigateLugares() {
    this.router.navigateByUrl('/lugares');
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
        webUseInput: false // Esto fuerza el uso de la cámara web en lugar del selector de archivos
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

      // Preguntar al usuario si desea guardar en álbum
      const alert = await this.alertCtrl.create({
        header: '¿Guardar foto en álbum?',
        message: 'Puedes guardar esta foto en uno de tus álbumes',
        buttons: [
          {
            text: 'No guardar',
            role: 'cancel'
          },
          {
            text: 'Guardar',
            handler: async () => {
              const boards = this.boardsService.getBoards();
              if (!boards || !boards.length) {
                const name = prompt('Nombre del nuevo álbum');
                if (name && name.trim()) {
                  const board = this.boardsService.createBoard(name.trim());
                  this.boardsService.addPin(board.id, newPlace.id);
                  const t = await this.alertCtrl.create({ message: 'Guardado en ' + board.name, buttons: ['OK'] });
                  await t.present();
                }
                return;
              }

              const boardAlert = await this.alertCtrl.create({
                header: 'Seleccionar álbum',
                inputs: boards.map(b => ({
                  type: 'radio' as const,
                  label: b.name,
                  value: b.id
                })),
                buttons: [
                  {
                    text: 'Cancelar',
                    role: 'cancel'
                  },
                  {
                    text: 'Guardar',
                    handler: async (boardId) => {
                      if (boardId) {
                        this.boardsService.addPin(boardId, newPlace.id);
                        const t = await this.alertCtrl.create({ 
                          message: 'Foto guardada en el álbum', 
                          buttons: ['OK'] 
                        });
                        await t.present();
                      }
                    }
                  }
                ]
              });
              await boardAlert.present();
            }
          }
        ]
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
