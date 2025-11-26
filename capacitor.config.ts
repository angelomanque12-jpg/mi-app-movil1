import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'APP1',
  webDir: 'www',
  plugins: {
    Camera: {
      permitAudio: false,
      presentationStyle: 'fullscreen'
    },
    Geolocation: {
      permissions: {
        location: 'always'
      }
    }
  },
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
