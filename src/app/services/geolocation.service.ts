/**
 * Servicio de Geolocalización
 * 
 * Este servicio maneja la obtención de coordenadas GPS del dispositivo,
 * el cálculo de distancias entre puntos y la gestión de permisos de ubicación.
 */

import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface LocationResult {
  success: boolean;
  coordinates?: Coordinates;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private lastKnownPosition?: Coordinates;

  constructor() {}

  /**
   * Verifica si los permisos de ubicación están disponibles
   * @returns Promise<boolean> - true si los permisos están concedidos
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.checkPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }

  /**
   * Solicita permisos de ubicación al usuario
   * @returns Promise<boolean> - true si se conceden los permisos
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.requestPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }

  /**
   * Obtiene la posición actual del dispositivo
   * @returns Promise<LocationResult> - Resultado con coordenadas o error
   */
  async getCurrentPosition(): Promise<LocationResult> {
    try {
      // Verificar permisos primero
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const permissionGranted = await this.requestPermissions();
        if (!permissionGranted) {
          return {
            success: false,
            error: 'Permisos de ubicación denegados'
          };
        }
      }

      // Obtener posición con timeout y alta precisión
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const coordinates: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined
      };

      // Guardar última posición conocida
      this.lastKnownPosition = coordinates;

      return {
        success: true,
        coordinates
      };

    } catch (error: any) {
      console.error('Error al obtener ubicación:', error);
      
      // Manejo específico de errores
      let errorMessage = 'Error desconocido al obtener ubicación';
      
      if (error.code) {
        switch (error.code) {
          case 1:
            errorMessage = 'Permisos de ubicación denegados';
            break;
          case 2:
            errorMessage = 'Ubicación no disponible';
            break;
          case 3:
            errorMessage = 'Tiempo de espera agotado';
            break;
          default:
            errorMessage = error.message || 'Error al obtener ubicación';
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Obtiene la última posición conocida almacenada en cache
   * @returns Coordinates | undefined - Última posición o undefined
   */
  getLastKnownPosition(): Coordinates | undefined {
    return this.lastKnownPosition;
  }

  /**
   * Calcula la distancia entre dos puntos usando la fórmula de Haversine
   * @param lat1 Latitud del primer punto
   * @param lon1 Longitud del primer punto  
   * @param lat2 Latitud del segundo punto
   * @param lon2 Longitud del segundo punto
   * @returns number - Distancia en kilómetros
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en kilómetros

    // Convertir grados a radianes
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Calcula la distancia desde la posición actual a un punto específico
   * @param targetLat Latitud del destino
   * @param targetLon Longitud del destino
   * @returns Promise<number | null> - Distancia en km o null si no hay ubicación
   */
  async getDistanceFromCurrentLocation(targetLat: number, targetLon: number): Promise<number | null> {
    let currentCoords = this.lastKnownPosition;
    
    // Si no hay posición guardada, intentar obtenerla
    if (!currentCoords) {
      const result = await this.getCurrentPosition();
      if (!result.success || !result.coordinates) {
        return null;
      }
      currentCoords = result.coordinates;
    }

    return this.calculateDistance(
      currentCoords.latitude,
      currentCoords.longitude,
      targetLat,
      targetLon
    );
  }

  /**
   * Formatea la distancia para mostrar al usuario
   * @param distance Distancia en kilómetros
   * @returns string - Distancia formateada (ej: "2.5 km", "850 m")
   */
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance} km`;
  }

  /**
   * Convierte grados a radianes
   * @param degrees Grados a convertir
   * @returns number - Valor en radianes
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Inicia el seguimiento de ubicación en tiempo real (para futuras funcionalidades)
   * @param callback Función que se ejecuta cuando cambia la ubicación
   * @returns Promise<string> - ID del watcher para poder detenerlo
   */
  async watchPosition(callback: (coordinates: Coordinates) => void): Promise<string> {
    const watchId = await Geolocation.watchPosition({
      enableHighAccuracy: true,
      timeout: 30000
    }, (position, error) => {
      if (error) {
        console.error('Error en watchPosition:', error);
        return;
      }

      if (position) {
        const coordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined
        };

        this.lastKnownPosition = coordinates;
        callback(coordinates);
      }
    });

    return watchId;
  }

  /**
   * Detiene el seguimiento de ubicación
   * @param watchId ID del watcher a detener
   */
  async clearWatch(watchId: string): Promise<void> {
    await Geolocation.clearWatch({ id: watchId });
  }
}