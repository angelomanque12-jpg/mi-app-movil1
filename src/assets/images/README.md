Where to put real images for the app

Esta carpeta está destinada para imágenes estáticas que deseas incluir con la aplicación.

1) Activos locales (recomendado para conjuntos pequeños y estáticos)
- Coloca los archivos de imagen en: `src/assets/images/`
- Referencialos desde el código / servicios / plantillas exactamente como:
  - `assets/images/mi-foto.jpg`
  - Ejemplo: en `src/app/services/places.service.ts` establece `imageUrl: 'assets/images/mi-foto.jpg'`
- Durante el desarrollo, `ng serve` servirá los activos en `/assets/...`.
- Cuando ejecutes `ng build`, la carpeta de activos se copia en la salida `dist/` y las rutas permanecen válidas.

Notas y mejores prácticas para activos locales:
- Mantén las imágenes con un tamaño razonable. Las imágenes grandes aumentan el tamaño del bundle y el uso de memoria.
- Prefiere WebP o JPEG/PNG optimizados. Usa herramientas como `imagemin`, `sharp`, o compresores en línea.
- Para muchas imágenes (cargas de usuarios) no las envíes como activos — usa almacenamiento remoto.

2) Remote images (CDN / hosted)
- Use full HTTPS URLs for remote images, e.g. `https://example.com/photos/123.jpg`.
- Pros: no larger bundle, can be updated remotely, CDNs give fast delivery and caching.
- Cons: requires network connectivity; consider fallback placeholders for offline.

3) User uploads / Camera capture (mobile)
- Use Capacitor Camera to capture images and Capacitor Filesystem to store locally, or upload to your backend.
- Typical flow:
  - Capture image (Capacitor Camera.getPhoto)
  - Option A: Save to local filesystem and use a path (Platform-specific) — set `imageUrl` to that path
  - Option B: Upload to backend or cloud storage (S3, Firebase Storage) and set `imageUrl` to returned CDN URL
- When showing filesystem images on web, convert to base64 or implement a bridge that serves saved images via a local URL.

4) Template tips (Angular/Ionic)
- Bind image src safely: `<img [src]="place.imageUrl" alt="{{place.place}}" />`
- If you need to sanitize or transform URLs, consider using DomSanitizer for blob/object URLs.

5) Adding an example local image quickly
- Copy a photo into `src/assets/images/new-york.jpg`.
- Update `src/app/services/places.service.ts` to reference `assets/images/new-york.jpg` (an example entry is already present).
- Run `npm run build` or `ng serve` and open the app. The Home and Place Detail pages will show the local image.

6) Optional: lazy-loading / progressive images
- Use small blurred placeholder images first and then swap to high-res when loaded.
- Use intersection observer or Ionic's `ion-img` for lazy loading where supported.

If you'd like, I can:
- Add a small image-optimization script (using `sharp`) to produce responsive sizes (small/medium/large) and generate WebP versions.
- Implement a Camera + upload UI that stores user photos in `localStorage`/Filesystem or uploads to a mock backend.

Tell me which option you want next and I will implement it.