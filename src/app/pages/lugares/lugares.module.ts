import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { LugaresPage } from './lugares.page';

const routes: Routes = [ { path: '', component: LugaresPage } ];

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule, RouterModule.forChild(routes)],
  declarations: []
})
export class LugaresPageModule {}
