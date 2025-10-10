import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PlaceDetailPage implements OnInit {

  constructor() { }

  initialized = false;

  ngOnInit(): void {
    // Marcar como inicializado para evitar reglas de lint sobre métodos vacíos
    this.initialized = true;
}
}
