import { Component, Input, OnInit, inject } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PlacePhoto } from '../../services/places.service';

@Component({
  selector: 'app-place-detail-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar class="modal-toolbar">
        <ion-title class="modal-title">{{ place.place }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close" color="light"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

      <ion-content class="modal-content">
      <!-- Imagen principal -->
      <div class="image-container">
        <img [src]="place.imageUrl" [alt]="place.place" class="main-image" />
        <div class="image-overlay">
          <div class="rating-badge">
            <ion-icon name="star" class="star-icon"></ion-icon>
            <span>{{ place.rating }}</span>
          </div>
        </div>
      </div>

      <!-- Información básica -->
      <div class="info-section">
        <div class="title-section">
          <h1>{{ place.place }}</h1>
          <p class="location">
            <ion-icon name="location-outline"></ion-icon>
            {{ place.location }}
          </p>
        </div>

        <!-- Distancia y estadísticas -->
        <div class="stats-container">
          <div class="stat-item">
            <ion-icon name="navigate-outline" color="primary"></ion-icon>
            <span>{{ place.distance }} km</span>
          </div>
          <div class="stat-item">
            <ion-icon name="star" color="warning"></ion-icon>
            <span>{{ place.rating }} rating</span>
          </div>
          <div class="stat-item">
            <ion-icon name="camera-outline" color="success"></ion-icon>
            <span>by {{ place.user }}</span>
          </div>
        </div>

        <!-- Descripción -->
        <div class="description-section">
          <h3>Acerca de este lugar</h3>
          <p>{{ place.description }}</p>
        </div>        <!-- Información adicional enriquecida -->
        <div class="enriched-info" *ngIf="enrichedInfo">
          <!-- Mejor época para visitar -->
          <div class="info-card">
            <h4>
              <ion-icon name="calendar-outline" color="primary"></ion-icon>
              Mejor época para visitar
            </h4>
            <p>{{ enrichedInfo.bestTime }}</p>
          </div>

          <!-- Clima típico -->
          <div class="info-card">
            <h4>
              <ion-icon name="partly-sunny-outline" color="warning"></ion-icon>
              Clima
            </h4>
            <p>{{ enrichedInfo.climate }}</p>
          </div>

          <!-- Cultura y highlights -->
          <div class="info-card">
            <h4>
              <ion-icon name="library-outline" color="success"></ion-icon>
              Highlights culturales
            </h4>
            <p>{{ enrichedInfo.culture }}</p>
          </div>

          <!-- Actividades recomendadas -->
          <div class="info-card">
            <h4>
              <ion-icon name="hiking-outline" color="tertiary"></ion-icon>
              Actividades recomendadas
            </h4>
            <p>{{ enrichedInfo.activities }}</p>
          </div>
        </div>

        <!-- Tags -->
        <div class="tags-section" *ngIf="place.tags && place.tags.length > 0">
          <h3>Características</h3>
          <div class="tags-container">
            <ion-chip 
              *ngFor="let tag of place.tags" 
              color="primary" 
              class="tag-chip"
            >
              <ion-label>{{ tag }}</ion-label>
            </ion-chip>
          </div>
        </div>

          <!-- Coordenadas para usuarios avanzados -->
        <div class="coordinates-section">
          <ion-card class="coordinates-card">
            <ion-card-content>
              <div class="coordinates-info">
                <ion-icon name="compass-outline" color="medium"></ion-icon>
                <div>
                  <p class="coord-label">
                    Coordenadas GPS
                    <ion-badge 
                      color="success" 
                      class="gps-status" 
                      *ngIf="place.coordinates?.latitude && place.coordinates?.longitude"
                    >
                      <ion-icon name="checkmark-circle" size="small"></ion-icon>
                      Disponible
                    </ion-badge>
                  </p>
                  <p class="coord-value" *ngIf="place.coordinates?.latitude && place.coordinates?.longitude">
                    {{ place.coordinates?.latitude?.toFixed(6) }}, {{ place.coordinates?.longitude?.toFixed(6) }}
                  </p>
                  <p class="coord-value" *ngIf="!place.coordinates?.latitude || !place.coordinates?.longitude">
                    Coordenadas no disponibles
                  </p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>        <!-- Acciones -->
        <div class="actions-section">
          <ion-button 
            expand="block" 
            fill="solid" 
            color="primary" 
            (click)="openInMaps()" 
            class="maps-button"
          >
            <ion-icon name="map-outline" slot="start"></ion-icon>
            Ver ubicación en mapas
            <ion-icon name="open-outline" slot="end"></ion-icon>
          </ion-button>
          
          <div class="action-buttons">
            <ion-button fill="outline" color="success" (click)="sharePlace()">
              <ion-icon name="share-social-outline" slot="icon-only"></ion-icon>
            </ion-button>
            
            <ion-button fill="outline" color="warning" (click)="addToFavorites()">
              <ion-icon name="heart-outline" slot="icon-only"></ion-icon>
            </ion-button>
            
            <ion-button fill="outline" color="tertiary" (click)="downloadImage()">
              <ion-icon name="download-outline" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styleUrl: './place-detail-modal.component.scss'
})
export class PlaceDetailModalComponent implements OnInit {
  @Input() place!: PlacePhoto;
  
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  
  enrichedInfo: any = null;

  ngOnInit() {
    this.loadEnrichedInfo();
    // Debug: mostrar información del lugar en consola
    console.log('🏞️ Lugar seleccionado:', {
      place: this.place.place,
      coordinates: this.place.coordinates,
      location: this.place.location,
      hasCoordinates: !!(this.place.coordinates?.latitude && this.place.coordinates?.longitude)
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  loadEnrichedInfo() {
    // Información enriquecida basada en el lugar
    const enrichedData: { [key: string]: any } = {
      'Machu Picchu': {
        bestTime: 'Mayo a septiembre (temporada seca)',
        climate: 'Subtropical de montaña, temperaturas 6-19°C',
        culture: 'Ciudadela inca del siglo XV, Patrimonio de la Humanidad',
        activities: 'Trekking, fotografía, tours guiados, contemplación del amanecer'
      },
      'Santorini': {
        bestTime: 'Abril a octubre (clima mediterráneo ideal)',
        climate: 'Mediterráneo, veranos cálidos y secos',
        culture: 'Arquitectura cicládica, pueblos blancos y azules',
        activities: 'Atardeceres en Oia, tours de vino, playas volcánicas'
      },
      'Banff National Park': {
        bestTime: 'Junio a septiembre para hiking, diciembre a marzo para esquí',
        climate: 'Continental húmedo, inviernos fríos y veranos templados',
        culture: 'Primer parque nacional de Canadá, paisajes alpinos',
        activities: 'Hiking, esquí, observación de vida silvestre, lagos glaciales'
      },
      'Bali': {
        bestTime: 'Abril a octubre (temporada seca)',
        climate: 'Tropical, cálido y húmedo todo el año',
        culture: 'Templos hindúes, terrazas de arroz, tradiciones balinesas',
        activities: 'Surf, yoga, templos, artes tradicionales, gastronomía'
      },
      'Swiss Alps': {
        bestTime: 'Junio a septiembre para hiking, diciembre a marzo para esquí',
        climate: 'Alpino, inviernos fríos con nieve, veranos frescos',
        culture: 'Tradiciones alpinas suizas, arquitectura de montaña',
        activities: 'Esquí, montañismo, senderismo, teleféricos panorámicos'
      },
      'Northern Lights': {
        bestTime: 'Septiembre a marzo (noches más largas)',
        climate: 'Subártico, muy frío en invierno',
        culture: 'Fenómeno natural, importante en culturas nórdicas',
        activities: 'Observación de auroras, fotografía nocturna, tours especializados'
      },
      'Great Barrier Reef': {
        bestTime: 'Abril a noviembre (temporada seca)',
        climate: 'Tropical, cálido y húmedo, temporada de lluvias dic-mar',
        culture: 'Patrimonio natural, importante para pueblos aborígenes',
        activities: 'Snorkel, buceo, tours en barco, observación marina'
      },
      'Sahara Desert': {
        bestTime: 'Octubre a abril (temperaturas más frescas)',
        climate: 'Desértico, muy caliente en el día, frío en la noche',
        culture: 'Culturas nómadas, tradiciones bereber y tuareg',
        activities: 'Camellos, camping bajo estrellas, dunas, oasis'
      },
      'Kyoto': {
        bestTime: 'Marzo-mayo y septiembre-noviembre (sakura y momiji)',
        climate: 'Subtropical húmedo, cuatro estaciones bien definidas',
        culture: 'Antigua capital imperial, templos, geishas, ceremonia del té',
        activities: 'Templos y jardines, barrio de Gion, bambusales, kaiseki'
      },
      'Patagonia': {
        bestTime: 'Noviembre a marzo (verano austral)',
        climate: 'Subpolar oceánico, vientos fuertes, cambios bruscos',
        culture: 'Paisajes prístinos, culturas gaucha y tehuelche',
        activities: 'Trekking, glaciares, fauna silvestre, Torres del Paine'
      },
      'Maldives': {
        bestTime: 'Noviembre a abril (temporada seca)',
        climate: 'Tropical, cálido todo el año, monzones mayo-octubre',
        culture: 'Cultura isleña, arquitectura sobre agua, sostenibilidad',
        activities: 'Buceo, snorkel, resorts sobre agua, vida marina'
      },
      'Amazon Rainforest': {
        bestTime: 'Mayo a septiembre (temporada menos lluviosa)',
        climate: 'Ecuatorial, caliente y húmedo todo el año',
        culture: 'Pueblos indígenas, biodiversidad única mundial',
        activities: 'Ecoturismo, observación de fauna, canopy, medicina tradicional'
      },
      'Norwegian Fjords': {
        bestTime: 'Mayo a septiembre (sol de medianoche)',
        climate: 'Oceánico subpolar, moderado por la corriente del Golfo',
        culture: 'Herencia vikinga, pueblos pesqueros tradicionales',
        activities: 'Cruceros por fiordos, hiking, cascadas, sol de medianoche'
      },
      'Petra': {
        bestTime: 'Marzo-mayo y septiembre-noviembre',
        climate: 'Desértico, caliente en verano, templado en invierno',
        culture: 'Ciudad nabatea tallada en roca, Patrimonio de la Humanidad',
        activities: 'Arqueología, trekking, Treasury, Monastery, cultura beduina'
      },
      'Victoria Falls': {
        bestTime: 'Febrero a mayo (mayor caudal) y septiembre-octubre',
        climate: 'Subtropical, temporada seca y lluviosa bien marcadas',
        culture: 'Sagrada para pueblos locales, frontera Zambia-Zimbabue',
        activities: 'Observación de cataratas, bungee jumping, safaris, Zambezi'
      }
    };

    this.enrichedInfo = enrichedData[this.place.place] || null;
  }

  async openInMaps() {
    if (this.place.coordinates?.latitude && this.place.coordinates?.longitude) {
      const lat = this.place.coordinates.latitude;
      const lng = this.place.coordinates.longitude;
      const placeName = encodeURIComponent(this.place.place);
      
      // Mostrar toast de confirmación
      const toast = await this.toastCtrl.create({
        message: `🗺️ Abriendo ${this.place.place} en mapas...`,
        duration: 2000,
        position: 'top',
        color: 'primary',
        icon: 'map-outline'
      });
      await toast.present();
      
      // Detectar si es un dispositivo móvil
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // En móviles, intentar abrir la app nativa de mapas
        const googleMapsApp = `https://maps.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=15`;
        const appleMapApp = `http://maps.apple.com/?q=${placeName}&ll=${lat},${lng}&z=15`;
        
        // Intentar detectar iOS para usar Apple Maps
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        if (isIOS) {
          // Intentar abrir Apple Maps primero en iOS
          window.location.href = appleMapApp;
        } else {
          // Para Android y otros, usar Google Maps
          window.location.href = googleMapsApp;
        }
      } else {
        // En desktop, abrir en nueva pestaña con más opciones
        const googleMapsWeb = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${placeName}`;
        window.open(googleMapsWeb, '_blank');
      }
      
      console.log(`Abriendo mapas para ${this.place.place} en coordenadas:`, { lat, lng });
    } else {
      // Fallback si no hay coordenadas
      console.warn('No hay coordenadas disponibles para este lugar');
      
      const toast = await this.toastCtrl.create({
        message: `⚠️ Buscando ${this.place.place} por nombre...`,
        duration: 2000,
        position: 'top',
        color: 'warning',
        icon: 'search-outline'
      });
      await toast.present();
      
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(this.place.place)}`;
      window.open(searchUrl, '_blank');
    }
  }

  async sharePlace() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: this.place.place,
          text: `Mira este increíble lugar: ${this.place.description}`,
          url: this.place.imageUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback para navegadores que no soporten Web Share API
      navigator.clipboard.writeText(`${this.place.place} - ${this.place.imageUrl}`);
    }
  }

  addToFavorites() {
    // Implementar lógica de favoritos
    console.log('Agregado a favoritos:', this.place.place);
  }

  downloadImage() {
    // Crear un enlace temporal para descargar la imagen
    const link = document.createElement('a');
    link.href = this.place.imageUrl;
    link.download = `${this.place.place.replace(/\s+/g, '_')}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}