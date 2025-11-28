/**
 * Servicio de integración con Unsplash API
 * 
 * Este servicio se conecta con Unsplash para obtener imágenes de paisajes
 * de alta calidad con información de ubicación y metadatos.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

// Clave de acceso de Unsplash (pública, solo lectura)
// Para producción, considera usar variables de entorno
const UNSPLASH_ACCESS_KEY = 'your-unsplash-access-key';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

export interface UnsplashPhoto {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  likes: number;
  user: {
    id: string;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    twitter_username: string | null;
    portfolio_url: string | null;
    bio: string | null;
    location: string | null;
    links: {
      self: string;
      html: string;
      photos: string;
      likes: string;
      portfolio: string;
      following: string;
      followers: string;
    };
    profile_image: {
      small: string;
      medium: string;
      large: string;
    };
    instagram_username: string | null;
    total_collections: number;
    total_likes: number;
    total_photos: number;
  };
  location?: {
    title: string | null;
    name: string | null;
    city: string | null;
    country: string | null;
    position: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  exif?: {
    make: string | null;
    model: string | null;
    exposure_time: string | null;
    aperture: string | null;
    focal_length: string | null;
    iso: number | null;
  };
}

export interface ProcessedLandscape {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  photographer: string;
  photographerUrl: string;
  unsplashUrl: string;
  likes: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  location?: {
    city?: string;
    country?: string;
    name?: string;
  };
  tags: string[];
  color: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UnsplashService {

  // Lista de coordenadas de lugares famosos para usar cuando Unsplash no tenga datos de ubicación
  private readonly FAMOUS_LOCATIONS = [
    { name: 'Torres del Paine', country: 'Chile', lat: -50.9423, lng: -73.4068, tags: ['patagonia', 'mountains', 'chile'], imageUrl: 'https://torresdelpaine.com/wp-content/uploads/sites/6/2025/08/torres-del-paine-2-dias-600x338.jpg', thumbUrl: 'https://torresdelpaine.com/wp-content/uploads/sites/6/2025/08/torres-del-paine-2-dias-600x338.jpg' },
    { name: 'Machu Picchu', country: 'Peru', lat: -13.1631, lng: -72.5450, tags: ['peru', 'andes', 'ruins'], imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop&auto=format&q=80', thumbUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=300&h=200&fit=crop&auto=format&q=80' },
    { name: 'Salar de Uyuni', country: 'Bolivia', lat: -20.1338, lng: -67.4891, tags: ['salt', 'desert', 'bolivia'], imageUrl: 'https://imagenes.elpais.com/resizer/v2/MGN6UNRGHZEBLHKLUR6ASE4XZY.jpg?auth=4725b0113426c6cdc68ee70519927437d2736ea989f93209fbb32e2797a1c19d&width=1960&height=1470&focal=2473%2C2062', thumbUrl: 'https://imagenes.elpais.com/resizer/v2/MGN6UNRGHZEBLHKLUR6ASE4XZY.jpg?auth=4725b0113426c6cdc68ee70519927437d2736ea989f93209fbb32e2797a1c19d&width=1960&height=1470&focal=2473%2C2062' },
    { name: 'Cataratas del Iguazú', country: 'Argentina', lat: -25.6953, lng: -54.4367, tags: ['waterfall', 'jungle', 'argentina'], imageUrl: 'https://gpsviajes.com.ar/inicio/wp-content/uploads/2021/08/cataratas-iguazu-panoramica.jpeg', thumbUrl: 'https://gpsviajes.com.ar/inicio/wp-content/uploads/2021/08/cataratas-iguazu-panoramica.jpeg' },
    { name: 'Atacama Desert', country: 'Chile', lat: -24.5000, lng: -69.2500, tags: ['desert', 'chile', 'astronomy'], imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80', thumbUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&auto=format&q=80' },
    { name: 'Bariloche', country: 'Argentina', lat: -41.1335, lng: -71.3103, tags: ['lakes', 'mountains', 'argentina'], imageUrl: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=800&h=600&fit=crop&auto=format&q=80', thumbUrl: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=300&h=200&fit=crop&auto=format&q=80' },
    { name: 'Galápagos Islands', country: 'Ecuador', lat: -0.9538, lng: -90.9656, tags: ['islands', 'wildlife', 'ecuador'], imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&auto=format&q=80', thumbUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=200&fit=crop&auto=format&q=80' },
    { name: 'Cataratas del Ángel', country: 'Venezuela', lat: 5.9692, lng: -62.5362, tags: ['waterfall', 'jungle', 'venezuela'], imageUrl: 'https://www.journeylatinamerica.com/app/uploads/destinations/venezuela/angel-falls-and-the-gran-sabana/ven_angelfalls_shutterstock_141881491-scaled-1024x683-c-center.jpg', thumbUrl: 'https://www.journeylatinamerica.com/app/uploads/destinations/venezuela/angel-falls-and-the-gran-sabana/ven_angelfalls_shutterstock_141881491-scaled-1024x683-c-center.jpg' },
    { name: 'Fernando de Noronha', country: 'Brazil', lat: -3.8536, lng: -32.4297, tags: ['beach', 'island', 'brazil'], imageUrl: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=800&h=600&fit=crop&auto=format&q=80', thumbUrl: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=300&h=200&fit=crop&auto=format&q=80' },
    { name: 'Perito Moreno Glacier', country: 'Argentina', lat: -50.4698, lng: -73.0306, tags: ['glacier', 'patagonia', 'argentina'], imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop&auto=format&q=80', thumbUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=200&fit=crop&auto=format&q=80' },
    { name: 'Milford Sound', country: 'New Zealand', lat: -44.6700, lng: 167.9250, tags: ['fjord', 'mountains', 'newzealand'], imageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&h=600&fit=crop&auto=format&q=80', thumbUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=300&h=200&fit=crop&auto=format&q=80' },
    { name: 'Mont Blanc', country: 'France', lat: 45.8326, lng: 6.8652, tags: ['mountains', 'alps', 'france'], imageUrl: 'https://images.unsplash.com/photo-1464822759844-d150ad6bf55c?w=800&h=600&fit=crop&auto=format&q=80', thumbUrl: 'https://images.unsplash.com/photo-1464822759844-d150ad6bf55c?w=300&h=200&fit=crop&auto=format&q=80' },
    { name: 'Banff National Park', country: 'Canada', lat: 51.4968, lng: -115.9281, tags: ['mountains', 'lakes', 'canada'], imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop&auto=format&q=80', thumbUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=300&h=200&fit=crop&auto=format&q=80' },
    { name: 'Santorini', country: 'Greece', lat: 36.3932, lng: 25.4615, tags: ['islands', 'sunset', 'greece'], imageUrl: 'https://www.marriott.com/content/dam/marriott-digital/destinations/destinationheroimages/en_us/photo/assets/pdt-grc-santorini-587986249568062.jpg', thumbUrl: 'https://www.marriott.com/content/dam/marriott-digital/destinations/destinationheroimages/en_us/photo/assets/pdt-grc-santorini-587986249568062.jpg' },
    { name: 'Yosemite Valley', country: 'USA', lat: 37.7455, lng: -119.5936, tags: ['valley', 'mountains', 'usa'], imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&auto=format&q=80', thumbUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop&auto=format&q=80' }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Busca fotos de paisajes en Unsplash
   * @param query Término de búsqueda (ej: 'landscape', 'mountain', 'beach')
   * @param page Página de resultados (1-indexed)
   * @param perPage Número de fotos por página (máximo 30)
   * @returns Observable<ProcessedLandscape[]>
   */
  searchLandscapes(query: string = 'landscape', page: number = 1, perPage: number = 20): Observable<ProcessedLandscape[]> {
    // Usar datos mock si no hay clave API configurada
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'your-unsplash-access-key') {
      return this.getMockLandscapes();
    }

    const url = `${UNSPLASH_API_URL}/search/photos`;
    const params = {
      query: query + ' landscape nature',
      page: page.toString(),
      per_page: perPage.toString(),
      orientation: 'landscape',
      order_by: 'relevant',
      client_id: UNSPLASH_ACCESS_KEY
    };

    return this.http.get<any>(url, { params }).pipe(
      map(response => this.processUnsplashResults(response.results || [])),
      catchError(error => {
        console.error('Error al buscar en Unsplash:', error);
        return this.getMockLandscapes();
      })
    );
  }

  /**
   * Obtiene fotos de paisajes por país
   * @param country País a buscar
   * @returns Observable<ProcessedLandscape[]>
   */
  getLandscapesByCountry(country: string): Observable<ProcessedLandscape[]> {
    const searchQuery = `${country} landscape nature scenic`;
    return this.searchLandscapes(searchQuery);
  }

  /**
   * Obtiene detalles específicos de una foto
   * @param photoId ID de la foto en Unsplash
   * @returns Observable<ProcessedLandscape | null>
   */
  getPhotoDetails(photoId: string): Observable<ProcessedLandscape | null> {
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'your-unsplash-access-key') {
      return of(null);
    }

    const url = `${UNSPLASH_API_URL}/photos/${photoId}`;
    const params = { client_id: UNSPLASH_ACCESS_KEY };

    return this.http.get<UnsplashPhoto>(url, { params }).pipe(
      map(photo => this.processUnsplashPhoto(photo)),
      catchError(error => {
        console.error('Error al obtener detalles de foto:', error);
        return of(null);
      })
    );
  }

  /**
   * Procesa los resultados de Unsplash y los convierte al formato de la app
   * @param photos Array de fotos de Unsplash
   * @returns ProcessedLandscape[]
   */
  private processUnsplashResults(photos: UnsplashPhoto[]): ProcessedLandscape[] {
    return photos.map(photo => this.processUnsplashPhoto(photo));
  }

  /**
   * Procesa una foto individual de Unsplash
   * @param photo Foto de Unsplash
   * @returns ProcessedLandscape
   */
  private processUnsplashPhoto(photo: UnsplashPhoto): ProcessedLandscape {
    // Si no tiene ubicación en Unsplash, asignar una ubicación famosa aleatoria
    let coordinates: { latitude: number; longitude: number } | undefined;
    let location: { city?: string; country?: string; name?: string } | undefined;

    if (photo.location?.position?.latitude && photo.location?.position?.longitude) {
      coordinates = {
        latitude: photo.location.position.latitude,
        longitude: photo.location.position.longitude
      };
      location = {
        city: photo.location.city || undefined,
        country: photo.location.country || undefined,
        name: photo.location.name || photo.location.title || undefined
      };
    } else {
      // Asignar ubicación aleatoria de lugares famosos
      const randomLocation = this.FAMOUS_LOCATIONS[Math.floor(Math.random() * this.FAMOUS_LOCATIONS.length)];
      coordinates = {
        latitude: randomLocation.lat,
        longitude: randomLocation.lng
      };
      location = {
        name: randomLocation.name,
        country: randomLocation.country
      };
    }

    // Generar título y descripción mejorados
    const title = location?.name || 
                 photo.alt_description || 
                 photo.description || 
                 'Paisaje Natural';

    const description = photo.description || 
                       photo.alt_description || 
                       `Hermoso paisaje fotografiado por ${photo.user.name}${location?.country ? ` en ${location.country}` : ''}`;

    // Extraer tags de la descripción y ubicación
    const tags: string[] = [];
    if (location?.country) tags.push(location.country.toLowerCase());
    if (location?.city) tags.push(location.city.toLowerCase());
    if (photo.alt_description) {
      tags.push(...photo.alt_description.split(' ').filter(word => word.length > 3).slice(0, 3));
    }

    return {
      id: photo.id,
      title: this.capitalizeTitle(title),
      description,
      imageUrl: photo.urls.regular,
      thumbnailUrl: photo.urls.small,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      unsplashUrl: photo.links.html,
      likes: photo.likes,
      coordinates,
      location,
      tags: [...new Set(tags)], // Eliminar duplicados
      color: photo.color,
      createdAt: photo.created_at
    };
  }

  /**
   * Capitaliza correctamente el título
   * @param title Título a capitalizar
   * @returns Título capitalizado
   */
  private capitalizeTitle(title: string): string {
    return title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Obtiene paisajes mock para desarrollo y fallback
   * @returns Observable<ProcessedLandscape[]>
   */
  private getMockLandscapes(): Observable<ProcessedLandscape[]> {
    // URLs reales de Unsplash para cada ubicación
    const realImageUrls = [
      // Torres del Paine - Chile
      'https://torresdelpaine.com/wp-content/uploads/sites/6/2025/08/torres-del-paine-2-dias-600x338.jpg',
      // Machu Picchu - Peru
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop&auto=format&q=80',
      // Salar de Uyuni - Bolivia
      'https://imagenes.elpais.com/resizer/v2/MGN6UNRGHZEBLHKLUR6ASE4XZY.jpg?auth=4725b0113426c6cdc68ee70519927437d2736ea989f93209fbb32e2797a1c19d&width=1960&height=1470&focal=2473%2C2062',
      // Cataratas del Iguazú - Argentina
      'https://gpsviajes.com.ar/inicio/wp-content/uploads/2021/08/cataratas-iguazu-panoramica.jpeg',
      // Desierto de Atacama - Chile
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80',
      // Valle de la Luna - Chile  
      'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=800&h=600&fit=crop&auto=format&q=80',
      // Geysers del Tatio - Chile
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&auto=format&q=80',
      // Laguna Colorada - Bolivia
      'https://images.unsplash.com/photo-1587837073080-448bc6a2329b?w=800&h=600&fit=crop&auto=format&q=80',
      // Glaciar Perito Moreno - Argentina
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop&auto=format&q=80',
      // Caño Cristales - Colombia
      'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop&auto=format&q=80',
      // Valle del Cocora - Colombia
      'https://images.unsplash.com/photo-1574263867128-3cfb3d71b55a?w=800&h=600&fit=crop&auto=format&q=80',
      // Fernando de Noronha - Brasil
      'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=800&h=600&fit=crop&auto=format&q=80',
      // Lençóis Maranhenses - Brasil
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&auto=format&q=80',
      // Cataratas del Ángel - Venezuela
      'https://www.journeylatinamerica.com/app/uploads/destinations/venezuela/angel-falls-and-the-gran-sabana/ven_angelfalls_shutterstock_141881491-scaled-1024x683-c-center.jpg',
      // Mont Blanc - Francia/Italia
      'https://images.unsplash.com/photo-1464822759844-d150ad6bf55c?w=800&h=600&fit=crop&auto=format&q=80',
      // Santorini - Grecia
      'https://www.marriott.com/content/dam/marriott-digital/destinations/destinationheroimages/en_us/photo/assets/pdt-grc-santorini-587986249568062.jpg'
    ];

    const realThumbnailUrls = [
      // Torres del Paine - Chile
      'https://torresdelpaine.com/wp-content/uploads/sites/6/2025/08/torres-del-paine-2-dias-600x338.jpg',
      // Machu Picchu - Peru
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=300&h=200&fit=crop&auto=format&q=80',
      // Salar de Uyuni - Bolivia
      'https://imagenes.elpais.com/resizer/v2/MGN6UNRGHZEBLHKLUR6ASE4XZY.jpg?auth=4725b0113426c6cdc68ee70519927437d2736ea989f93209fbb32e2797a1c19d&width=1960&height=1470&focal=2473%2C2062',
      // Cataratas del Iguazú - Argentina
      'https://gpsviajes.com.ar/inicio/wp-content/uploads/2021/08/cataratas-iguazu-panoramica.jpeg',
      // Desierto de Atacama - Chile
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&auto=format&q=80',
      // Valle de la Luna - Chile
      'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=300&h=200&fit=crop&auto=format&q=80',
      // Geysers del Tatio - Chile
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=200&fit=crop&auto=format&q=80',
      // Laguna Colorada - Bolivia
      'https://images.unsplash.com/photo-1587837073080-448bc6a2329b?w=300&h=200&fit=crop&auto=format&q=80',
      // Glaciar Perito Moreno - Argentina
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=200&fit=crop&auto=format&q=80',
      // Caño Cristales - Colombia
      'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=300&h=200&fit=crop&auto=format&q=80',
      // Valle del Cocora - Colombia
      'https://images.unsplash.com/photo-1574263867128-3cfb3d71b55a?w=300&h=200&fit=crop&auto=format&q=80',
      // Fernando de Noronha - Brasil
      'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=300&h=200&fit=crop&auto=format&q=80',
      // Lençóis Maranhenses - Brasil
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop&auto=format&q=80',
      // Cataratas del Ángel - Venezuela
      'https://www.journeylatinamerica.com/app/uploads/destinations/venezuela/angel-falls-and-the-gran-sabana/ven_angelfalls_shutterstock_141881491-scaled-1024x683-c-center.jpg',
      // Mont Blanc - Francia/Italia
      'https://images.unsplash.com/photo-1464822759844-d150ad6bf55c?w=300&h=200&fit=crop&auto=format&q=80',
      // Santorini - Grecia
      'https://www.marriott.com/content/dam/marriott-digital/destinations/destinationheroimages/en_us/photo/assets/pdt-grc-santorini-587986249568062.jpg'
    ];

    const mockLandscapes: ProcessedLandscape[] = this.FAMOUS_LOCATIONS.map((location, index) => ({
      id: `mock-${index}`,
      title: location.name,
      description: `Hermoso paisaje natural ubicado en ${location.country}. Un destino imperdible para los amantes de la naturaleza y la fotografía.`,
      imageUrl: (location as any).imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80',
      thumbnailUrl: (location as any).thumbUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&auto=format&q=80',
      photographer: 'Fotógrafo Profesional',
      photographerUrl: 'https://unsplash.com/@photographer',
      unsplashUrl: 'https://unsplash.com/photos/photo-id',
      likes: Math.floor(Math.random() * 1000) + 100,
      coordinates: {
        latitude: location.lat,
        longitude: location.lng
      },
      location: {
        name: location.name,
        country: location.country
      },
      tags: location.tags,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }));

    return of(mockLandscapes);
  }
}