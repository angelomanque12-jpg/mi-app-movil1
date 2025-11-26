import { Component, OnInit, inject } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';
import { Router } from '@angular/router'; // ✅ Importamos el Router
import { UserService } from '../services/user.service';
import { PlacesService, PlacePhoto as PlacePhotoModel } from '../services/places.service';
import { BoardsService } from '../services/boards.service';
import { GeolocationService } from '../services/geolocation.service';
import { IonicModule, AlertController, AlertInput, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaceDetailModalComponent } from '../components/place-detail-modal/place-detail-modal.component';


interface PlacePhoto extends PlacePhotoModel {}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
  ,
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger(80, [animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))])
          ],
          { optional: true }
        )
      ])
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.985)' }),
        animate('220ms cubic-bezier(.2,.8,.2,1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('overlayAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))])
    ])
  ]
})
export class HomePage implements OnInit {
  // Flag para controlar estado de la cámara
  capturing = false;

  places: PlacePhoto[] = [];
  username: string = 'Usuario';
  filteredPlaces: PlacePhoto[] = [];
  searchTerm = '';

  // ✅ Inyectamos el Router en el constructor
  private router = inject(Router);
  private userService = inject(UserService);
  private placesService = inject(PlacesService);
  private boardsService = inject(BoardsService);
  private geolocationService = inject(GeolocationService);
  private alertCtrl = inject(AlertController);
  private modalCtrl = inject(ModalController);
  loading = true;
  quickViewImage?: string;
  // track images that failed to load to avoid flicker/retry loops
  imageFailed: Record<string, boolean> = {};
  // track images that have loaded successfully
  imageLoaded: Record<string, boolean> = {};
  locationPermissionStatus: string = 'unknown';

  ngOnInit() {
    this.placesService.getPlaces().subscribe(list => { 
      this.places = list; 
      this.filteredPlaces = list.slice(); 
      this.loading = false; 
      
      // Inicializar estados de carga para todas las imágenes
      this.initializeImageStates(list);
      
      // 🔍 Debug: Validar que todos los lugares tengan coordenadas
      this.validatePlaceCoordinates();
      
      // 📊 Telemetría: Mostrar resumen de imágenes después de un momento
      setTimeout(() => {
        this.showImageLoadSummary();
      }, 5000);
    });

    // Obtener username real del servicio (si existe)
    const name = this.userService.getUsername();
    if (name) this.username = name;

    // Verificar permisos de ubicación
    this.checkLocationPermission();
  }

  /**
   * Mostrar resumen de carga de imágenes para debugging
   */
  private showImageLoadSummary() {
    const total = Object.keys(this.imageLoaded).length;
    const loaded = Object.values(this.imageLoaded).filter(v => v).length;
    const failed = Object.values(this.imageFailed).filter(v => v).length;
    
    console.log('\n📊 RESUMEN DE CARGA DE IMÁGENES:');
    console.log(`✅ Cargadas exitosamente: ${loaded}/${total}`);
    console.log(`❌ Fallaron: ${failed}/${total}`);
    console.log(`⏳ Pendientes: ${total - loaded - failed}/${total}`);
    
    if (failed > 0) {
      console.log('\n🚨 URLs problemáticas:');
      Object.entries(this.imageFailed).forEach(([url, hasFailed]) => {
        if (hasFailed) {
          console.log(`  - ${url.substring(0, 80)}...`);
        }
      });
    }
    
    console.log('\n💡 Si ves imágenes con problemas, revisa las URLs arriba.\n');
  }

  /**
   * Inicializar estados de carga para todas las imágenes
   */
  private initializeImageStates(places: PlacePhoto[]) {
    places.forEach(place => {
      if (place.imageUrl) {
        // Verificar si la imagen ya está en caché del navegador o usar alternativa
        this.checkIfImageIsCached(place.imageUrl);
      }
    });
    
    // Verificación específica para Torres del Paine (primer lugar en la lista)
    setTimeout(() => {
      this.fixTorresDelPaineIfNeeded();
    }, 1000);
  }

