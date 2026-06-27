// Configuración de la aplicación
export const CONFIG = {
  // Reemplaza esta URL con la URL de ejecución que obtengas al implementar tu Google Apps Script como Web App
  API_URL: "https://script.google.com/macros/s/AKfycbyncu-LY69ZmR0L5ObdJrzD29ag6x1ba52bg1o4MLbGtg4CBZ1PkBpA9yKH3-FmqE3f/exec",

  // Opcional: Nombre del evento para personalizar textos en pantalla
  EVENT_NAME: "Mis 15 Renata",

  // URL de la carpeta compartida en Google Drive en modo Lector ("Cualquiera con el enlace puede ver")
  // para que los invitados puedan ver las fotos y videos subidos.
  SHARED_ALBUM_URL: "https://drive.google.com/drive/folders/143fCGD6IPnuQC2ux1epL0DjWlf0tDcCg?usp=sharing",

  // Opcional: Límite máximo de tamaño del archivo (en MB). Las cámaras móviles modernas toman fotos grandes.
  // 15 MB es una buena cantidad para ser procesada en Base64 en un script de Google Apps Script (que tiene un límite de payload de 50MB)
  MAX_FILE_SIZE_MB: 15
};
