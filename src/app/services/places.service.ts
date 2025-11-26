import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { GeolocationService } from './geolocation.service';
import { UnsplashService } from './unsplash.service';

export interface PlacePhoto {
  id: string;
  place: string;
  imageUrl: string;
  rating: number;
  location: string;
  user: string;
  comments?: Array<{ user: string; text: string; created: string }>
  gallery?: string[];
  likes?: number;
  likedByUser?: boolean;
  shares?: number;
  // Nuevos campos para geolocalización y datos enriquecidos
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // Distancia desde la ubicación actual en km
  description?: string; // Descripción extendida del lugar
  thumbnailUrl?: string; // URL de miniatura
  tags?: string[]; // Tags para categorización
  country?: string; // País extraído de la ubicación
}

@Injectable({ providedIn: 'root' })
export class PlacesService {
  private places: PlacePhoto[] = [];
  private placesSubject = new BehaviorSubject<PlacePhoto[]>([]);
  private selectedCountry = new BehaviorSubject<string | null>(null);
  private userLocation: { latitude: number; longitude: number } | null = null;

  constructor(
    private geolocationService: GeolocationService,
    private unsplashService: UnsplashService
  ) {
    this.initializePlaces();
  }

  /**
   * Inicializa los lugares con coordenadas y calcula distancias
   */
  private async initializePlaces() {
    // Intentar obtener ubicación del usuario
    const result = await this.geolocationService.getCurrentPosition();
    if (result.success && result.coordinates) {
      this.userLocation = {
        latitude: result.coordinates.latitude,
        longitude: result.coordinates.longitude
      };
    }

    this.loadPlacesWithCoordinates();
  }
  /**
   * Carga lugares con coordenadas GPS y calcula distancias
   */
  private loadPlacesWithCoordinates() {
    // Cargar datos desde UnsplashService
    this.unsplashService.searchLandscapes().subscribe(landscapes => {
      this.places = landscapes.map(landscape => ({
        id: landscape.id,
        place: landscape.title,
        imageUrl: landscape.imageUrl,
        rating: Math.min(4.5 + (landscape.likes / 200), 5.0), // Calcular rating basado en likes
        location: landscape.location ? `${landscape.location.name}, ${landscape.location.country}` : 'Ubicación no disponible',
        user: landscape.photographer,
        coordinates: landscape.coordinates,
        description: landscape.description,
        thumbnailUrl: landscape.thumbnailUrl,
        tags: landscape.tags,
        country: landscape.location?.country || 'Desconocido',
        comments: [],
        gallery: [landscape.imageUrl],
        likes: landscape.likes,
        likedByUser: false,
        shares: Math.floor(landscape.likes / 10)
      }));

      // Calcular distancias si tenemos ubicación del usuario
      if (this.userLocation) {
        this.places.forEach(place => {
          if (place.coordinates) {
            place.distance = this.geolocationService.calculateDistance(
              this.userLocation!.latitude,
              this.userLocation!.longitude,
              place.coordinates.latitude,
              place.coordinates.longitude
            );
          }
        });

        // Ordenar por distancia
        this.places.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }

      this.placesSubject.next(this.places.slice());
    });
  }

  // Métodos públicos de la API

  getPlaces(): Observable<PlacePhoto[]> {
    /**
     * Returns an observable stream of the current places list.
     *
     * Consumers should subscribe to receive updates when the list changes.
     * Output: Observable<PlacePhoto[]> (emits a shallow copy of internal array)
     */
    return this.placesSubject.asObservable();
  }

  filterByCountry(country: string | null) {
    /**
     * Filtra los lugares por país.
     * Si country es null, muestra todos los lugares.
     */
    this.selectedCountry.next(country);
    if (country === null) {
      this.placesSubject.next(this.places.slice());
    } else {
      const filteredPlaces = this.places.filter(place => 
        place.country === country || place.location.includes(country)
      );
      this.placesSubject.next(filteredPlaces);
    }
  }

  getCurrentCountry(): Observable<string | null> {
    return this.selectedCountry.asObservable();
  }

  getPlaceById(id: string): Observable<PlacePhoto | undefined> {
    /**
     * Retrieve a single PlacePhoto by id.
     * Returns an Observable of a shallow-copied object or undefined if not found.
     */
    const p = this.places.find(x => x.id === id);
    return of(p ? { ...p } : undefined);
  }

