# 🔗 Integración Avanzada - Página de Descarga con Backend

## 📡 Opciones de Almacenamiento del APK

Si quieres almacenar el APK en un servidor en lugar de en el proyecto:

---

## 1️⃣ Firebase Storage (Recomendado)

### Ventajas:
- ✅ Escalable
- ✅ CDN global
- ✅ Seguro
- ✅ Integración fácil con Firebase

### Pasos:

#### A. Subir APK a Firebase Storage
```bash
# Usando Firebase CLI
firebase storage:upload app.apk gs://app-movil-83e85.firebasestorage.app/
```

O desde Firebase Console:
1. Ve a Storage
2. Crea carpeta "downloads"
3. Sube tu app.apk

#### B. Actualizar download.page.ts
```typescript
apkDownloadUrl = 'https://firebasestorage.googleapis.com/v0/b/app-movil-83e85.firebasestorage.app/o/downloads%2Fapp.apk?alt=media';
```

#### C. (Opcional) Implementar descarga segura

```typescript
import { getAuth } from 'firebase/auth';
import { getStorage, ref, getBytes } from 'firebase/storage';

async downloadSecure() {
  try {
    const auth = getAuth();
    const storage = getStorage();
    const fileRef = ref(storage, 'downloads/app.apk');
    
    // Solo usuarios autenticados pueden descargar
    if (!auth.currentUser) {
      alert('Debes iniciar sesión');
      return;
    }
    
    const bytes = await getBytes(fileRef);
    const blob = new Blob([bytes]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app.apk';
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error descargando:', error);
  }
}
```

---

## 2️⃣ AWS S3

### Ventajas:
- ✅ Potencia industrial
- ✅ Control fino de permisos
- ✅ Bueno para archivos grandes

### Pasos:

#### A. Subir a S3
```bash
# Con AWS CLI
aws s3 cp app.apk s3://tu-bucket/apk/app.apk --acl public-read
```

#### B. Actualizar URL
```typescript
apkDownloadUrl = 'https://s3.amazonaws.com/tu-bucket/apk/app.apk';
```

#### C. Presigned URLs (más seguro)
```typescript
import AWS from 'aws-sdk';

async getPresignedUrl() {
  const s3 = new AWS.S3({
    accessKeyId: environment.aws.accessKeyId,
    secretAccessKey: environment.aws.secretAccessKey
  });
  
  const params = {
    Bucket: 'tu-bucket',
    Key: 'apk/app.apk',
    Expires: 3600 // 1 hora
  };
  
  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
}
```

---

## 3️⃣ Servidor Express/Node.js

### Ventajas:
- ✅ Control total
- ✅ Rastreo detallado de descargas
- ✅ Lógica personalizada

### Pasos:

#### A. Backend Express
```typescript
// backend/routes/download.ts
import express from 'express';
import path from 'path';

const router = express.Router();

router.get('/apk', (req, res) => {
  const filePath = path.join(__dirname, '../public/app.apk');
  
  // Log de descarga
  console.log('📥 Descarga iniciada:', {
    timestamp: new Date(),
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });
  
  // Enviar archivo
  res.download(filePath, 'app.apk', (err) => {
    if (err) {
      console.error('Error en descarga:', err);
    } else {
      console.log('✅ Descarga completada');
    }
  });
});

export default router;
```

#### B. Frontend - Actualizar URL
```typescript
apkDownloadUrl = 'https://api.tudominio.com/download/apk';
```

