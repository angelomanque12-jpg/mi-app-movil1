import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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
  { id: '6', place: 'Valparaíso', imageUrl: 'https://chileandtravelmagazine.com/wp-content/uploads/2017/09/valparaiso-900-600.jpg', rating: 4.3, location: 'Valparaíso, Chile', user: 'Lucia', comments: [], gallery: ['https://chileandtravelmagazine.com/wp-content/uploads/2017/09/valparaiso-900-600.jpg','https://images.unsplash.com/photo-1467269204594-9661b134dd2b'], likes: 60, likedByUser: false, shares: 10 },
    { id: '7', place: 'Atacama Dunes', imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', rating: 4.9, location: 'San Pedro de Atacama, Chile', user: 'Jose', comments: [], gallery: ['https://images.unsplash.com/photo-1501785888041-af3ef285b470','https://images.unsplash.com/photo-1501785888041-0e4b5f6a1b05'], likes: 100, likedByUser: false, shares: 21 },
    { id: '8', place: 'Bariloche', imageUrl: 'https://images.unsplash.com/photo-1501785888041-12d4f8b0b053', rating: 4.5, location: 'Bariloche, Argentina', user: 'Martín', comments: [], gallery: ['https://images.unsplash.com/photo-1501785888041-12d4f8b0b053','https://images.unsplash.com/photo-1501785888041-af3ef285b470'], likes: 65, likedByUser: false, shares: 7 },
    { id: '9', place: 'Mendoza Vineyards', imageUrl: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf', rating: 4.6, location: 'Mendoza, Argentina', user: 'Sofia', comments: [], gallery: ['https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf','https://images.unsplash.com/photo-1501785888041-af3ef285b470'], likes: 32, likedByUser: false, shares: 4 },
    { id: '10', place: 'Iguazu Falls', imageUrl: 'https://images.unsplash.com/photo-1508264165352-258a6c1f7f4f', rating: 4.9, location: 'Misiones, Argentina/Brazil', user: 'Daniel', comments: [], gallery: ['https://images.unsplash.com/photo-1508264165352-258a6c1f7f4f','https://images.unsplash.com/photo-1506459225024-1428097a7e18'], likes: 200, likedByUser: false, shares: 34 },
    { id: '11', place: 'Cusco', imageUrl: 'https://images.unsplash.com/photo-1526481280698-1d0a7f3d5ae2', rating: 4.4, location: 'Cusco, Perú', user: 'Rosa', comments: [], gallery: ['https://images.unsplash.com/photo-1526481280698-1d0a7f3d5ae2','https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf'], likes: 18, likedByUser: false, shares: 2 },
    { id: '12', place: 'Machu Picchu', imageUrl: 'https://images.unsplash.com/photo-1506515004344-3b2b5f0d7d6c', rating: 4.9, location: 'Cusco Region, Perú', user: 'Pablo', comments: [], gallery: ['https://images.unsplash.com/photo-1506515004344-3b2b5f0d7d6c','https://images.unsplash.com/photo-1526481280698-1d0a7f3d5ae2'], likes: 420, likedByUser: false, shares: 120 },
    { id: '13', place: 'Salar de Uyuni', imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', rating: 4.8, location: 'Potosí, Bolivia', user: 'Laura', comments: [], gallery: ['https://images.unsplash.com/photo-1501785888041-af3ef285b470','https://images.unsplash.com/photo-1506784983877-45594efa4cbe'], likes: 140, likedByUser: false, shares: 22 },
    { id: '14', place: 'Cartagena', imageUrl: 'https://images.unsplash.com/photo-1503264116251-35a269479413', rating: 4.5, location: 'Cartagena, Colombia', user: 'Diego', comments: [], gallery: ['https://images.unsplash.com/photo-1503264116251-35a269479413','https://images.unsplash.com/photo-1508264165352-258a6c1f7f4f'], likes: 73, likedByUser: false, shares: 9 },
    { id: '15', place: 'Bogotá', imageUrl: 'https://images.unsplash.com/photo-1508873898-9d634f02a0a2', rating: 4.2, location: 'Bogotá, Colombia', user: 'Camilo', comments: [], gallery: ['https://images.unsplash.com/photo-1508873898-9d634f02a0a2','https://images.unsplash.com/photo-1503264116251-35a269479413'], likes: 20, likedByUser: false, shares: 3 },
    { id: '16', place: 'Quito', imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', rating: 4.3, location: 'Quito, Ecuador', user: 'María', comments: [], gallery: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee','https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf'], likes: 12, likedByUser: false, shares: 1 },
    { id: '17', place: 'Galápagos', imageUrl: 'https://images.unsplash.com/photo-1493558103817-58b2924bce98', rating: 4.8, location: 'Ecuador', user: 'Andrés', comments: [], gallery: ['https://images.unsplash.com/photo-1493558103817-58b2924bce98','https://images.unsplash.com/photo-1508264165352-258a6c1f7f4f'], likes: 210, likedByUser: false, shares: 50 },
    { id: '18', place: 'Rio de Janeiro', imageUrl: 'https://images.unsplash.com/photo-1509323865249-5c4b6f3d73e2', rating: 4.4, location: 'Rio de Janeiro, Brazil', user: 'Bruno', comments: [], gallery: ['https://images.unsplash.com/photo-1509323865249-5c4b6f3d73e2','https://images.unsplash.com/photo-1503264116251-35a269479413'], likes: 320, likedByUser: false, shares: 64 },
    { id: '19', place: 'Santiago Centro', imageUrl: 'https://images.unsplash.com/photo-1506466010722-395aa2bef877', rating: 4.0, location: 'Santiago, Chile', user: 'Clara', comments: [], gallery: ['https://images.unsplash.com/photo-1506466010722-395aa2bef877','https://images.unsplash.com/photo-1501785888041-af3ef285b470'], likes: 8, likedByUser: false, shares: 0 },
    // Example showing a local asset image path. To use this, add the file
    // `src/assets/images/new-york.jpg` (or change the filename below to match) and rebuild.
    { id: '20', place: 'New York City', imageUrl: 'assets/images/new-york.jpg', rating: 4.6, location: 'New York, USA', user: 'Alex', comments: [], gallery: ['assets/images/new-york.jpg','https://images.unsplash.com/photo-1506459225024-1428097a7e18'], likes: 555, likedByUser: false, shares: 210 }
  ];

  getPlaces(): Observable<PlacePhoto[]> {
    return of(this.places.slice());
  }

  getPlaceById(id: string): Observable<PlacePhoto | undefined> {
    const p = this.places.find(x => x.id === id);
    return of(p ? { ...p } : undefined);
  }

  addComment(placeId: string, user: string, text: string) {
    const p = this.places.find(x => x.id === placeId);
    if (!p) return;
    p.comments = p.comments || [];
    p.comments.push({ user, text, created: new Date().toISOString() });
  }

  addRating(placeId: string, rating: number) {
    const p = this.places.find(x => x.id === placeId);
    if (!p) return;
    // simple average update: (oldRating + newRating)/2 - placeholder logic
    p.rating = Math.round(((p.rating + rating) / 2) * 10) / 10;
  }

  toggleLike(placeId: string) {
    const p = this.places.find(x => x.id === placeId);
    if (!p) return;
    p.likedByUser = !p.likedByUser;
    p.likes = (p.likes || 0) + (p.likedByUser ? 1 : -1);
  }

  share(placeId: string) {
    const p = this.places.find(x => x.id === placeId);
    if (!p) return;
    p.shares = (p.shares || 0) + 1;
  }
}
