# ⚡ Guía Rápida - Pasos Finales para Activar la Página de Descarga

## 🚀 5 Pasos Simples

### **Paso 1: Crear carpeta para el APK** (2 minutos)
```powershell
# Abre PowerShell en el proyecto
mkdir src\assets\apk
```

### **Paso 2: Colocar el APK** (1 minuto)
Copia tu archivo APK compilado aquí:
```
src/assets/apk/app.apk
```

Si no tienes el APK aún, [sigue estas instrucciones](./FIREBASE-SETUP.md) para compilarlo en Android Studio.

### **Paso 3: Verificar la configuración de Firebase** (5 minutos)
✅ Ya está hecha! Las credenciales están en `src/environments/environment.ts`

Solo asegúrate de:
1. Descargar `google-services.json` desde [Firebase Console](https://console.firebase.google.com/)
2. Colocarlo en `android/app/google-services.json`

### **Paso 4: Compilar y probar** (5 minutos)
```powershell
# En el proyecto
npm start

# Abre en navegador
# http://localhost:4200/download
```

Prueba:
- 🖥️ En PC: Deberías ver el código QR
- 📱 En móvil: Deberías ver los botones de descarga

### **Paso 5: Deploy a producción** (Varía según tu servidor)

#### Opción A: Firebase Hosting
```bash
npm run build
firebase deploy
```

#### Opción B: Servidor propio
```bash
npm run build
# Copia los archivos de dist/ a tu servidor
```

#### Opción C: Netlify
```bash
npm run build
# Arrastra la carpeta dist/ a Netlify
```

---

## ✅ Checklist Rápido

```
[ ] Creada carpeta src/assets/apk/
[ ] APK colocado en src/assets/apk/app.apk
[ ] google-services.json en android/app/
[ ] npm start funciona sin errores
[ ] QR visible en PC
[ ] Botones visible en móvil
[ ] Descarga funciona en móvil
[ ] Deploy a producción completado
```

---

## 🎯 URLs Importantes

```
Página de descarga:
  Local:        http://localhost:4200/download
  Producción:   https://tudominio.com/download

Firebase Console:
  https://console.firebase.google.com/

Android Studio:
  Compilar APK: Build > Build Bundle(s) / APK(s) > Build APK(s)
```

---

## 🔗 Links Útiles

📄 [Guía Completa de la Página](./DOWNLOAD-PAGE-GUIDE.md)
📄 [Preview Visual](./DOWNLOAD-PAGE-PREVIEW.md)
📄 [Setup de Firebase](./FIREBASE-SETUP.md)

---

## 💬 Preguntas Frecuentes

### ❓ ¿Dónde descargo el APK compilado?
En Android Studio:
1. Build > Build Bundle(s) / APK(s) > Build APK(s)
2. El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

### ❓ ¿Puedo usar la URL del APK en otro servidor?
Sí! Solo actualiza en `download.page.ts`:
```typescript
apkDownloadUrl = 'https://miservidor.com/app.apk';
```

### ❓ ¿Cómo cambio los colores?
Edita `download.page.scss`:
```scss
--background: linear-gradient(135deg, #tucolor1 0%, #tucolor2 100%);
```

### ❓ ¿El QR puede ser más grande?
Sí, en `download.page.ts`:
```typescript
width: 500, // en lugar de 300
```

### ❓ ¿Funciona en iOS?
El QR sí. Los botones de descarga solo en Android (la app es Android).

---

## 🐛 Si algo no funciona

### Error: "Página en blanco"
- Verifica que la ruta `/download` esté en `app-routing.module.ts`
- Recarga la página (Ctrl+Shift+R)

### QR no aparece
- Verifica que estés en PC/escritorio
- Abre DevTools (F12) y busca errores en la consola

### Botones no aparecen
- Verifica que estés en móvil
- Redimensiona la ventana a < 768px

### APK no descarga
- Verifica que el archivo esté en `src/assets/apk/app.apk`
- Revisa la consola del navegador para errores

---

## ⏰ Tiempo Total Estimado

```
Preparación APK:       15-30 min (compilar en Android Studio)
Setup Firebase:        5 min
Colocar archivos:      2 min
Pruebas locales:       5 min
Deploy producción:     10-15 min
───────────────────────────────
TOTAL:                 37-62 min
```

---

## 🎉 ¡Listo!

Una vez hagas estos 5 pasos, tu página de descarga estará:
- ✅ En vivo
- ✅ Responsive (PC/Móvil)
- ✅ Con QR funcional
- ✅ Lista para compartir

Simplemente comparte la URL:
```
https://tudominio.com/download
```

¡Y tus usuarios podrán descargar la APK fácilmente! 🚀