#### C. Con autenticación
```typescript
async downloadAPK() {
  const token = localStorage.getItem('auth_token');
  
  try {
    const response = await fetch('https://api.tudominio.com/download/apk', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app.apk';
    link.click();
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 4️⃣ GitHub Releases

### Ventajas:
- ✅ Gratuito
- ✅ Versionado
- ✅ Bueno para proyectos open-source

### Pasos:

#### A. Crear release en GitHub
1. Ve a Releases
2. Sube tu app.apk
3. Copia la URL del archivo

#### B. Actualizar URL
```typescript
apkDownloadUrl = 'https://github.com/tu-usuario/tu-repo/releases/download/v1.0.0/app.apk';
```

---

## 5️⃣ Servidor FTP/HTTP

### Ventajas:
- ✅ Máximo control
- ✅ Económico
- ✅ Personalizable

### Pasos:

#### A. Subir APK via FTP
```bash
# Usando FileZilla o similar
# O con comando FTP:
ftp -s:script.ftp ftp.tudominio.com
```

#### B. Actualizar URL
```typescript
apkDownloadUrl = 'https://tudominio.com/descargas/app.apk';
```

---

## 📊 Comparativa de Opciones

| Opción | Costo | Escalabilidad | Facilidad | Recomendado |
|--------|-------|----------------|-----------|-------------|
| Local (assets) | 🆓 | ⭐ | ⭐⭐⭐⭐⭐ | ✅ Para empezar |
| Firebase | $ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Mejor |
| AWS S3 | $$ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ Profesional |
| Servidor propio | $-$$ | ⭐⭐⭐ | ⭐⭐⭐ | ✅ Control total |
| GitHub | 🆓 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Open-source |

---

## 🔍 Rastreo de Descargas

### Opción 1: Google Analytics
```typescript
async downloadAPK() {
  // Rastrear en Google Analytics
  gtag('event', 'download_apk', {
    'file_name': 'app.apk',
    'device_type': this.isMobile ? 'mobile' : 'desktop'
  });
  
  this.downloadAPK();
}
```

### Opción 2: Backend API
```typescript
async downloadAPK() {
  // Notificar al backend
  try {
    await fetch('https://api.tudominio.com/analytics/download', {
      method: 'POST',
      body: JSON.stringify({
        app_id: 'app-movil-83e85',
        timestamp: new Date(),
        device_type: this.isMobile ? 'mobile' : 'desktop'
      })
    });
  } catch (e) {
    console.error(e);
  }
  
  this.downloadAPK();
}
```

### Opción 3: Base de datos
```typescript
// Backend: Guardar en DB
app.post('/analytics/download', async (req, res) => {
  const { app_id, timestamp, device_type } = req.body;
  
  await db.collection('downloads').add({
    app_id,
    timestamp: new Date(timestamp),
    device_type,
    ip: req.ip,
    user_agent: req.headers['user-agent']
  });
  
  res.json({ success: true });
});
```

---

## 🔐 Seguridad Avanzada

### Validación de Token
```typescript
async downloadAPK() {
  const token = localStorage.getItem('auth_token');
  
  try {
    // Verificar token antes de descargar
    const response = await fetch('https://api.tudominio.com/verify-download', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      alert('No tienes permiso para descargar');
      return;
    }
    
    // Proceder con descarga
    this.downloadAPK();
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Rate Limiting
```typescript
// Backend
import rateLimit from 'express-rate-limit';

const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5 // 5 descargas por hora
});

app.get('/download/apk', downloadLimiter, (req, res) => {
  res.download('app.apk');
});
```

---

## 📈 Métricas Útiles

Datos a rastrear:
- 📊 Total de descargas
- 📱 Descargas por dispositivo (PC/Móvil)
- 🌍 Geolocalización
- 🕐 Hora de descarga
- 🔄 Descargas por versión
- 👥 Usuarios únicos
- ⏱️ Duración promedio de descarga

---

## 🎯 Recomendación Final

**Para empezar:** Usa `assets/apk/app.apk` (local)
**Para producción:** Usa Firebase Storage o S3

Así tienes un balance entre:
- Facilidad de implementación
- Escalabilidad
- Costo
- Rendimiento

---

## 🚀 Próximos Pasos

1. Elige tu opción de almacenamiento
2. Implementa la URL correspondiente
3. Prueba en PC y móvil
4. Configura rastreo (Analytics)
5. ¡Listo!

¿Preguntas? Consulta la documentación principal.
