import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlacesService, PlacePhoto } from '../services/places.service';

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
  allPlaces: PlacePhoto[] = [];
  filteredPlaces: PlacePhoto[] = [];
  recommendedPlaces: PlacePhoto[] = [];
  selectedCountry: string | null = null;
  
  // Nueva propiedad para el searchbar
  search: string = '';
  
  // Propiedad para la vista, mostrará los lugares filtrados o recomendados
  places: PlacePhoto[] = [];
  
  // Lista filtrada de países
  filteredCountries: CountryItem[] = [];

  constructor(private router: Router, private placesService: PlacesService, private alertCtrl: AlertController) {
    // Obtener todos los lugares y configurar las listas iniciales
    this.placesService.getPlaces().subscribe(list => {
      this.allPlaces = list;
      this.recommendedPlaces = list.slice(0, 6); // Mostrar 6 lugares recomendados
      this.places = this.recommendedPlaces; // Inicialmente mostrar lugares recomendados
    });
    
    // Inicializar la lista filtrada de países
    this.filteredCountries = this.countries;
  }
  
  // Método para manejar la búsqueda
  onSearchInput() {
    const searchTerm = this.search.toLowerCase().trim();
    
    // Filtrar países
    this.filteredCountries = this.countries.filter(country =>
      country.name.toLowerCase().includes(searchTerm)
    );
    
    // Filtrar lugares
    if (searchTerm) {
      this.places = this.allPlaces.filter(place =>
        place.place.toLowerCase().includes(searchTerm) ||
        place.location.toLowerCase().includes(searchTerm)
      );
    } else {
      // Si no hay término de búsqueda, mostrar lugares recomendados
      this.places = this.recommendedPlaces;
    }
  }

  // Lista de países con sus banderas
  countries: CountryItem[] = [
    { code: 'cl', name: 'Chile', flagUrl: 'https://flagcdn.com/w80/cl.png' },
    { code: 'ar', name: 'Argentina', flagUrl: 'https://flagcdn.com/w80/ar.png' },
    { code: 'br', name: 'Brasil', flagUrl: 'https://flagcdn.com/w80/br.png' },
    { code: 'pe', name: 'Perú', flagUrl: 'https://flagcdn.com/w80/pe.png' },
    { code: 'co', name: 'Colombia', flagUrl: 'https://flagcdn.com/w80/co.png' },
    { code: 'ec', name: 'Ecuador', flagUrl: 'https://flagcdn.com/w80/ec.png' },
    { code: 'uy', name: 'Uruguay', flagUrl: 'https://flagcdn.com/w80/uy.png' },
    { code: 'bo', name: 'Bolivia', flagUrl: 'https://flagcdn.com/w80/bo.png' }
  ];

  goHome() { 
    this.router.navigateByUrl('/home'); 
  }

  // Función para seleccionar un país
  showCountry(country: CountryItem) {
    this.selectedCountry = country.name;
    
    // Filtrar lugares por el país seleccionado
    this.filteredPlaces = this.allPlaces.filter(place => 
      place.location.toLowerCase().includes(country.name.toLowerCase())
    );

    // Si no hay lugares para este país, mostrar un mensaje
    if (this.filteredPlaces.length === 0) {
      this.alertCtrl.create({
        header: country.name,
        message: 'No hay lugares registrados para este país todavía.',
        buttons: ['OK']
      }).then(alert => alert.present());
    }
  }

  // Función para abrir el detalle de un lugar
  openPlace(place: PlacePhoto) {
    this.router.navigate(['/place-detail', place.id]);
  }

  // Función para limpiar la selección de país
  clearCountrySelection() {
    this.selectedCountry = null;
    this.filteredPlaces = [];
  }
}
