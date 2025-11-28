# 🖼️ Guía: Personalización de Imágenes - API Unsplash

## 📋 Resumen Ejecutivo

**Sí, está integrada una API de imágenes: Unsplash API** ✅

Tu aplicación está usando **Unsplash API** para obtener imágenes de paisajes naturales de toda Latinoamérica. Actualmente está en modo "Mock" (datos de prueba) porque no has configurado la clave API.

---

## 🎯 Cómo Funciona Actualmente

### Arquitectura Actual

```
UnsplashService
    ↓
PlacesService (transforma datos Unsplash a PlacePhoto)
    ↓
lugares.page.ts / home.page.ts (muestran las imágenes)
    ↓
Usuario final (ve imágenes de paisajes naturales)
```

### Flujo de Datos

1. **UnsplashService** obtiene imágenes de Unsplash
2. **PlacesService** las transforma en formato `PlacePhoto`
3. Las páginas mostrarlas con ubicación, país, ciudad

### Ubicaciones Predefinidas (15 paisajes)

- **Chile**: Torres del Paine, Atacama, Valle de la Luna, Geysers del Tatio
- **Perú**: Machu Picchu
- **Bolivia**: Salar de Uyuni, Laguna Colorada
- **Argentina**: Cataratas del Iguazú, Glacier Perito Moreno, Bariloche
- **Colombia**: Caño Cristales, Valle del Cocora
- **Brasil**: Fernando de Noronha, Lençóis Maranhenses
- **Y más...**

---

## 🔧 Opciones para Personalizar Imágenes

### OPCIÓN 1: Habilitar Unsplash API Real (Recomendado)
**Complejidad: ⭐⭐ Baja**

Si quieres que la app busque imágenes REALES de Unsplash con términos personalizados:

#### Paso 1: Obtener clave API gratuita
```
1. Ve a https://unsplash.com/developers
2. Clic en "Register as a developer"
3. Completa el formulario
4. Recibirás tu Access Key
```

#### Paso 2: Configurar en tu app

**archivo: `src/environments/environment.ts`**
```typescript
export const environment = {
  production: false,
  firebase: { /* ... */ },
  unsplashAccessKey: 'tu-clave-aqui-xxx'
};
```

**archivo: `src/environments/environment.prod.ts`**
```typescript
export const environment = {
  production: true,
  firebase: { /* ... */ },
  unsplashAccessKey: 'tu-clave-produccion-xxx'
};
```

**archivo: `src/app/services/unsplash.service.ts` (línea 12)**

Cambia:
```typescript
const UNSPLASH_ACCESS_KEY = 'your-unsplash-access-key';
```

Por:
```typescript
import { environment } from '../../environments/environment';
const UNSPLASH_ACCESS_KEY = environment.unsplashAccessKey;
```

#### Paso 3: Personalizar búsquedas por país/ciudad

En **places.service.ts**, modifica `loadPlacesWithCoordinates()`:

```typescript
private loadPlacesWithCoordinates() {
  // OPCIÓN A: Buscar por país del usuario
  const userCountry = this.detectUserCountry(); // Tu lógica
  
  // OPCIÓN B: Buscar por ciudad específica
  this.unsplashService.getLandscapesByCountry(userCountry).subscribe(landscapes => {
    // procesar...
  });
}
```

### OPCIÓN 2: Reemplazar con Imágenes Locales
**Complejidad: ⭐ Muy Baja**

Si tienes tus propias imágenes y quieres mostrar paisajes específicos por país/ciudad:

#### Paso 1: Copia tus imágenes
```
src/assets/images/
├── chile/
│   ├── torres-paine.jpg
│   ├── atacama.jpg
│   └── geysers.jpg
├── peru/
│   ├── machu-picchu.jpg
│   └── ...
└── argentina/
    ├── iguazu.jpg
    └── ...
```

#### Paso 2: Crea servicio con imágenes locales

