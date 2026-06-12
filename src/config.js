// Configuración de la aplicación
export const CONFIG = {
  // Reemplaza esta URL con la URL de ejecución que obtengas al implementar tu Google Apps Script como Web App
  API_URL: "https://script.google.com/macros/s/AKfycbw-uMfIs43LPXiGIFXq1audst2bdoM0aAWeYqvP0Yzu5ksmqhkBdjfeIIFNcqOAHE4q/exec",
  
  // Opcional: Nombre del evento para personalizar textos en pantalla
  EVENT_NAME: "Cumple Caro",
  
  // URL de la carpeta compartida en Google Drive en modo Lector ("Cualquiera con el enlace puede ver")
  // para que los invitados puedan ver las fotos y videos subidos.
  SHARED_ALBUM_URL: "https://drive.google.com/drive/folders/1XioTmhMIgs_yrrW03bXq5J5Ptx14rphj?usp=sharing",

  // Opcional: Límite máximo de tamaño del archivo (en MB). Las cámaras móviles modernas toman fotos grandes.
  // 15 MB es una buena cantidad para ser procesada en Base64 en un script de Google Apps Script (que tiene un límite de payload de 50MB)
  MAX_FILE_SIZE_MB: 15
};
