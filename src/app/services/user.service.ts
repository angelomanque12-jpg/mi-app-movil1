/**
 * Servicio de gestión de usuarios
 * 
 * Este servicio maneja el estado del usuario actual y proporciona métodos
 * para gestionar la autenticación a través del servicio de Firebase.
 * Mantiene la información del usuario actual y su estado de autenticación.
 */

import { Injectable } from '@angular/core';
import { FirebaseAuthService } from './firebase-auth.service';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

// Indica que este servicio es inyectable a nivel raíz de la aplicación
@Injectable({ providedIn: 'root' })
export class UserService {
  /** Usuario actualmente autenticado */
  private currentUser: User | null = null;

  /**
   * Constructor del servicio
   * Inicializa el observador de cambios en el estado de autenticación
   */
  constructor(private firebaseAuth: FirebaseAuthService) {
    // Escuchar cambios en el estado de autenticación
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        localStorage.setItem('authenticated', 'true');
      } else {
        localStorage.removeItem('authenticated');
      }
    });
  }

  /**
   * Verifica si hay un usuario autenticado
   * @returns true si hay un usuario autenticado, false en caso contrario
   */
  isAuthenticated(): boolean {
    return !!this.currentUser || localStorage.getItem('authenticated') === 'true';
  }

  /**
   * Obtiene el correo electrónico del usuario actual
   * @returns el correo electrónico del usuario o cadena vacía si no hay usuario
   */
  getUsername(): string {
    return this.currentUser?.email || '';
  }

  /**
   * Obtiene información adicional del usuario actual
   * @returns objeto con datos del usuario
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Obtiene el nombre de display del usuario
   * @returns el nombre de display guardado o cadena vacía
   */
  getDisplayName(): string {
    return localStorage.getItem('displayName') || '';
  }

  /**
   * Guarda el nombre de display del usuario
   * @param name nombre de display a guardar
   */
  setDisplayName(name: string) {
    localStorage.setItem('displayName', name);
  }

  /**
   * Obtiene la fecha de registro del usuario
   * @returns fecha de registro formateada
   */
  getMemberSince(): string {
    const memberDate = localStorage.getItem('memberSince');
    if (memberDate) {
      return new Date(memberDate).toLocaleDateString('es-ES');
    } else {
      const now = new Date().toISOString();
      localStorage.setItem('memberSince', now);
      return new Date(now).toLocaleDateString('es-ES');
    }
  }

  /**
   * Actualiza las estadísticas del usuario
   * @param type tipo de estadística (favorite, share, view)
   * @param increment incremento (por defecto 1)
   */
  updateUserStats(type: 'favorite' | 'share' | 'view', increment: number = 1) {
    const key = `${type}Count`;
    const current = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (current + increment).toString());
  }

  /**
   * Obtiene las estadísticas del usuario
   * @returns objeto con las estadísticas del usuario
   */
  getUserStats() {
    return {
      favoriteCount: parseInt(localStorage.getItem('favoriteCount') || '0'),
      shareCount: parseInt(localStorage.getItem('shareCount') || '0'),
      viewCount: parseInt(localStorage.getItem('viewCount') || '0')
    };
  }

  /**
   * Intenta iniciar sesión con las credenciales proporcionadas
   * @param email Correo electrónico del usuario
   * @param password Contraseña del usuario
   * @returns true si el inicio de sesión es exitoso, false en caso contrario
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.firebaseAuth.login(email, password);
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Cierra la sesión del usuario actual
   * Elimina el estado de autenticación del almacenamiento local
   */
  async logout() {
    try {
      await this.firebaseAuth.logout();
      localStorage.removeItem('authenticated');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}