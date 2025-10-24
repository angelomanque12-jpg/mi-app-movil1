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