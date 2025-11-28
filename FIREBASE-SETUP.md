# Configuración de Firebase para APK en Android Studio

## ✅ Cambios realizados

Se han hecho los siguientes cambios para mejorar la seguridad y compatibilidad de Firebase:

### 1. **Protección de credenciales** 🔐
- Las credenciales de Firebase ahora están en `src/environments/environment.ts` y `environment.prod.ts`
- El servicio `firebase-auth.service.ts` las carga desde `environment` en lugar de tenerlas en el código

### 2. **Configuración de Android actualizada** ⚙️
- El proyecto ya tiene configurado `com.google.gms:google-services:4.4.2` en `android/build.gradle`
- El `android/app/build.gradle` está preparado para usar `google-services.json`

---

## 📋 Pasos pendientes para construir la APK

### **PASO 1: Descargar `google-services.json` desde Firebase Console**

1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `app-movil-83e85`
3. Ve a **Configuración del proyecto** (ícono ⚙️)
4. En la pestaña **"Aplicaciones"**, encuentra tu aplicación Android
   - Si no existe, haz clic en **"Agregar app"** → **"Android"**
5. Descarga el archivo `google-services.json`

### **PASO 2: Colocar el archivo en el proyecto**

Copia el archivo descargado aquí:
```
android/app/google-services.json
```

**Importante:** Este archivo NO se subirá a GitHub (está en `.gitignore` para proteger credenciales)

### **PASO 3: Reconstruir desde Android Studio**

1. Abre Android Studio
2. Abre la carpeta `android/` como proyecto
3. Espera a que Gradle sincronice (puede tardar unos minutos)
4. Limpia el build: `Build` → `Clean Project`
5. Reconstruye: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`

---

## 🔧 Alternativa: Construcción desde terminal

Si prefieres hacer build desde la terminal:

```powershell
cd android
.\gradlew clean
.\gradlew assembleDebug  # Para debug APK
# o
.\gradlew assembleRelease  # Para release APK
```

---

## 📦 Variables de entorno en el proyecto

Las credenciales se cargan dinámicamente según el entorno:

- **Desarrollo:** `src/environments/environment.ts`
- **Producción:** `src/environments/environment.prod.ts`

Para cambiar las credenciales en el futuro, solo edita estos archivos (no toques el servicio).

---

## ⚠️ Importante

- **No commits el `google-services.json`** a Git (está protegido en `.gitignore`)
- Cada desarrollador debe tener su propia copia del archivo
- Para Android, Firebase necesita este archivo en el build
- Para la web (Angular), Firebase se configura con `environment.ts`

---

## ✨ Resultado

Una vez completes los pasos:
- ✅ Firebase funcionará correctamente en la APK de Android
- ✅ Las credenciales estarán protegidas
- ✅ Podrás descargar la APK desde Android Studio sin problemas
