import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Guard para redirigir automáticamente a los usuarios autenticados
 * desde la página de login hacia la aplicación principal
 */
export const initGuard = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isAuthenticated()) {
    // Si ya está autenticado, redirigir a home
    router.navigate(['/home']);
    return false;
  }

  // Si no está autenticado, permitir acceso a login
  return true;
};