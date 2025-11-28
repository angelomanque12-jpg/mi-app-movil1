// Este archivo puede ser reemplazado durante la compilación usando el arreglo `fileReplacements`.
// `ng build` reemplaza `environment.ts` con `environment.prod.ts`.
// La lista de reemplazos de archivos se puede encontrar en `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyC_E0pPszY_qJ_WwJBFoA7fsIgMqqhTFww",
    authDomain: "app-movil-83e85.firebaseapp.com",
    projectId: "app-movil-83e85",
    storageBucket: "app-movil-83e85.firebasestorage.app",
    messagingSenderId: "236014336560",
    appId: "1:236014336560:web:7de5d97987e28f17770bf5",
    measurementId: "G-XH1RLGTMFR"
  }
};

/*
 * Para facilitar la depuración en modo desarrollo, puedes importar el siguiente archivo
 * para ignorar los marcos de error relacionados con zone como `zone.run`, `zoneDelegate.invokeTask`.
 *
 * Esta importación debe estar comentada en modo producción porque tendrá un impacto negativo
 * en el rendimiento si se lanza un error.
 */
// import 'zone.js/plugins/zone-error';  // Incluido con Angular CLI.
