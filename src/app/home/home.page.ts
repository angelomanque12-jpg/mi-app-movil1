import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router'; // ✅ Importamos el Router
import { UserService } from '../services/user.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PlacePhoto {
  id: string;
  place: string;
  imageUrl: string;
  rating: number;
  location: string;
  user: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {

  places: PlacePhoto[] = [];
  username: string = 'Usuario';

  // ✅ Inyectamos el Router en el constructor
  private router = inject(Router);
  private userService = inject(UserService);

  ngOnInit() {
    this.loadMockData();
    // Obtener username real del servicio (si existe)
    const name = this.userService.getUsername();
    if (name) {
      this.username = name;
    }
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

  logout() {
    // Cerrar sesión desde servicio y redirigir a login
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
