import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CapturePage } from './capture.page';

const routes: Routes = [ { path: '', component: CapturePage } ];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: []
})
export class CapturePageModule {}
