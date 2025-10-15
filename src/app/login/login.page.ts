import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'], 
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class LoginPage {
  username = '';
  password = '';
  showRegister = false;
  newUsername = '';
  newPassword = '';

  // Forgot password state (mock flows)
  showForgotRequest = false;
  showForgotReset = false;
  forgotUsername = '';
  lastToken: string | null = null;
  resetUsername = '';
  resetToken = '';
  resetPasswordValue = '';

  private router = inject(Router);
  private userService = inject(UserService);

  onSubmit() {
    if (!this.userService.getUserExists(this.username)) {
      alert('El usuario no existe');
      return;
    }
    if (this.userService.validateUser(this.username, this.password)) {
      this.userService.setUsername(this.username);
      this.router.navigate(['/home']);
    } else {
      alert('Contraseña incorrecta');
    }
  }

  onRegister() {
    if (!this.newUsername || !this.newPassword) {
      alert('Debe ingresar un usuario y contraseña');
      return;
    }
    if (this.userService.registerUser(this.newUsername, this.newPassword)) {
      alert('Usuario registrado correctamente');
      this.showRegister = false;
      this.username = this.newUsername;
      this.password = this.newPassword;
    } else {
      alert('El usuario ya existe');
    }
  }

  getLoggedUser(): string {
    return this.userService.getUsername();
  }

  openForgotPassword() {
    // open the request modal by default
    this.showForgotRequest = true;
    this.showForgotReset = false;
    this.forgotUsername = '';
    this.lastToken = null;
  }

  closeForgot() {
    this.showForgotRequest = false;
    this.showForgotReset = false;
    this.forgotUsername = '';
    this.resetUsername = '';
    this.resetToken = '';
    this.resetPasswordValue = '';
    this.lastToken = null;
  }

  sendReset() {
    if (!this.forgotUsername) {
      alert('Ingrese su usuario');
      return;
    }
    const token = this.userService.sendResetLink(this.forgotUsername);
    if (!token) {
      alert('Usuario no encontrado');
      return;
    }
    // show token for mock/testing and open reset panel
    this.lastToken = token;
    this.showForgotRequest = false;
    this.showForgotReset = true;
    this.resetUsername = this.forgotUsername;
  }

  submitReset() {
    if (!this.resetUsername || !this.resetToken || !this.resetPasswordValue) {
      alert('Complete todos los campos');
      return;
    }
    const ok = this.userService.resetPassword(this.resetUsername, this.resetToken, this.resetPasswordValue);
    if (ok) {
      alert('Contraseña restablecida correctamente. Ahora puede iniciar sesión.');
      this.closeForgot();
    } else {
      alert('Token inválido o usuario incorrecto');
    }
  }
}