**archivo: `src/app/services/local-images.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

interface LocalPlace {
  id: string;
  title: string;
  country: string;
  city: string;
  imageUrl: string;
  thumbnailUrl: string;
  description: string;
  coordinates: { latitude: number; longitude: number };
}

@Injectable({ providedIn: 'root' })
export class LocalImagesService {
  private places: LocalPlace[] = [
    {
      id: 'torres-paine',
      title: 'Torres del Paine',
      country: 'Chile',
      city: 'Puerto Natales',
      imageUrl: '/assets/images/chile/torres-paine.jpg',
      thumbnailUrl: '/assets/images/chile/torres-paine-thumb.jpg',
      description: 'Imponentes torres de granito en la Patagonia chilena',
      coordinates: { latitude: -50.9423, longitude: -73.4068 }
    },
    {
      id: 'atacama',
      title: 'Desierto de Atacama',
      country: 'Chile',
      city: 'San Pedro de Atacama',
      imageUrl: '/assets/images/chile/atacama.jpg',
      thumbnailUrl: '/assets/images/chile/atacama-thumb.jpg',
      description: 'El desierto más árido del mundo',
      coordinates: { latitude: -24.5000, longitude: -69.2500 }
    },
    // Agrega más lugares...
  ];

  getPlaces(): Observable<LocalPlace[]> {
    return of(this.places);
  }

  getPlacesByCountry(country: string): Observable<LocalPlace[]> {
    return of(this.places.filter(p => p.country === country));
  }

  getPlacesByCity(city: string): Observable<LocalPlace[]> {
    return of(this.places.filter(p => p.city === city));
  }
}
```

#### Paso 3: Usa en PlacesService

```typescript
constructor(
  private geolocationService: GeolocationService,
  private localImagesService: LocalImagesService // Nuevo
) {
  this.initializePlaces();
}

private loadPlacesWithCoordinates() {
  this.localImagesService.getPlaces().subscribe(places => {
    this.places = places.map(place => ({
      id: place.id,
      place: place.title,
      imageUrl: place.imageUrl,
      rating: 4.5,
      location: `${place.city}, ${place.country}`,
      country: place.country,
      // ... resto del mapeo
    }));
    this.placesSubject.next(this.places);
  });
}
```

### OPCIÓN 3: Usar Otra API de Imágenes
**Complejidad: ⭐⭐⭐ Media**

Puedes cambiar a:

#### Pexels API (Gratuita)
```typescript
// Crear pexels.service.ts
const PEXELS_API_KEY = 'tu-clave';

searchByCountry(country: string) {
  const url = 'https://api.pexels.com/v1/search';
  const params = { 
    query: `${country} landscape`,
    per_page: 20 
  };
  return this.http.get(url, { 
    params,
    headers: { 'Authorization': PEXELS_API_KEY }
  });
}
```

#### Pixabay API (Gratuita)
```typescript
// Crear pixabay.service.ts
const PIXABAY_API_KEY = 'tu-clave';

searchByCountry(country: string) {
  const url = 'https://pixabay.com/api';
  const params = {
    key: PIXABAY_API_KEY,
    q: `${country} landscape`,
    image_type: 'photo',
    per_page: 20
  };
  return this.http.get(url, { params });
}
```

---

## 🌍 Personalización por País/Ciudad

### Opción A: Detección Automática

```typescript
// En places.service.ts

private getUserCountry(): string {
  // Opción 1: Desde geolocalización
  if (this.userLocation) {
    return this.detectCountryFromCoordinates(
      this.userLocation.latitude,
      this.userLocation.longitude
    );
  }
  
  // Opción 2: Desde localStorage
  return localStorage.getItem('userCountry') || 'Chile';
  
  // Opción 3: Desde idioma del navegador
  const lang = navigator.language; // 'es-CL', 'es-AR', etc
  return this.mapLanguageToCountry(lang);
}

private loadPlacesWithCoordinates() {
  const country = this.getUserCountry();
  
  this.unsplashService.getLandscapesByCountry(country)
    .subscribe(landscapes => {
      // procesar...
    });
}
```

### Opción B: Selector Manual en UI

```typescript
// Agregar en un componente

countries = ['Chile', 'Perú', 'Bolivia', 'Argentina', 'Colombia', 'Brasil'];

onCountryChange(country: string) {
  localStorage.setItem('userCountry', country);
  this.placesService.filterByCountry(country);
}
```

---