  addComment(placeId: string, user: string, text: string) {
    /**
     * Add a comment to a place.
     * Side-effect: mutates internal array and emits updated places via BehaviorSubject.
     * If the place does not exist, the function is a no-op.
     */
    const p = this.places.find(x => x.id === placeId);
    if (!p) return;
    p.comments = p.comments || [];
    p.comments.push({ user, text, created: new Date().toISOString() });
    this.placesSubject.next(this.places.slice());
  }

  addRating(placeId: string, rating: number) {
    /**
     * Add a rating to a place.
     * Note: current logic uses a naive averaging for demo purposes.
     */
    const p = this.places.find(x => x.id === placeId);
    if (!p) return;
    // simple average update: (oldRating + newRating)/2 - placeholder logic
    p.rating = Math.round(((p.rating + rating) / 2) * 10) / 10;
    this.placesSubject.next(this.places.slice());
  }

  toggleLike(placeId: string) {
    /**
     * Toggle the like flag for the current user on the given place.
     * Updates like count and emits the new list.
     */
    const p = this.places.find(x => x.id === placeId);
    if (!p) return;
    p.likedByUser = !p.likedByUser;
    p.likes = (p.likes || 0) + (p.likedByUser ? 1 : -1);
    this.placesSubject.next(this.places.slice());
  }

  share(placeId: string) {
    /**
     * Increment the share counter for the place. This is a local-only mock and does not
     * integrate with native share APIs or a backend.
     */
    const p = this.places.find(x => x.id === placeId);
    if (!p) return;
    p.shares = (p.shares || 0) + 1;
    this.placesSubject.next(this.places.slice());
  }

  // Add a new place (used for photos captured by user)
  addPlace(data: { place: string; imageUrl: string; location?: string; user?: string; coordinates?: { latitude: number; longitude: number } }) {
    const id = (this.places.length + 1).toString();
    const newPlace: PlacePhoto = {
      id,
      place: data.place,
      imageUrl: data.imageUrl,
      rating: 0,
      location: data.location || '',
      user: data.user || 'Usuario',
      comments: [],
      gallery: [data.imageUrl],
      likes: 0,
      likedByUser: false,
      shares: 0,
      coordinates: data.coordinates
    };

    // Calcular distancia si tenemos ubicación del usuario y coordenadas del lugar
    if (this.userLocation && newPlace.coordinates) {
      newPlace.distance = this.geolocationService.calculateDistance(
        this.userLocation.latitude,
        this.userLocation.longitude,
        newPlace.coordinates.latitude,
        newPlace.coordinates.longitude
      );
    }

    this.places.unshift(newPlace);
    this.placesSubject.next(this.places.slice());
  }

  /**
   * Recarga los lugares y actualiza las distancias
   */
  async refreshPlaces() {
    // Intentar obtener ubicación del usuario
    const result = await this.geolocationService.getCurrentPosition();
    if (result.success && result.coordinates) {
      this.userLocation = {
        latitude: result.coordinates.latitude,
        longitude: result.coordinates.longitude
      };
    }
    
    // Recalcular distancias para todos los lugares existentes
    if (this.userLocation) {
      this.places.forEach(place => {
        if (place.coordinates) {
          place.distance = this.geolocationService.calculateDistance(
            this.userLocation!.latitude,
            this.userLocation!.longitude,
            place.coordinates.latitude,
            place.coordinates.longitude
          );
        }
      });

      // Reordenar por distancia
      this.places.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    this.placesSubject.next(this.places.slice());
  }

  /**
   * Obtiene lugares cercanos (dentro de un radio específico)
   */
  getNearbyPlaces(radiusKm: number = 100): Observable<PlacePhoto[]> {
    if (!this.userLocation) {
      return of([]);
    }

    const nearbyPlaces = this.places.filter(place => 
      place.distance !== undefined && place.distance <= radiusKm
    );

    return of(nearbyPlaces);
  }

  /**
   * Busca lugares por texto
   */
  searchPlaces(query: string): Observable<PlacePhoto[]> {
    const lowerQuery = query.toLowerCase();
    const results = this.places.filter(place => 
      place.place.toLowerCase().includes(lowerQuery) ||
      place.location.toLowerCase().includes(lowerQuery) ||
      place.description?.toLowerCase().includes(lowerQuery) ||
      place.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
    
    return of(results);
  }

  /**
   * Obtiene información de distancia formateada para mostrar en UI
   */
  getDistanceInfo(place: PlacePhoto): { distance: string; available: boolean } {
    if (place.distance === undefined) {
      return { distance: 'Ubicación no disponible', available: false };
    }
    
    return {
      distance: this.geolocationService.formatDistance(place.distance),
      available: true
    };
  }
}
