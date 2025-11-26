import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { initGuard } from './guards/init.guard';

const routes: Routes = [
  // Flujo principal: Login primero si no está autenticado
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Página de login con guard para redirigir usuarios ya autenticados
  { path: 'login', loadComponent: () => import('./login/login.page').then(m => m.LoginPage), canActivate: [initGuard] },
  
  // Páginas principales de la app (requieren autenticación) - usando standalone components
  { path: 'home', loadComponent: () => import('./home/home.page').then(m => m.HomePage), canActivate: [authGuard] },
  { path: 'lugares', loadComponent: () => import('./lugares/lugares.page').then(m => m.LugaresPage), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage), canActivate: [authGuard] },
  
  // Páginas secundarias (requieren autenticación) - mantener como módulos si no son standalone
  { path: 'capture', loadChildren: () => import('./pages/capture/capture.module').then(m => m.CapturePageModule), canActivate: [authGuard] },
  {
    path: 'place-detail/:id',
    loadChildren: () => import('./pages/place-detail/place-detail.module').then( m => m.PlaceDetailPageModule),
    canActivate: [authGuard]
  },
  
  // Página de error 404 (catch-all)
  {
    path: '**',
    loadComponent: () => import('./pages/error404/error404.page').then(m => m.Error404Page)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
