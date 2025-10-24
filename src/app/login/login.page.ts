/**
 * Componente de la página de login
 * 
 * Este componente maneja la interfaz de usuario para:
 * - Inicio de sesión de usuarios existentes
 * - Registro de nuevos usuarios
 * - Recuperación de contraseña
 */

import { Component, inject } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';

// Decorador del componente que define sus metadatos
@Component({
  selector: 'app-login',            // Selector CSS para usar el componente
  templateUrl: './login.page.html', // Plantilla HTML del componente
  styleUrls: ['./login.page.scss'], // Estilos CSS del componente
  standalone: true,                 // Indica que es un componente independiente
  imports: [IonicModule, FormsModule, CommonModule] // Módulos necesarios
})
export class LoginPage {
  // Variables para el formulario de inicio de sesión
  username = '';    // Correo electrónico del usuario
  password = '';    // Contraseña del usuario

  // Variables para el formulario de registro
  showRegister = false;   // Controla la visibilidad del formulario de registro
  newUsername = '';       // Correo electrónico para el nuevo usuario
  newPassword = '';       // Contraseña para el nuevo usuario

  // Variables para la recuperación de contraseña
  showForgotRequest = false;  // Controla la visibilidad del formulario de recuperación
  forgotUsername = '';        // Correo electrónico para recuperación

  // Servicios inyectados
  private router = inject(Router);
  private firebaseAuth = inject(FirebaseAuthService);
  private alertCtrl = inject(AlertController);

  /**
   * Maneja el envío del formulario de inicio de sesión
   * Intenta autenticar al usuario con Firebase usando sus credenciales
   * Si tiene éxito, redirige a la página principal o a la URL de retorno
   */
  async onSubmit() {
    try {
      const user = await this.firebaseAuth.login(this.username, this.password);
      if (user) {
        const returnUrl = this.router.getCurrentNavigation()?.extractedUrl.queryParams['returnUrl'] || '/home';
        this.router.navigate([returnUrl]);
      }
    } catch (error: any) {
      const alert = await this.alertCtrl.create({
        header: 'Error de acceso',
        message: this.getErrorMessage(error.message) || 'No se pudo iniciar sesión. Por favor, inténtelo de nuevo.',
        buttons: ['Aceptar']
      });
      await alert.present();
    }
  }

  /**
   * Traduce los códigos de error de Firebase a mensajes amigables en español
   * @param errorMessage Mensaje de error de Firebase
   * @returns Mensaje de error traducido y formateado para el usuario
   */
  private getErrorMessage(errorMessage: string): string {
    if (errorMessage.includes('user-not-found')) {
      return 'No existe una cuenta con este correo electrónico';
    }
    if (errorMessage.includes('wrong-password')) {
      return 'La contraseña es incorrecta';
    }
    if (errorMessage.includes('invalid-email')) {
      return 'El formato del correo electrónico no es válido';
    }
    if (errorMessage.includes('too-many-requests')) {
      return 'Demasiados intentos fallidos. Por favor, inténtelo más tarde';
    }
    return errorMessage;
  }

  /**
   * Maneja el registro de un nuevo usuario
   * Valida los campos requeridos y crea una nueva cuenta en Firebase
   * Si tiene éxito, muestra un mensaje y redirige a la página principal
   */
  async onRegister() {
    // Validación de campos requeridos
    if (!this.newUsername || !this.newPassword) {
      const alert = await this.alertCtrl.create({
        header: 'Datos incompletos',
        message: 'Por favor, ingrese un correo electrónico y una contraseña',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    try {
      // Intenta crear el nuevo usuario en Firebase
      const user = await this.firebaseAuth.register(this.newUsername, this.newPassword);
      if (user) {
        // Actualiza el estado y muestra mensaje de éxito
        this.showRegister = false;
        this.username = this.newUsername;
        this.password = this.newPassword;
        const alert = await this.alertCtrl.create({
          header: 'Registro exitoso',
          message: 'Tu cuenta ha sido creada correctamente',
          buttons: ['Aceptar']
        });
        await alert.present();
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      // Maneja los errores de registro
      const alert = await this.alertCtrl.create({
        header: 'Error de registro',
        message: this.getRegistrationErrorMessage(error.message) || 'No se pudo crear la cuenta. Por favor, inténtelo de nuevo.',
        buttons: ['Aceptar']
      });
      await alert.present();
    }
  }

  private getRegistrationErrorMessage(errorMessage: string): string {
    if (errorMessage.includes('email-already-in-use')) {
      return 'Ya existe una cuenta con este correo electrónico';
    }
    if (errorMessage.includes('invalid-email')) {
      return 'El formato del correo electrónico no es válido';
    }
    if (errorMessage.includes('weak-password')) {
      return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres';
    }
    return errorMessage;
  }

  /**
   * Muestra el formulario de recuperación de contraseña
   * Reinicia el campo de correo electrónico
   */
  openForgotPassword() {
    this.showForgotRequest = true;
    this.forgotUsername = '';
  }

  /**
   * Cierra el formulario de recuperación de contraseña
   * Limpia los campos del formulario
   */
  closeForgot() {
    this.showForgotRequest = false;
    this.forgotUsername = '';
  }

  /**
   * Maneja el envío del formulario de recuperación de contraseña
   * Valida el correo electrónico y envía el enlace de recuperación
   * Muestra mensajes de éxito o error según corresponda
   */
  async sendReset() {
    // Validación del campo de correo
    if (!this.forgotUsername) {
      const alert = await this.alertCtrl.create({
        header: 'Campo requerido',
        message: 'Por favor, ingrese su correo electrónico para recuperar su contraseña',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    try {
      // Envía la solicitud de recuperación a Firebase
      await this.firebaseAuth.resetPassword(this.forgotUsername);
      // Muestra mensaje de éxito
      const alert = await this.alertCtrl.create({
        header: 'Recuperación iniciada',
        message: 'Hemos enviado un enlace de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada y sigue las instrucciones.',
        buttons: ['Aceptar']
      });
      await alert.present();
      this.closeForgot();
    } catch (error: any) {
      // Maneja los errores de recuperación
      const alert = await this.alertCtrl.create({
        header: 'Error de recuperación',
        message: this.getResetPasswordErrorMessage(error.message) || 'No se pudo enviar el correo de recuperación. Por favor, inténtelo de nuevo.',
        buttons: ['Aceptar']
      });
      await alert.present();
    }
  }

  private getResetPasswordErrorMessage(errorMessage: string): string {
    if (errorMessage.includes('user-not-found')) {
      return 'No existe una cuenta asociada a este correo electrónico';
    }
    if (errorMessage.includes('invalid-email')) {
      return 'El formato del correo electrónico no es válido';
    }
    if (errorMessage.includes('too-many-requests')) {
      return 'Demasiados intentos. Por favor, espere unos minutos antes de intentarlo de nuevo';
    }
    return errorMessage;
  }
}


