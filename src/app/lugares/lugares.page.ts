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
      
      // Generar lista de países dinámicamente basada en los lugares reales
      this.generateCountriesList(list);
    });
  }
  
  // Método para generar la lista de países basada en los datos reales
  private generateCountriesList(places: PlacePhoto[]) {
    // Extraer países únicos de los lugares
    const uniqueCountries = new Set<string>();
    places.forEach(place => {
      if (place.country) {
        uniqueCountries.add(place.country);
      }
    });
    
    // Crear la lista de países con sus banderas
    this.countries = Array.from(uniqueCountries).map(countryName => {
      // Obtener código de país de 2 letras basado en el nombre
      const countryCode = this.getCountryCode(countryName);
      return {
        code: countryCode,
        name: countryName,
        flagUrl: this.countryFlags[countryName] || `https://flagcdn.com/w80/${countryCode}.png`
      };
    }).sort((a, b) => a.name.localeCompare(b.name)); // Ordenar alfabéticamente
    
    // Inicializar la lista filtrada de países
    this.filteredCountries = this.countries;
  }
  
  // Método auxiliar para obtener código de país
  private getCountryCode(countryName: string): string {
    const countryCodes: { [key: string]: string } = {
      'Chile': 'cl',
      'Peru': 'pe',
      'Bolivia': 'bo', 
      'Argentina': 'ar',
      'Ecuador': 'ec',
      'Venezuela': 've',
      'Brazil': 'br',
      'Colombia': 'co',
      'New Zealand': 'nz',
      'France': 'fr',
      'Canada': 'ca',
      'Greece': 'gr',
      'USA': 'us'
    };
    
    return countryCodes[countryName] || countryName.toLowerCase().substring(0, 2);
  }
  
  // Método para manejar la búsqueda
  onSearchInput() {
    const searchTerm = this.search.toLowerCase().trim();
    
    // Limpiar selección de país si hay búsqueda activa
    if (searchTerm && this.selectedCountry) {
      this.selectedCountry = null;
      this.placesService.filterByCountry(null);
    }
    
    // Filtrar países basado en los países reales disponibles
    this.filteredCountries = this.countries.filter(country =>
      country.name.toLowerCase().includes(searchTerm)
    );
    
    // Filtrar lugares usando los mismos criterios que el home
    if (searchTerm) {
      this.places = this.allPlaces.filter(place =>
        place.place.toLowerCase().includes(searchTerm) ||
        place.location.toLowerCase().includes(searchTerm) ||
        (place.country && place.country.toLowerCase().includes(searchTerm)) ||
        (place.tags && place.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
        (place.description && place.description.toLowerCase().includes(searchTerm))
      );
    } else {
      // Si no hay término de búsqueda, mostrar lugares recomendados
      this.places = this.recommendedPlaces;
      this.filteredCountries = this.countries;
    }
  }

  // Lista de países basada en los datos reales de lugares
  countries: CountryItem[] = [];
  
  // Países de referencia con sus códigos de bandera
  private countryFlags: { [key: string]: string } = {
    'Chile': 'https://flagcdn.com/w80/cl.png',
    'Peru': 'https://flagcdn.com/w80/pe.png', 
    'Bolivia': 'https://flagcdn.com/w80/bo.png',
    'Argentina': 'https://flagcdn.com/w80/ar.png',
    'Ecuador': 'https://flagcdn.com/w80/ec.png',
    'Venezuela': 'https://flagcdn.com/w80/ve.png',
    'Brazil': 'https://flagcdn.com/w80/br.png',
    'Colombia': 'https://flagcdn.com/w80/co.png',
    'New Zealand': 'https://flagcdn.com/w80/nz.png',
    'France': 'https://flagcdn.com/w80/fr.png',
    'Canada': 'https://flagcdn.com/w80/ca.png',
    'Greece': 'https://flagcdn.com/w80/gr.png',
    'USA': 'https://flagcdn.com/w80/us.png'
  };

  goHome() { 
    console.log('Navegando a Home desde Lugares...');
    console.log('URL actual:', this.router.url);
    
    // Limpiar estado antes de navegar
    this.clearSearch();
    this.clearCountrySelection();
    
    // Forzar navegación limpia a home
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/home']).then((success) => {
        if (success) {
          console.log('Navegación a Home desde Lugares exitosa');
          console.log('Nueva URL:', this.router.url);
        } else {
          console.error('Fallo en la navegación a Home desde Lugares');
        }
      }).catch(err => {
        console.error('Error en navigate a Home desde Lugares:', err);
      });
    }).catch(err => {
      console.error('Error en navigateByUrl desde Lugares:', err);
    });
  }

  // Función para seleccionar un país
  showCountry(country: CountryItem) {
    // Limpiar búsqueda si hay una activa
    if (this.search.trim()) {
      this.search = '';
      this.filteredCountries = this.countries;
    }
    
    if (this.selectedCountry === country.name) {
      // Si se selecciona el mismo país, deseleccionarlo
      this.selectedCountry = null;
      this.placesService.filterByCountry(null);
      this.places = this.recommendedPlaces;
    } else {
      this.selectedCountry = country.name;
      this.placesService.filterByCountry(country.name);
      
      // Filtrar lugares directamente de allPlaces para mayor consistencia
      const filteredPlaces = this.allPlaces.filter(place => 
        place.country === country.name || place.location.includes(country.name)
      );
      
      this.places = filteredPlaces;
      
      if (filteredPlaces.length === 0) {
        this.alertCtrl.create({
          header: country.name,
          message: 'No hay lugares registrados para este país todavía.',
          buttons: ['OK']
        }).then(alert => alert.present());
        
        // Volver a mostrar lugares recomendados si no hay resultados
        this.selectedCountry = null;
        this.places = this.recommendedPlaces;
        this.placesService.filterByCountry(null);
      }
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
    this.places = this.recommendedPlaces;
    this.placesService.filterByCountry(null);
  }

  // Función para limpiar la búsqueda
  clearSearch() {
    this.search = '';
    this.filteredCountries = this.countries;
    if (!this.selectedCountry) {
      this.places = this.recommendedPlaces;
    }
  }
}
