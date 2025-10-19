import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlacesService, PlacePhoto } from '../../services/places.service';

// using PlacePhoto from PlacesService instead of a local PlaceItem interface

interface CountryItem {
  code: string;
  name: string;
  flagUrl: string;
}

@Component({
  selector: 'app-lugares',
  templateUrl: './lugares.page.html',
  styleUrls: ['./lugares.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LugaresPage {
  places: PlacePhoto[] = [];
  constructor(private router: Router, private placesService: PlacesService, private alertCtrl: AlertController) {
    // subscribe to the shared PlacesService so the gallery reflects the same data as Home
    this.placesService.getPlaces().subscribe(list => { this.places = list.slice(0, 12); });
  }

  // Mock countries list
  countries: CountryItem[] = [
    { code: 'cl', name: 'Chile', flagUrl: 'https://flagcdn.com/w80/cl.png' },
    { code: 'ar', name: 'Argentina', flagUrl: 'https://flagcdn.com/w80/ar.png' },
    { code: 'br', name: 'Brasil', flagUrl: 'https://flagcdn.com/w80/br.png' },
    { code: 'pe', name: 'Perú', flagUrl: 'https://flagcdn.com/w80/pe.png' }
  ];

  search = '';
  filteredCountries: CountryItem[] = this.countries.slice();

  goHome() { this.router.navigateByUrl('/home'); }

  onSearchInput() {
    const q = (this.search || '').trim().toLowerCase();
    if (!q) { this.filteredCountries = this.countries.slice(); return; }
    this.filteredCountries = this.countries.filter(c => c.name.toLowerCase().includes(q));
  }

  openPlace(p: PlacePhoto) {
    // For now navigate to place-detail if exists, else noop
    this.router.navigate(['/place-detail', p.id]);
  }

  async showCountry(c: CountryItem) {
    const a = await this.alertCtrl.create({ header: c.name, message: `<img src="${c.flagUrl}" style="width:120px;height:auto;display:block;margin:0 auto;" /><p>Has seleccionado ${c.name}.</p>`, buttons: ['Cerrar'] });
    await a.present();
  }
}
