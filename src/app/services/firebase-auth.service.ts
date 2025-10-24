/**
 * Servicio de autenticación con Firebase
 * 
 * Este servicio maneja todas las operaciones de autenticación utilizando Firebase Auth,
 * incluyendo registro de usuarios, inicio de sesión, cierre de sesión y recuperación
 * de contraseña.
 */

import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// Configuración de Firebase proporcionada por la consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC_E0pPszY_qJ_WwJBFoA7fsIgMqqhTFww",
  authDomain: "app-movil-83e85.firebaseapp.com",
  projectId: "app-movil-83e85",
  storageBucket: "app-movil-83e85.firebasestorage.app",
  messagingSenderId: "236014336560",
  appId: "1:236014336560:web:7de5d97987e28f17770bf5",
  measurementId: "G-XH1RLGTMFR"
};

// Indica que este servicio es inyectable a nivel raíz de la aplicación
@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  /** Instancia de autenticación de Firebase */
  private auth;

  constructor() {
    // Inicializar Firebase con la configuración proporcionada
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
  }

  /**
   * Registra un nuevo usuario con correo y contraseña
   * @param email Correo electrónico del nuevo usuario
   * @param password Contraseña del nuevo usuario
   * @returns El objeto usuario de Firebase si el registro es exitoso
   * @throws Error si el registro falla
   */
  async register(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Inicia sesión con correo y contraseña
   * @param email Correo electrónico del usuario
   * @param password Contraseña del usuario
   * @returns El objeto usuario de Firebase si el inicio de sesión es exitoso
   * @throws Error si el inicio de sesión falla
   */
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Envía un correo de recuperación de contraseña
   * @param email Correo electrónico del usuario
   * @returns true si el correo se envía exitosamente
   * @throws Error si el envío falla
   */
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return true;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Cierra la sesión del usuario actual
   * @returns true si el cierre de sesión es exitoso
   * @throws Error si el cierre de sesión falla
   */
  async logout() {
    try {
      await signOut(this.auth);
      return true;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Maneja los errores de autenticación de Firebase y los convierte en mensajes amigables
   * @param error Error devuelto por Firebase
   * @returns Error con mensaje en español para el usuario
   */
  private handleError(error: any) {
    let errorMessage = 'Ha ocurrido un error';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'El correo electrónico no es válido';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Esta cuenta ha sido deshabilitada';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No existe una cuenta con este correo electrónico';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Contraseña incorrecta';
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'Este correo electrónico ya está registrado';
        break;
      case 'auth/weak-password':
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Demasiados intentos fallidos. Por favor, intenta más tarde';
        break;
    }

    return new Error(errorMessage);
  }
}