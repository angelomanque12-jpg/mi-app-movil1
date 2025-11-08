import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule), canActivate: [authGuard] },
  { path: 'lugares', loadComponent: () => import('./lugares/lugares.page').then(m => m.LugaresPage), canActivate: [authGuard] },
  { path: 'capture', loadChildren: () => import('./pages/capture/capture.module').then(m => m.CapturePageModule), canActivate: [authGuard] },
  {
    path: 'place-detail/:id',
    loadChildren: () => import('./pages/place-detail/place-detail.module').then( m => m.PlaceDetailPageModule),
    canActivate: [authGuard]
  },
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
