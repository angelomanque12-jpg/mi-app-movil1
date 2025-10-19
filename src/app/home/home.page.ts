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
import { IonicModule, AlertController, AlertInput } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  places: PlacePhoto[] = [];
  username: string = 'Usuario';
  filteredPlaces: PlacePhoto[] = [];
  searchTerm = '';

  // ✅ Inyectamos el Router en el constructor
  private router = inject(Router);
  private userService = inject(UserService);
  private placesService = inject(PlacesService);
  private boardsService = inject(BoardsService);
  private alertCtrl = inject(AlertController);
  loading = true;
  quickViewImage?: string;
  // track images that failed to load to avoid flicker/retry loops
  imageFailed: Record<string, boolean> = {};

  ngOnInit() {
  this.placesService.getPlaces().subscribe(list => { this.places = list; this.filteredPlaces = list.slice(); this.loading = false; });
    // Obtener username real del servicio (si existe)
    const name = this.userService.getUsername();
    if (name) this.username = name;
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
    if (!url) return 'assets/icon/placeholder.png';
    // if this url previously failed, return placeholder
    if (this.imageFailed[url]) return 'assets/icon/placeholder.png';
    return url;
  }

  onImageLoad(idOrUrl: string) {
    // if we tracked this as failed earlier, clear it
    if (this.imageFailed[idOrUrl]) delete this.imageFailed[idOrUrl];
  }
  onImageError(url?: string) {
    // Mark failed URL so safeImage will return placeholder next render
    if (url) this.imageFailed[url] = true;
    // Trigger small update to arrays so Angular re-evaluates bindings without DOM-direct manipulation
    this.filteredPlaces = this.filteredPlaces.slice();
    this.places = this.places.slice();
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
    // actualizar copia local
    this.placesService.getPlaceById(p.id).subscribe(updated => {
      if (!updated) return;
      const idx = this.places.findIndex(x => x.id === p.id);
      if (idx >= 0) this.places[idx] = updated;
    });
  }

  share(p: PlacePhoto) {
    this.placesService.share(p.id);
    this.placesService.getPlaceById(p.id).subscribe(updated => {
      if (!updated) return;
      const idx = this.places.findIndex(x => x.id === p.id);
      if (idx >= 0) this.places[idx] = updated;
    });
  }

  quickView(url: string) {
    this.quickViewImage = url;
  }

  closeQuickView() { this.quickViewImage = undefined; }

  // ✅ Nueva función para navegar al detalle
  onPhotoClick(place: PlacePhoto) {
    console.log('Ir a detalle del lugar:', place);
    this.router.navigate(['/place-detail', place.id]); // 👈 Navega al detalle con el ID
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
}
