import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username: string;
  password: string;

  constructor(private navCtrl: NavController) {}

  login() {
    // Here you would typically validate the user credentials
    // For now, we will just navigate to the home page and pass the username
    this.navCtrl.navigateForward('/home', {
      queryParams: { username: this.username }
    });
  }
}