  /**
   * Verificación específica para Torres del Paine
   */
  private fixTorresDelPaineIfNeeded() {
    const torresPlace = this.places.find(p => p.place && p.place.toLowerCase().includes('torres del paine'));
    
    if (torresPlace && this.imageFailed[torresPlace.imageUrl]) {
      console.log('🔧 Aplicando fix específico para Torres del Paine');
      
      // URL ultra confiable específicamente para Torres del Paine
      const fixedUrl = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&auto=format&q=80';
      
      // Actualizar URL y estado
      torresPlace.imageUrl = fixedUrl;
      this.imageLoaded[fixedUrl] = false;
      this.imageFailed[fixedUrl] = false;
      
      // Forzar recarga del componente
      this.places = this.places.slice();
      this.filteredPlaces = this.filteredPlaces.slice();
      
      console.log('✅ Torres del Paine fix aplicado exitosamente');
    }
  }

  /**
   * Verificar si una imagen está en caché del navegador o usar alternativa
   */
  private checkIfImageIsCached(url: string) {
    const img = new Image();
    
    // Configurar eventos antes de asignar src
    img.onload = () => {
      // Si se carga inmediatamente, probablemente está en caché
      if (img.complete) {
        console.log('📦 Imagen desde caché:', url);
        this.imageLoaded[url] = true;
        this.imageFailed[url] = false;
      }
    };
    
    img.onerror = () => {
      console.log('❌ Imagen no disponible, probando alternativa:', url);
      this.imageLoaded[url] = false;
      this.imageFailed[url] = true; 
      
      // Intentar inmediatamente con URL alternativa
      const alternativeUrl = this.getAlternativeImageUrl(url);
      if (alternativeUrl !== this.getPlaceholderImage()) {
        const altImg = new Image();
        altImg.onload = () => {
          console.log('✅ Imagen alternativa disponible:', alternativeUrl);
          this.updateImageUrl(url, alternativeUrl);
          this.imageLoaded[url] = true;
          this.imageFailed[url] = false;
        };
        altImg.onerror = () => {
          console.log('❌ Imagen alternativa también falló');
          this.imageFailed[url] = true;
        };
        altImg.src = alternativeUrl;
      }
    };
    
    // Inicializar estados
    this.imageLoaded[url] = false;
    this.imageFailed[url] = false;
    
    // Intentar cargar para verificar caché
    img.src = url;
    
    // Si la imagen está completa inmediatamente, está en caché
    if (img.complete && img.naturalHeight !== 0) {
      console.log('⚡ Imagen completa desde caché:', url);
      this.imageLoaded[url] = true;
      this.imageFailed[url] = false;
    }
  }

