import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PlacesService } from './services/places.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  showBottomNav = true;
  
  // Servicios inyectados
  private placesService = inject(PlacesService);
  private userService = inject(UserService);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);

  constructor(private router: Router) {
    console.log('🚀 AppComponent inicializado');
    
    // Configurar navegación inferior con logging detallado
    router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects || e.url;
      // Mostrar navegación solo en páginas principales autenticadas (home, lugares, profile)
      this.showBottomNav = (url === '/home' || url.startsWith('/home/') || url === '/lugares' || url.startsWith('/lugares/') || url === '/profile' || url.startsWith('/profile/')) && this.userService.isAuthenticated();
      console.log(`📱 Navegación detectada: ${url} - Bottom Nav: ${this.showBottomNav} - Auth: ${this.userService.isAuthenticated()}`);
    });
    
    // Log del estado inicial
    setTimeout(() => {
      console.log('📍 URL inicial:', this.router.url);
      console.log('🔧 Router configurado:', this.router.config.length, 'rutas');
      console.log('🔐 Usuario autenticado:', this.userService.isAuthenticated());
    }, 100);
  }

  /**
   * Navegación a Home - Flujo de autenticación considerado
   */
  async navigateHome(event?: Event) {
    console.log('🏠 ==> NAVEGANDO A HOME');
    
    try {
      // Prevenir comportamiento por defecto
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      // Verificar autenticación
      if (!this.userService.isAuthenticated()) {
        console.log('❌ Usuario no autenticado, redirigiendo a login');
        await this.router.navigate(['/login']);
        return;
      }
      
      // Feedback visual
      this.addClickFeedback(event?.target as HTMLElement);
      
      console.log('📍 URL actual:', this.router.url);
      
      // Navegación robusta
      const success = await this.router.navigateByUrl('/home', { replaceUrl: false });
      if (success) {
        console.log('✅ Navegación a Home exitosa');
      } else {
        // Fallback
        await this.router.navigate(['/home']);
        console.log('✅ Navegación a Home exitosa (fallback)');
      }
      
    } catch (error) {
      console.error('💥 Error navegando a Home:', error);
      // Último recurso
      window.location.href = '/home';
    }
  }

  /**
   * Navegación a Lugares - Flujo de autenticación considerado
   */
  async navigateLugares(event?: Event) {
    console.log('🔍 ==> NAVEGANDO A LUGARES');
    
    try {
      // Prevenir comportamiento por defecto
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      // Verificar autenticación
      if (!this.userService.isAuthenticated()) {
        console.log('❌ Usuario no autenticado, redirigiendo a login');
        await this.router.navigate(['/login']);
        return;
      }
      
      // Feedback visual
      this.addClickFeedback(event?.target as HTMLElement);
      
      console.log('📍 URL actual:', this.router.url);
      
      // Navegación robusta
      const success = await this.router.navigateByUrl('/lugares', { replaceUrl: false });
      if (success) {
        console.log('✅ Navegación a Lugares exitosa');
      } else {
        // Fallback
        await this.router.navigate(['/lugares']);
        console.log('✅ Navegación a Lugares exitosa (fallback)');
      }
      
    } catch (error) {
      console.error('💥 Error navegando a Lugares:', error);
      // Último recurso
      window.location.href = '/lugares';
    }
  }

  /**
   * Navegación a Perfil - Ultra robusta con autenticación
   */
  async navigateProfile(event?: Event) {
    console.log('👤 ==> NAVEGANDO A PERFIL');
    
    try {
      // Prevenir comportamiento por defecto
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      // Verificar autenticación
      if (!this.userService.isAuthenticated()) {
        console.log('❌ Usuario no autenticado, redirigiendo a login');
        await this.router.navigate(['/login']);
        return;
      }
      
      // Feedback visual
      this.addClickFeedback(event?.target as HTMLElement);
      
      console.log('📍 URL actual:', this.router.url);
      
      // Navegación robusta
      const success = await this.router.navigateByUrl('/profile', { replaceUrl: false });
      if (success) {
        console.log('✅ Navegación a Perfil exitosa');
      } else {
        // Fallback
        await this.router.navigate(['/profile']);
        console.log('✅ Navegación a Perfil exitosa (fallback)');
      }
      
    } catch (error) {
      console.error('💥 Error navegando a Perfil:', error);
      // Último recurso
      window.location.href = '/profile';
    }
  }

  /**
   * Añade feedback visual cuando se hace click en un botón
   */
  private addClickFeedback(target: HTMLElement | null) {
    if (!target) return;
    
    // Encontrar el botón padre si el target es un icono o texto
    let button = target.closest('.nav-button') as HTMLElement;
    if (!button) button = target;
    
    // Agregar clase de feedback
    if (button) {
      button.classList.add('nav-button-clicked');
      
      // Remover la clase después de la animación
      setTimeout(() => {
        button?.classList.remove('nav-button-clicked');
      }, 200);
    }
  }
}