## 🎨 Cambiar Términos de Búsqueda

### Cómo Buscar Diferentes Tipos de Imágenes

En **unsplash.service.ts**, la línea 102:

```typescript
// ACTUAL - busca paisajes generales
searchLandscapes(query: string = 'landscape', page: number = 1, perPage: number = 20)

// PERSONALIZADO - busca playas, montañas, etc
searchLandscapes(query: string = 'beach sunset', page: number = 1, perPage: number = 20)
```

### Ejemplos de Términos

```typescript
// Para Chile
'Chile mountain', 'Chilean landscape', 'Atacama desert', 'Patagonia'

// Para Perú
'Peru landscape', 'Andes mountains', 'Sacred Valley'

// Para Bolivia
'Bolivia salt flat', 'Lake Titicaca'

// Genéricos
'tropical beach', 'jungle waterfall', 'mountain peaks'
```

---

## 📊 Comparativa de Opciones

| Opción | Complejidad | Costo | Personalización | Recomendación |
|--------|-------------|-------|-----------------|---------------|
| **Unsplash Real** | ⭐⭐ | Gratis | Alta | ✅ Si quieres variedad |
| **Imágenes Locales** | ⭐ | Gratis | Máxima | ✅ Si controlas todas |
| **Pexels API** | ⭐⭐ | Gratis | Alta | ✅ Alternativa Unsplash |
| **Pixabay API** | ⭐⭐ | Gratis | Alta | ✅ Alternativa Unsplash |

---

## ⚠️ Limitaciones Actuales de la API de Unsplash

### Rate Limits (Límite de Solicitudes)

- **Plan Gratuito**: 50 solicitudes/hora
- **Plan Aplicación**: Sin límite, pero requiere cuota mayor

### Solución

```typescript
// Cachear resultados en localStorage

private cachedResults: Map<string, any> = new Map();
private cacheExpiry: number = 3600000; // 1 hora

searchLandscapes(query: string) {
  const cached = this.cachedResults.get(query);
  if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
    return of(cached.data);
  }
  
  // Si no está cacheado, hacer la solicitud real...
}
```

---

## 🚀 Pasos Recomendados

### Para Empezar Rápido (15 min)

1. ✅ Mantén imágenes Unsplash mock actuales
2. ✅ Personaliza los `FAMOUS_LOCATIONS` en unsplash.service.ts con TUS lugares favoritos
3. ✅ Cambia las URLs de las imágenes mock a las que prefieras

### Para Producción (1 hora)

1. Obtén clave API Unsplash
2. Configura en environment.ts
3. Habilita búsquedas reales
4. Agrega detección automática de país

### Para Máxima Personalización (2-3 horas)

1. Crea estructura de imágenes locales
2. Implementa local-images.service.ts
3. Agrega selector de país en UI
4. Prueba con diferentes países/ciudades

---

## 📝 Ejemplo Práctico: Cambiar a Imágenes Solo de Chile

**Opción 1: Modificar Mock (1 minuto)**

En `unsplash.service.ts`, línea 78:
```typescript
// Cambiar FAMOUS_LOCATIONS a solo Chile
private readonly FAMOUS_LOCATIONS = [
  { name: 'Torres del Paine', country: 'Chile', lat: -50.9423, lng: -73.4068, tags: ['patagonia'] },
  { name: 'Atacama', country: 'Chile', lat: -24.5000, lng: -69.2500, tags: ['desert'] },
  // ... otros lugares de Chile
];
```

**Opción 2: Habilitar búsqueda real (5 minutos)**

1. Configura `UNSPLASH_ACCESS_KEY`
2. En `places.service.ts`, línea 64:
```typescript
this.unsplashService.getLandscapesByCountry('Chile').subscribe(landscapes => {
  // Ahora solo obtiene imágenes de Chile
});
```

---

## 💡 Conclusión

Tu app ya tiene una **API de imágenes profesional integrada (Unsplash)**. Solo necesitas:

1. **Activarla** con una clave API gratuita
2. **Personalizar** los términos de búsqueda
3. **Filtrar** por país/ciudad según tus necesidades

¿Necesitas ayuda implementando alguna de estas opciones? 🚀
