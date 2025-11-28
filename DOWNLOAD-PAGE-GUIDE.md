# 📱 Página de Descarga de APK - Guía de Uso

## ✨ Características

La página de descarga está **completamente responsiva** y se adapta automáticamente:

### 🖥️ **En PC/Escritorio:**
- Muestra un **código QR** grande y limpio
- Instrucciones claras para escanear
- Diseño profesional con gradientes modernos

### 📲 **En Móvil/Tablet:**
- Botón de **descarga directa** del APK
- Botón alternativo para abrir directamente
- Requisitos del sistema visibles
- Interfaz optimizada para pantallas pequeñas

---

## 🚀 Cómo Usar

### **Acceder a la página:**
```
http://localhost:4200/download
```
o desde tu sitio web:
```
https://tudominio.com/download
```

### **Para PC:**
1. Entra en la URL desde tu navegador
2. Verás el código QR
3. Abre la cámara de tu teléfono
4. Escanea el código
5. Se abre automáticamente la página de descarga en el móvil

### **Para Móvil:**
1. Entra en la URL desde tu navegador
2. Verás dos botones: "Descargar APK" y "Abrir directamente"
3. Haz clic en cualquiera para descargar/instalar

---

## ⚙️ Configuración Requerida

### **1. Colocar el APK en los assets**

Copia tu archivo APK compilado en:
```
src/assets/apk/app.apk
```

### **2. Actualizar la URL en el componente**

Abre `src/app/pages/download/download.page.ts` y actualiza:

```typescript
apkDownloadUrl = 'assets/apk/app.apk'; // ← Cambiar esta URL
```

Puede ser:
- **Local:** `assets/apk/app.apk`
- **Servidor:** `https://miservidor.com/descargas/app.apk`
- **Cloud Storage:** `https://storage.googleapis.com/...`
- **Firebase Storage:** `https://firebasestorage.googleapis.com/...`

### **3. Actualizar la URL del QR**

El QR apunta a `window.location.origin/download`. Si cambias el dominio, actualiza en `download.page.ts`:

```typescript
ngOnInit() {
  const currentUrl = 'https://tudominio.com'; // Cambiar si es necesario
  this.qrValue = `${currentUrl}/download`;
}
```

---

## 📁 Estructura de Archivos

```
src/app/pages/download/
├── download.page.ts          (Lógica del componente)
├── download.page.html        (Template)
├── download.page.scss        (Estilos)
└── download.module.ts        (Si lo necesitas en módulos)
```

---

## 🎨 Personalización

### **Cambiar colores:**
Edita `download.page.scss`:
```scss
// Gradiente principal
--background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Colores primarios
color: #667eea;
```

### **Cambiar tamaño del QR:**
En `download.page.ts`:
```typescript
width: 300,  // ← Cambiar tamaño (en píxeles)
```

### **Cambiar textos:**
Edita `download.page.html` directamente

---

## 🔍 Detección de Dispositivo

El componente usa:
```typescript
const mobileRegex = /Android|webOS|iPhone|iPad|iPok|BlackBerry|IEMobile|Opera Mini/i;
this.isMobile = mobileRegex.test(userAgent) && window.innerWidth <= 768;
```

**Criterios:**
- **Móvil:** User Agent reconocido + ancho ≤ 768px
- **PC:** Ninguno de los anteriores

---

## 📊 Flujo de Usuarios

### **Usuario desde PC:**
```
PC (http://tudominio.com/download) 
    ↓
Ve QR
    ↓
Escanea con teléfono
    ↓
Se abre http://tudominio.com/download en móvil
    ↓
Ve botones de descarga
    ↓
Descarga/Instala APK
```

### **Usuario desde Móvil:**
```
Móvil (http://tudominio.com/download)
    ↓
Ve botones de descarga
    ↓
Haz clic en "Descargar APK"
    ↓
Descarga/Instala APK
```

---

## 🐛 Solución de Problemas

### **El QR no aparece:**
- Asegúrate de que estés en PC/Escritorio
- Recarga la página
- Verifica la consola del navegador para errores

### **La descarga no funciona:**
- Verifica que la URL del APK sea correcta
- Comprueba los permisos del servidor
- Usa URLs HTTPS en producción

### **No detecta correctamente móvil/PC:**
- Prueba abriendo DevTools (F12) y cambiando el User Agent
- Redimensiona la ventana (< 768px = móvil)

---

## 🚀 Deploy

### **Con Ionic + Capacitor:**
```bash
# Compilar la web
ng build

# Deploy a servidor (ej: Firebase Hosting)
firebase deploy
```

### **Con Express o Node:**
```bash
# Servir los archivos estáticos
app.use(express.static('dist/app/browser'));
```

---

## 📝 Ejemplo de URL Completa

**Desarrollo:**
```
http://localhost:4200/download
```

**Producción:**
```
https://tudominio.com/download
https://tudominio.com/descargar
https://tu-app.firebaseapp.com/download
```

---

## ✅ Checklist Antes de Producción

- [ ] APK colocado en `src/assets/apk/app.apk` (o URL configurada)
- [ ] URL del QR apunta al dominio correcto
- [ ] Probado en PC (muestra QR)
- [ ] Probado en Móvil (muestra botones)
- [ ] Probado en HTTPS (requerido en producción)
- [ ] Estilos cargan correctamente
- [ ] APK descarga sin errores
- [ ] Página responsiva en todos los tamaños

---

## 💡 Tips Avanzados

### **Rastrear descargas:**
```typescript
downloadAPK() {
  console.log('📥 Usuario descargó APK desde:', navigator.userAgent);
  // Enviar a analytics
  // gtag('event', 'download', { file_name: 'app.apk' });
}
```

### **Añadir imagen del app:**
```html
<div class="app-icon">
  <img src="assets/logo.png" alt="App Logo">
</div>
```

### **Botón secundario a Google Play Store:**
```html
<ion-button expand="block" fill="outline">
  <span>📱 Descargar desde Play Store</span>
</ion-button>
```

---

¡Listo! Tu página de descarga está funcionando. 🎉