  /**
   * Open a dialog to let the user choose or create a board and save the place to it.
   * Uses AlertController as a simple modal for selection/creation.
   */
  async openSaveToBoard(place: PlacePhoto) {
    const boards = this.boardsService.getBoards();
    if (!boards || !boards.length) {
      // no boards yet - prompt to create one
      const { role } = await (await this.alertCtrl.create({
        header: 'Crear álbum',
        inputs: [ { name: 'name', placeholder: 'Nombre del álbum' } ],
        buttons: [ { text: 'Cancelar', role: 'cancel' }, { text: 'Crear', role: 'confirm' } ]
      })).present().then(() => ({ role: 'confirm' }));
      // fallback simple creation flow: open native prompt (not ideal but keeps UI minimal)
      const name = prompt('Nombre del nuevo álbum');
      if (name && name.trim()) {
        const b = this.boardsService.createBoard(name.trim());
        this.boardsService.addPin(b.id, place.id);
        const t = await this.alertCtrl.create({ message: 'Guardado en ' + b.name, buttons: ['OK'] });
        await t.present();
      }
      return;
    }

    // Build radio inputs for existing boards
  const inputs: AlertInput[] = boards.map(b => ({ type: 'radio' as const, label: b.name, value: b.id }));
    const alert = await this.alertCtrl.create({
      header: 'Guardar en álbum',
      inputs: inputs,
      buttons: [
        { text: 'Nuevo', handler: () => {
            const name = prompt('Nombre del nuevo álbum');
            if (name && name.trim()) {
              const nb = this.boardsService.createBoard(name.trim());
              this.boardsService.addPin(nb.id, place.id);
              this.alertCtrl.create({ message: 'Guardado en ' + nb.name, buttons: ['OK'] }).then(a=>a.present());
            }
          }
        },
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Guardar', handler: (data) => {
            if (data) { this.boardsService.addPin(data, place.id); this.alertCtrl.create({ message: 'Guardado', buttons: ['OK'] }).then(a=>a.present()); }
          }
        }
      ]
    });
    await alert.present();
  }

  onSearchInput(e: any) {
    const q = (this.searchTerm || '').trim().toLowerCase();
    if (!q) {
      this.filteredPlaces = this.places.slice();
      return;
    }
    const results = this.places.filter(p => p.place.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
    this.filteredPlaces = results;
    // If exact match, navigate directly to detail
    const exact = this.places.find(p => p.place.toLowerCase() === q);
    if (exact) this.router.navigate(['/place-detail', exact.id]);
  }

  loadMockData() {
    this.places = [
      {
        id: '1',
        place: 'Playa Reñaca',
        imageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1',
        rating: 4.8,
        location: 'Viña del Mar, Chile',
        user: 'Angelo',
      },
      {
        id: '2',
        place: 'Torres del Paine',
        imageUrl: 'https://images.unsplash.com/photo-1500534623283-312aade485b7',
        rating: 4.9,
        location: 'Magallanes, Chile',
        user: 'Camila',
      },
      {
        id: '3',
        place: 'Cerro San Cristóbal',
        imageUrl: 'https://images.unsplash.com/photo-1616682444346-254c23d80dc5',
        rating: 4.4,
        location: 'Santiago, Chile',
        user: 'Matías',
      },
      {
        id: '4',
        place: 'Desierto de Atacama',
        imageUrl: 'https://images.unsplash.com/photo-1586216586013-d8b2a3e4c51a',
        rating: 5.0,
        location: 'Antofagasta, Chile',
        user: 'Josefa',
      },
      {
        id: '5',
        place: 'Lago Llanquihue',
        imageUrl: 'https://images.unsplash.com/photo-1529927066849-6b6c79b1b7a5',
        rating: 4.6,
        location: 'Puerto Varas, Chile',
        user: 'Felipe',
      }
    ];
  }

  // Helper: asegurar URL válida (fallback a placeholder si es necesario)
  safeImage(url: string) {
    if (!url) return this.getPlaceholderImage();
    // if this url previously failed, return placeholder
    if (this.imageFailed[url]) return this.getPlaceholderImage();
    return url;
  }

  /**
   * Obtener imagen placeholder confiable
   */
  private getPlaceholderImage(): string {
    // Usar una imagen placeholder de un servicio confiable con parámetros específicos para evitar caché
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=60&blur=10';
  }

  /**
   * Obtener URL alternativa para imagen problemática
   */
  private getAlternativeImageUrl(originalUrl: string): string {
    // Map de URLs alternativas para imágenes conocidas problemáticas
    const alternativeUrls: Record<string, string> = {
      // Torres del Paine alternativa (ahora usando URL ultra-confiable)
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80': 
        'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop&auto=format&q=75',
      
      // Salar de Uyuni alternativa  
      'https://images.unsplash.com/photo-1625662555790-d94c87635bf3?w=800&h=600&fit=crop&auto=format&q=80':
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&auto=format&q=75',
      
      // Fernando de Noronha alternativa
      'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=800&h=600&fit=crop&auto=format&q=80':
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=75',
        
      // Milford Sound alternativa
      'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&h=600&fit=crop&auto=format&q=80':
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&auto=format&q=75',
        
      // Mont Blanc alternativa
      'https://images.unsplash.com/photo-1464822759844-d150ad6bf55c?w=800&h=600&fit=crop&auto=format&q=80':
        'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop&auto=format&q=75',
        
      // Santorini alternativa
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop&auto=format&q=80':
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&auto=format&q=75'
    };
    
    return alternativeUrls[originalUrl] || this.getPlaceholderImage();
  }

  onImageLoad(idOrUrl: string) {
    // Evitar logs excesivos si ya estaba marcada como cargada
    if (!this.imageLoaded[idOrUrl]) {
      console.log('✅ Imagen cargada exitosamente:', idOrUrl);
      
      // Verificación específica para Torres del Paine
      const isTorresDelPaine = this.places.find(p => 
        p.imageUrl === idOrUrl && p.place && p.place.toLowerCase().includes('torres del paine')
      );
      
      if (isTorresDelPaine) {
        console.log('🎉 TORRES DEL PAINE CARGADO EXITOSAMENTE! 🏔️');
      }
    }
    
    // Marcar como cargada y quitar estados de error
    this.imageLoaded[idOrUrl] = true;
    this.imageFailed[idOrUrl] = false;
  }

  onImageError(url?: string) {
    if (!url) return;
    
    console.warn('❌ Error cargando imagen:', url);
    
    // Verificación específica para Torres del Paine
    const isTorresDelPaine = this.places.find(p => 
      p.imageUrl === url && p.place && p.place.toLowerCase().includes('torres del paine')
    );
    
    if (isTorresDelPaine) {
      console.error('🚨 ERROR ESPECÍFICO EN TORRES DEL PAINE:', url);
      console.log('🔧 Aplicando fix inmediato...');
      
      // Fix inmediato para Torres del Paine
      const ultraReliableUrl = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&auto=format&q=80&t=' + Date.now();
      isTorresDelPaine.imageUrl = ultraReliableUrl;
      this.imageLoaded[ultraReliableUrl] = false;
      this.imageFailed[ultraReliableUrl] = false;
      
      // Forzar actualización inmediata
      this.places = this.places.slice();
      this.filteredPlaces = this.filteredPlaces.slice();
      
      console.log('✅ Fix de Torres del Paine aplicado con URL:', ultraReliableUrl);
      return;
    }
    
    // Marcar estados correctamente
    this.imageFailed[url] = true;
    this.imageLoaded[url] = false;
    
    // Intentar recargar la imagen con diferentes parámetros después de un tiempo
    setTimeout(() => {
      this.retryImageLoad(url);
    }, 3000); // Aumentar el timeout para evitar loops rápidos
  }

  /**
   * Intentar recargar una imagen con parámetros modificados
   */
  private retryImageLoad(originalUrl: string) {
    if (this.imageLoaded[originalUrl] || !this.imageFailed[originalUrl]) return; // Ya se cargó correctamente
    
    console.log('🔄 Intentando URL alternativa para imagen problemática:', originalUrl);
    
    // Intentar primero con URL alternativa
    const alternativeUrl = this.getAlternativeImageUrl(originalUrl);
    
    // Crear imagen temporal para probar la carga
    const testImg = new Image();
    testImg.onload = () => {
      // Si la imagen alternativa se carga, actualizar la URL en los datos
      console.log('✅ URL alternativa funcionó, actualizando imagen');
      this.updateImageUrl(originalUrl, alternativeUrl);
      this.imageLoaded[originalUrl] = true;
      this.imageFailed[originalUrl] = false;
    };
    testImg.onerror = () => {
      console.log('❌ URL alternativa también falló, manteniendo placeholder');
      this.imageFailed[originalUrl] = true;
      this.imageLoaded[originalUrl] = false;
    };
    testImg.src = alternativeUrl;
  }

  /**
   * Actualizar URL de imagen en los datos
   */
  private updateImageUrl(oldUrl: string, newUrl: string) {
    this.places.forEach(place => {
      if (place.imageUrl === oldUrl) {
        place.imageUrl = newUrl;
      }
    });
    this.filteredPlaces.forEach(place => {
      if (place.imageUrl === oldUrl) {
        place.imageUrl = newUrl;
      }
    });
  }

  // Helper methods para verificar estados de imágenes  
  isImageLoaded(url: string): boolean {
    return this.imageLoaded[url] === true;
  }

  hasImageFailed(url: string): boolean {
    return this.imageFailed[url] === true;
  }

  // trackBy for ngFor to keep DOM stable when list updates
  trackByPlace(index: number, item: PlacePhoto) {
    return item.id || index;
  }

  // Helper para futuro: calcular promedio (no usado aún)
  getAverageRating(placeId: string) {
    const p = this.places.find(x => x.id === placeId);
    return p ? p.rating : 0;
  }

  toggleLike(p: PlacePhoto) {
    this.placesService.toggleLike(p.id);
    // Actualizar estadísticas del usuario
    this.userService.updateUserStats('favorite', 1);
    // actualizar copia local
    this.placesService.getPlaceById(p.id).subscribe(updated => {
      if (!updated) return;
      const idx = this.places.findIndex(x => x.id === p.id);
      if (idx >= 0) this.places[idx] = updated;
    });
  }

  share(p: PlacePhoto) {
    this.placesService.share(p.id);
    // Actualizar estadísticas del usuario
    this.userService.updateUserStats('share', 1);
    this.placesService.getPlaceById(p.id).subscribe(updated => {
      if (!updated) return;
      const idx = this.places.findIndex(x => x.id === p.id);
      if (idx >= 0) this.places[idx] = updated;
    });
  }

  quickView(url: string) {
    this.quickViewImage = url;
    // Actualizar estadísticas del usuario
    this.userService.updateUserStats('view', 1);
  }

  closeQuickView() { this.quickViewImage = undefined; }



  // ✅ Nueva función para mostrar modal con detalles del lugar
  async onPhotoClick(place: PlacePhoto) {
    console.log('Mostrando detalles del lugar:', place);
    
    const modal = await this.modalCtrl.create({
      component: PlaceDetailModalComponent,
      componentProps: {
        place: place
      },
      cssClass: 'place-detail-modal',
      backdropDismiss: true,
      showBackdrop: true
    });

    await modal.present();
  }

  // 🔍 Función temporal de debug para validar coordenadas
  private validatePlaceCoordinates() {
    console.log('🌍 Validando coordenadas de lugares:');
    
    const placesWithCoords = this.places.filter(p => 
      p.coordinates?.latitude && p.coordinates?.longitude
    );
    const placesWithoutCoords = this.places.filter(p => 
      !p.coordinates?.latitude || !p.coordinates?.longitude
    );
    
    console.log(`✅ Lugares con coordenadas: ${placesWithCoords.length}/${this.places.length}`);
    console.log(`❌ Lugares sin coordenadas: ${placesWithoutCoords.length}/${this.places.length}`);
    
    if (placesWithoutCoords.length > 0) {
      console.warn('⚠️ Lugares sin coordenadas:', placesWithoutCoords.map(p => p.place));
    }
    
    // Mostrar algunas coordenadas de ejemplo
    if (placesWithCoords.length > 0) {
      console.log('📍 Ejemplos de coordenadas:');
      placesWithCoords.slice(0, 3).forEach(place => {
        console.log(`  ${place.place}: ${place.coordinates?.latitude}, ${place.coordinates?.longitude}`);
      });
    }
  }

  // Métodos usados en la plantilla
  goToPerfil() {
    this.router.navigate(['/profile']);
  }

  goToConfig() {
    this.router.navigate(['/settings']);
  }

  async confirmLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Cerrar sesión', role: 'confirm' }
      ]
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role !== 'cancel') {
      /**
       * Perform logout and navigate to login.
       *
       * Behavior:
       * - Calls `UserService.logout()` which clears the stored username from localStorage.
       * - Attempts an Angular router navigation to `/login` using `replaceUrl:true` so the
       *   history doesn't keep the protected pages.
       * - If navigation fails (or returns false) we fallback to a full page reload to `/login`.
       *
       * Inputs: none. Side-effects: clears persisted username and navigates the browser.
       * Error modes: router navigation rejection (handled with a hard redirect fallback).
       */
      this.userService.logout();
      // try Angular navigation first
      this.router.navigateByUrl('/login', { replaceUrl: true }).then(success => {
        if (!success) {
          // fallback: force a full reload to the login route
          window.location.href = '/login';
        }
      }).catch(() => {
        // fallback in case of unexpected error
        window.location.href = '/login';
      });
    }
  }

  /**
   * Verifica permisos de ubicación y obtiene la ubicación actual
   */
  async checkLocationPermission() {
    const hasPermission = await this.geolocationService.checkPermissions();
    
    if (hasPermission) {
      this.locationPermissionStatus = 'granted';
      // Actualizar lugares con distancias
      await this.placesService.refreshPlaces();
    } else {
      this.locationPermissionStatus = 'denied';
      // Preguntar al usuario si quiere habilitar ubicación
      this.showLocationPermissionAlert();
    }
  }

  /**
   * Muestra alerta para solicitar permisos de ubicación
   */
  private async showLocationPermissionAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Ubicación',
      message: '¿Quieres habilitar la ubicación para ver distancias a los lugares?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí',
          handler: async () => {
            const granted = await this.geolocationService.requestPermissions();
            if (granted) {
              this.locationPermissionStatus = 'granted';
              await this.placesService.refreshPlaces();
            }
          }
        }
      ]
    });
    
    await alert.present();
  }

  /**
   * Obtiene información de distancia para un lugar
   */
  getDistanceInfo(place: PlacePhoto): { distance: string; available: boolean } {
    return this.placesService.getDistanceInfo(place);
  }

  /**
   * Refresca los lugares y actualiza las distancias
   */
  async refreshPlaces(event?: any) {
    await this.placesService.refreshPlaces();
    
    if (event) {
      event.target.complete();
    }
  }
}
