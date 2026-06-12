// ==========================================
// CONFIGURACIÓN DEL SCRIPT DE GOOGLE
// ==========================================

// 1. REEMPLAZA esta cadena con el ID de tu carpeta de Google Drive.
// Puedes obtener el ID desde la URL de la carpeta. Ejemplo:
// Si la URL es: https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ
// El ID es: "1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
var FOLDER_ID = "REEMPLAZA_CON_EL_ID_DE_TU_CARPETA_DE_DRIVE";

/**
 * Función principal que recibe y procesa las peticiones HTTP POST.
 * Recibe el JSON con la imagen en base64 y la guarda en Google Drive.
 */
function doPost(e) {
  // Configuración de cabeceras para permitir CORS
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  try {
    // 1. Validar que la petición contenga datos
    if (!e || !e.postData || !e.postData.contents) {
      return errorResponse("No se enviaron datos en la petición.", headers);
    }

    // 2. Parsear el cuerpo JSON de la petición
    var data = JSON.parse(e.postData.contents);
    var base64Data = data.base64;
    var fileName = data.name || "foto_cumple.jpg";
    var mimeType = data.mimeType || "image/jpeg";
    var guestName = data.guestName || "Anónimo";

    // 3. Validar los parámetros requeridos
    if (!base64Data) {
      return errorResponse("Falta el contenido de la imagen (base64).", headers);
    }

    // 4. Validar que se haya modificado la constante del ID
    if (FOLDER_ID === "REEMPLAZA_CON_EL_ID_DE_TU_CARPETA_DE_DRIVE" || !FOLDER_ID) {
      return errorResponse("Configuración incompleta: FOLDER_ID no configurado en Google Apps Script.", headers);
    }

    // 5. Decodificar la imagen de Base64 a bytes
    var decodedBytes = Utilities.base64Decode(base64Data);
    
    // 6. Crear un Blob con los bytes decodificados
    var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

    // 7. Acceder a la carpeta de Google Drive e insertar el archivo
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var file = folder.createFile(blob);

    // 8. Opcional: Agregar el nombre del invitado como descripción del archivo
    file.setDescription("Foto subida por el invitado: " + guestName + "\nFecha de carga: " + new Date().toLocaleString());

    // 9. Devolver respuesta exitosa en JSON
    var jsonResponse = {
      status: "success",
      message: "¡Foto subida con éxito a Google Drive!",
      fileName: fileName,
      fileId: file.getId(),
      guestName: guestName
    };

    return ContentService.createTextOutput(JSON.stringify(jsonResponse))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers); // Agregar cabeceras CORS

  } catch (err) {
    // Manejo de errores y respuesta con el detalle del fallo
    Logger.log("Error: " + err.toString());
    return errorResponse("Error en el servidor de Google: " + err.toString(), headers);
  }
}

/**
 * Función para gestionar la respuesta de preflight OPTIONS (CORS) si se requiere
 */
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}

/**
 * Función auxiliar para estructurar respuestas de error homogéneas
 */
function errorResponse(message, headers) {
  var errorObj = {
    status: "error",
    message: message
  };
  return ContentService.createTextOutput(JSON.stringify(errorObj))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}
