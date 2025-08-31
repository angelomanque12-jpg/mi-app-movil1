import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  standalone: true,
  imports: [IonicModule]
})
export class HomePage {
  username = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.username = this.userService.getUsername();
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
