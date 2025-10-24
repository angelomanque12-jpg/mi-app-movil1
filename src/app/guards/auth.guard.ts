import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL actual para redirigir después del login
  router.navigate(['/login'], { 
    queryParams: { returnUrl: router.routerState.snapshot.url }
  });
  return false;
};