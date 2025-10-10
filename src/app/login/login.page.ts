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
}


