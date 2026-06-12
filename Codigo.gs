// ==========================================
// CONFIGURACIÓN DEL SCRIPT DE GOOGLE
// ==========================================

// 1. REEMPLAZA esta cadena con el ID o la URL completa de tu carpeta de Google Drive.
// Ejemplos aceptados:
// - ID directo: "1XioTmhMIgs_yrrW03bXq5J5Ptx14rphj"
// - URL completa: "https://drive.google.com/drive/folders/1XioTmhMIgs_yrrW03bXq5J5Ptx14rphj?usp=sharing"
var FOLDER_ID = "REEMPLAZA_CON_EL_ID_DE_TU_CARPETA_DE_DRIVE";

/**
 * Función principal que recibe y procesa las peticiones HTTP POST.
 * Recibe el JSON con la imagen en base64 y la guarda en Google Drive.
 */
function doPost(e) {
  try {
    // 1. Validar que la petición contenga datos
    if (!e || !e.postData || !e.postData.contents) {
      return errorResponse("No se enviaron datos en la petición.");
    }

    // 2. Parsear el cuerpo JSON de la petición
    var data = JSON.parse(e.postData.contents);
    var base64Data = data.base64;
    var fileName = data.name || "foto_cumple.jpg";
    var mimeType = data.mimeType || "image/jpeg";
    var guestName = data.guestName || "Anónimo";

    // 3. Validar los parámetros requeridos
    if (!base64Data) {
      return errorResponse("Falta el contenido de la imagen (base64).");
    }

    // 4. Validar que se haya modificado la constante del ID
    if (FOLDER_ID === "REEMPLAZA_CON_EL_ID_DE_TU_CARPETA_DE_DRIVE" || !FOLDER_ID) {
      return errorResponse("Configuración incompleta: FOLDER_ID no configurado en Google Apps Script.");
    }

    // Limpieza automática del ID si el usuario ingresó la URL completa
    var cleanFolderId = FOLDER_ID.trim();
    if (cleanFolderId.indexOf("drive.google.com") !== -1) {
      var parts = cleanFolderId.split("/");
      for (var i = 0; i < parts.length; i++) {
        if (parts[i] === "folders" && i + 1 < parts.length) {
          cleanFolderId = parts[i + 1].split("?")[0].split("#")[0];
          break;
        }
      }
    }

    // 5. Decodificar la imagen de Base64 a bytes
    var decodedBytes = Utilities.base64Decode(base64Data);
    
    // 6. Crear un Blob con los bytes decodificados
    var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

    // 7. Acceder a la carpeta de Google Drive e insertar el archivo
    var folder = DriveApp.getFolderById(cleanFolderId);
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

    // Google Apps Script maneja automáticamente CORS cuando se hace la redirección
    // y se retorna como JSON. No se requiere ni existe .setHeaders()
    return ContentService.createTextOutput(JSON.stringify(jsonResponse))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Manejo de errores y respuesta con el detalle del fallo
    Logger.log("Error: " + err.toString());
    return errorResponse("Error en el servidor de Google: " + err.toString());
  }
}

/**
 * Función para gestionar la respuesta de preflight OPTIONS (CORS) si se requiere
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Helper para estructurar respuestas de error en JSON sin llamadas a setHeaders
 */
function errorResponse(message) {
  var errorObj = {
    status: "error",
    message: message
  };
  return ContentService.createTextOutput(JSON.stringify(errorObj))
    .setMimeType(ContentService.MimeType.JSON);
}
