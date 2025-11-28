import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import * as QRCode from 'qrcode';

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
export class DownloadPage implements OnInit, AfterViewInit {
  
  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  
  isMobile = false;
  qrValue = '';
  apkDownloadUrl = 'assets/apk/app.apk'; // Cambiar por la URL real del APK
  
  constructor() {
    this.detectDevice();
    window.addEventListener('resize', () => this.detectDevice());
  }

  ngOnInit() {
    // Generar valor del QR basado en la URL actual
    const currentUrl = window.location.origin;
    this.qrValue = `${currentUrl}/download`;
  }

  ngAfterViewInit() {
    // Generar QR después de que la vista se inicialice
    if (this.qrCanvas && !this.isMobile) {
      this.generateQRCode();
    }
  }

  /**
   * Genera el código QR en el canvas
   */
  generateQRCode() {
    try {
      QRCode.toCanvas(
        this.qrCanvas.nativeElement,
        this.qrValue,
        {
          errorCorrectionLevel: 'H',
          width: 300,
          margin: 10,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        },
        (error: Error | null | undefined) => {
          if (error) {
            console.error('Error generando QR:', error);
          } else {
            console.log('✅ QR generado exitosamente');
          }
        }
      );
    } catch (error) {
      console.error('Error al generar QR:', error);
    }
  }

  /**
   * Detecta si el dispositivo es móvil o PC
   */
  detectDevice() {
    const userAgent = navigator.userAgent;
    
    // Expresión regular para detectar dispositivos móviles
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    this.isMobile = mobileRegex.test(userAgent) && window.innerWidth <= 768;
    
    console.log(`📱 Dispositivo detectado: ${this.isMobile ? 'Móvil' : 'PC'}`);
  }

  /**
   * Inicia la descarga del APK en dispositivos móviles
   */
  downloadAPK() {
    console.log('📥 Iniciando descarga del APK...');
    
    // Crear un enlace temporal para descargar
    const link = document.createElement('a');
    link.href = this.apkDownloadUrl;
    link.download = 'app.apk';
    link.target = '_blank';
    
    // Agregar el enlace al DOM y hacer clic
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
  }

  /**
   * Abre el APK directamente en Android
   */
  openAPKDirect() {
    console.log('📱 Abriendo APK directamente...');
    
    // Intenta abrir el APK directamente (solo funciona en Android con permisos)
    window.location.href = this.apkDownloadUrl;
  }
}
