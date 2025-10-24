import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error404',
  templateUrl: './error404.page.html',
  styleUrls: ['./error404.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule]
})
export class Error404Page {
  constructor() { }
}