// Configuración de la aplicación
export const CONFIG = {
  // Reemplaza esta URL con la URL de ejecución que obtengas al implementar tu Google Apps Script como Web App
  API_URL: "TU_GOOGLE_APPS_SCRIPT_URL_AQUI",
  
  // Opcional: Nombre del evento para personalizar textos en pantalla
  EVENT_NAME: "Cumple Caro",
  
  // Opcional: Límite máximo de tamaño del archivo (en MB). Las cámaras móviles modernas toman fotos grandes.
  // 15 MB es una buena cantidad para ser procesada en Base64 en un script de Google Apps Script (que tiene un límite de payload de 50MB)
  MAX_FILE_SIZE_MB: 15
};
