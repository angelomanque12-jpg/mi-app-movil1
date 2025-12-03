import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-download',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle
  ],
  templateUrl: './download.page.html',
  styleUrls: ['./download.page.scss']
})
export class DownloadPage implements OnInit {
  
  isMobile = false;
  apkDownloadUrl = 'assets/apk/app-debug.apk';
  downloadStarted = false;
  qrCodeUrl = '';
  downloadPageUrl = '';

  ngOnInit() {
    this.detectDevice();
    this.generateQRCode();
    window.addEventListener('resize', () => this.detectDevice());
  }

  detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    this.isMobile = mobileRegex.test(userAgent);
  }

  generateQRCode() {
    // URL de la página de descarga
    this.downloadPageUrl = window.location.href;
    
    // Generar QR usando API externa
    const encodedURL = encodeURIComponent(this.downloadPageUrl);
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedURL}`;
  }

  downloadAPK() {
    this.downloadStarted = true;
    const link = document.createElement('a');
    link.href = this.apkDownloadUrl;
    link.download = 'app-debug.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => this.downloadStarted = false, 3000);
  }

  openAPK() {
    window.location.href = this.apkDownloadUrl;
  }

  copyDownloadLink() {
    const url = window.location.origin + '/' + this.apkDownloadUrl;
    navigator.clipboard.writeText(url).then(() => {
      alert('Enlace copiado al portapapeles');
    });
  }

  copyQRLink() {
    navigator.clipboard.writeText(this.downloadPageUrl).then(() => {
      alert('URL del QR copiada al portapapeles');
    });
  }
}
