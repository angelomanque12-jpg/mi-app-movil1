import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage implements OnInit {
  username: string = '';

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.username = this.userService.getUsername();
  }

  goToPerfil() {
    this.router.navigate(['/perfil']);
  }

  goToConfig() {
    this.router.navigate(['/configuracion']);
  }

  logout() {
    this.userService.setUsername('');
    this.router.navigate(['/login']);
  }
}
