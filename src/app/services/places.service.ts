import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

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
}

@Injectable({ providedIn: 'root' })
export class PlacesService {
  // NOTE: You can use either remote image URLs (https://...) or local asset paths (assets/...).
  // - Local assets: put image files under `src/assets/images/` and reference them here as
  //     'assets/images/my-photo.jpg'
  //   Angular's dev server and production build will serve `assets/` at the app root, so
  //   using `assets/images/*` works directly in templates: <img [src]="place.imageUrl" />
  // - Remote URLs: use the full https:// URL (example entries below use Unsplash links).
  // - Uploads / camera: if you implement a capture/upload flow (Capacitor Camera + Filesystem
  //   or an API backend), set `imageUrl` to the saved local file path or to the uploaded
  //   remote URL. See `src/assets/images/README.md` for guidance.

  private places: PlacePhoto[] = [
  { id: '1', place: 'Playa Reñaca', imageUrl: 'https://images.myguide-cdn.com/chile/companies/renaca/large/renaca-3307434.jpg', rating: 4.8, location: 'Viña del Mar, Chile', user: 'Angelo', comments: [], gallery: ['https://images.myguide-cdn.com/chile/companies/renaca/large/renaca-3307434.jpg','https://images.unsplash.com/photo-1507525428034-b723cf961d3e','https://images.unsplash.com/photo-1501785888041-af3ef285b470'], likes: 12, likedByUser: false, shares: 3 },
  { id: '2', place: 'Torres del Paine', imageUrl: 'https://torresdelpaine.com/wp-content/uploads/sites/6/2025/08/torres-del-paine-2-dias-600x338.jpg', rating: 4.9, location: 'Magallanes, Chile', user: 'Camila', comments: [], gallery: ['https://torresdelpaine.com/wp-content/uploads/sites/6/2025/08/torres-del-paine-2-dias-600x338.jpg','https://images.unsplash.com/photo-1441974231531-c6227db76b6e','https://images.unsplash.com/photo-1491553895911-0055eca6402d'], likes: 89, likedByUser: false, shares: 5 },
  { id: '3', place: 'Cerro San Cristóbal', imageUrl: 'https://observatoriocielosur.cl/wp-content/uploads/2023/12/Que-se-puede-hacer-en-el-cerro-San-Cristobal.jpg', rating: 4.4, location: 'Santiago, Chile', user: 'Matías', comments: [], gallery: ['https://observatoriocielosur.cl/wp-content/uploads/2023/12/Que-se-puede-hacer-en-el-cerro-San-Cristobal.jpg','https://images.unsplash.com/photo-1501785888041-af3ef285b470'], likes: 34, likedByUser: false, shares: 2 },
  { id: '4', place: 'Lago Llanquihue', imageUrl: 'https://storage.googleapis.com/chile-travel-cdn/2021/07/lago-llanquihue_prin-min.jpg', rating: 4.6, location: 'Puerto Varas, Chile', user: 'Felipe', comments: [], gallery: ['https://storage.googleapis.com/chile-travel-cdn/2021/07/lago-llanquihue_prin-min.jpg','https://images.unsplash.com/photo-1501785888041-af3ef285b470'], likes: 21, likedByUser: false, shares: 1 },
  { id: '5', place: 'Isla de Pascua', imageUrl: 'https://www.tangol.com/Blog/Fotos/que-hacer-en-isla-de-pascua_0_201711131023220-resized.jpg', rating: 4.7, location: 'Rapa Nui, Chile', user: 'Ana', comments: [], gallery: ['https://www.tangol.com/Blog/Fotos/que-hacer-en-isla-de-pascua_0_201711131023220-resized.jpg','https://images.unsplash.com/photo-1506744038136-46273834b3fb'], likes: 45, likedByUser: false, shares: 8 },
  { id: '6', place: 'Valparaíso', imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fc/b7/valparaiso.jpg?w=1200&h=700&s=1', rating: 4.3, location: 'Valparaíso, Chile', user: 'Lucia', comments: [], gallery: ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fc/b7/valparaiso.jpg?w=1200&h=700&s=1','https://images.unsplash.com/photo-1467269204594-9661b134dd2b'], likes: 60, likedByUser: false, shares: 10 },
  { id: '7', place: 'Dunas de Atacama', imageUrl: 'https://storage.googleapis.com/chile-travel-cdn/2022/10/d3ef1f8b-atacama-drone-16-1.jpg', rating: 4.9, location: 'San Pedro de Atacama, Chile', user: 'Jose', comments: [], gallery: ['https://storage.googleapis.com/chile-travel-cdn/2022/10/d3ef1f8b-atacama-drone-16-1.jpg','https://images.unsplash.com/photo-1501785888041-0e4b5f6a1b05'], likes: 100, likedByUser: false, shares: 21 },
  { id: '8', place: 'Bariloche', imageUrl: 'https://www.latamairlines.com/content/dam/latamxp/sites/vamos-latam/news-nieve-sudam%C3%A9rica-may25/bariloche/Modelo-3.png', rating: 4.5, location: 'Bariloche, Argentina', user: 'Martín', comments: [], gallery: ['https://www.latamairlines.com/content/dam/latamxp/sites/vamos-latam/news-nieve-sudam%C3%A9rica-may25/bariloche/Modelo-3.png','https://images.unsplash.com/photo-1501785888041-af3ef285b470'], likes: 65, likedByUser: false, shares: 7 },
  { id: '9', place: 'Mendoza', imageUrl: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/73/3c/44.jpg', rating: 4.6, location: 'Mendoza, Argentina', user: 'Sofia', comments: [], gallery: ['https://media.tacdn.com/media/attractions-splice-spp-674x446/06/73/3c/44.jpg','https://images.unsplash.com/photo-1501785888041-af3ef285b470'], likes: 32, likedByUser: false, shares: 4 },
  { id: '10', place: 'Cataratas del Iguazu', imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/cb/95/57/img-20180721-wa0042-largejpg.jpg?w=900&h=500&s=1', rating: 4.9, location: 'Misiones, Argentina/Brazil', user: 'Daniel', comments: [], gallery: ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/cb/95/57/img-20180721-wa0042-largejpg.jpg?w=900&h=500&s=1','https://images.unsplash.com/photo-1506459225024-1428097a7e18'], likes: 200, likedByUser: false, shares: 34 },
  { id: '11', place: 'Cusco', imageUrl: 'https://www.alpacaexpeditions.com/wp-content/uploads/cusco-cuna-del-imperio-inca-1.jpg', rating: 4.4, location: 'Cusco, Perú', user: 'Rosa', comments: [], gallery: ['https://www.alpacaexpeditions.com/wp-content/uploads/cusco-cuna-del-imperio-inca-1.jpg','https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf'], likes: 18, likedByUser: false, shares: 2 },
  { id: '12', place: 'Machu Picchu', imageUrl: 'https://cuscoperu.b-cdn.net/wp-content/uploads/2024/06/imagen-destacada.jpg', rating: 4.9, location: 'Cusco Region, Perú', user: 'Pablo', comments: [], gallery: ['https://cuscoperu.b-cdn.net/wp-content/uploads/2024/06/imagen-destacada.jpg','https://images.unsplash.com/photo-1526481280698-1d0a7f3d5ae2'], likes: 420, likedByUser: false, shares: 120 },
  { id: '13', place: 'Salar de Uyuni', imageUrl: 'https://imagenes.elpais.com/resizer/v2/MGN6UNRGHZEBLHKLUR6ASE4XZY.jpg?auth=4725b0113426c6cdc68ee70519927437d2736ea989f93209fbb32e2797a1c19d&width=1960&height=1470&focal=2473%2C2062', rating: 4.8, location: 'Potosí, Bolivia', user: 'Laura', comments: [], gallery: ['https://imagenes.elpais.com/resizer/v2/MGN6UNRGHZEBLHKLUR6ASE4XZY.jpg?auth=4725b0113426c6cdc68ee70519927437d2736ea989f93209fbb32e2797a1c19d&width=1960&height=1470&focal=2473%2C2062','https://images.unsplash.com/photo-1506784983877-45594efa4cbe'], likes: 140, likedByUser: false, shares: 22 },
  { id: '14', place: 'Cartagena', imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/f6/92/cd/cartagena-colombia.jpg?w=400&h=300&s=1', rating: 4.5, location: 'Cartagena, Colombia', user: 'Diego', comments: [], gallery: ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/f6/92/cd/cartagena-colombia.jpg?w=400&h=300&s=1','https://images.unsplash.com/photo-1508264165352-258a6c1f7f4f'], likes: 73, likedByUser: false, shares: 9 },
  { id: '15', place: 'Bogotá', imageUrl: 'https://colombia-travels.com/wp-content/uploads/adobestock-266299444-1-1280x800.jpeg', rating: 4.2, location: 'Bogotá, Colombia', user: 'Camilo', comments: [], gallery: ['https://colombia-travels.com/wp-content/uploads/adobestock-266299444-1-1280x800.jpeg','https://images.unsplash.com/photo-1503264116251-35a269479413'], likes: 20, likedByUser: false, shares: 3 },
  { id: '16', place: 'Quito', imageUrl: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/cf/db/ac.jpg', rating: 4.3, location: 'Quito, Ecuador', user: 'María', comments: [], gallery: ['https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/cf/db/ac.jpg','https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf'], likes: 12, likedByUser: false, shares: 1 },
  { id: '17', place: 'Galápagos', imageUrl: 'https://img.goraymi.com/2019/12/05/5446eefab33b499a4fa71ea36c9938f1_xl.jpg', rating: 4.8, location: 'Ecuador', user: 'Andrés', comments: [], gallery: ['https://img.goraymi.com/2019/12/05/5446eefab33b499a4fa71ea36c9938f1_xl.jpg','https://images.unsplash.com/photo-1508264165352-258a6c1f7f4f'], likes: 210, likedByUser: false, shares: 50 },
  { id: '18', place: 'Rio de Janeiro', imageUrl: 'https://www.pestana.com/es/destinos/america-del-sur/brasil/rio-janeiro/_jcr_content/root/container/hero_banner/cmp-hero-banner__container__background-image.coreimg.jpeg/1733419661083/herobanner-region-rio-de-janeiro.jpeg', rating: 4.4, location: 'Rio de Janeiro, Brazil', user: 'Bruno', comments: [], gallery: ['https://www.pestana.com/es/destinos/america-del-sur/brasil/rio-janeiro/_jcr_content/root/container/hero_banner/cmp-hero-banner__container__background-image.coreimg.jpeg/1733419661083/herobanner-region-rio-de-janeiro.jpeg','https://images.unsplash.com/photo-1503264116251-35a269479413'], likes: 320, likedByUser: false, shares: 64 },
  { id: '19', place: 'Santiago Centro', imageUrl: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/9d/4e/87.jpg', rating: 4.0, location: 'Santiago, Chile', user: 'Clara', comments: [], gallery: ['https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/9d/4e/87.jpg','https://images.unsplash.com/photo-1501785888041-af3ef285b470'], likes: 8, likedByUser: false, shares: 0 },
  // Example showing a local asset image path. To use this, add the file
  // `src/assets/images/new-york.jpg` (or change the filename below to match) and rebuild.
  { id: '20', place: 'New York City', imageUrl: 'https://www.civitatis.com/f/estados-unidos/nueva-york/galeria/carteles-publicitarios-times-square.jpg', rating: 4.6, location: 'New York, USA', user: 'Alex', comments: [], gallery: ['https://www.civitatis.com/f/estados-unidos/nueva-york/galeria/carteles-publicitarios-times-square.jpg','https://images.unsplash.com/photo-1506459225024-1428097a7e18'], likes: 555, likedByUser: false, shares: 210 }
  ];

  private placesSubject = new BehaviorSubject<PlacePhoto[]>(this.places.slice());

  getPlaces(): Observable<PlacePhoto[]> {
    /**
     * Returns an observable stream of the current places list.
     *
     * Consumers should subscribe to receive updates when the list changes.
     * Output: Observable<PlacePhoto[]> (emits a shallow copy of internal array)
     */
    return this.placesSubject.asObservable();
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
  addPlace(data: { place: string; imageUrl: string; location?: string; user?: string }) {
    /**
     * Add a new place created by the user (for example, when attaching a captured photo).
     *
     * Behavior:
     * - Generates a simple incremental id and prepends the new place to the array.
     * - Emits the updated list via BehaviorSubject.
     *
     * Note: ids are not globally unique beyond the current in-memory list and this is
     * intended for demo/local usage. Persist to backend or filesystem for production.
     */
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
      shares: 0
    };
    this.places.unshift(newPlace);
    this.placesSubject.next(this.places.slice());
  }
}
