import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'lugares', loadComponent: () => import('./lugares/lugares.page').then(m => m.LugaresPage) },
  { path: 'capture', loadChildren: () => import('./pages/capture/capture.module').then(m => m.CapturePageModule) },
  {
    path: 'place-detail/:id',
    loadChildren: () => import('./pages/place-detail/place-detail.module').then( m => m.PlaceDetailPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
