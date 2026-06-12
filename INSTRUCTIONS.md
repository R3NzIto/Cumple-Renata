# Guía de Configuración, Despliegue e Instalación Paso a Paso 🚀

Esta guía contiene todo lo necesario para poner en marcha tu Web App de fotos de cumpleaños. Síguela paso a paso.

---

## 📅 Resumen de la Arquitectura
El sistema funciona de la siguiente manera:
1. **Tu Teléfono/Cámara (React)** ➔ Optimiza el tamaño de la foto (reduce megabytes manteniendo excelente resolución) ➔ La codifica en Base64.
2. **Envío** ➔ Envía la imagen mediante un `POST` seguro a la URL de Google Apps Script.
3. **Google Apps Script** ➔ Recibe la foto ➔ La decodifica ➔ La guarda en la carpeta de Google Drive que hayas elegido, etiquetándola con el nombre del invitado que la tomó.

---

## Paso 1: Configurar la Carpeta en Google Drive 📁

1. Abre tu **Google Drive** ([drive.google.com](https://drive.google.com)).
2. Crea una nueva carpeta para el evento (ej. `Fotos Cumple Caro`).
3. Entra a la carpeta recién creada.
4. Mira la barra de direcciones (URL) de tu navegador. Será algo como:
   `https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ`
5. Copia el **ID de la carpeta** (es el código largo de letras y números al final de la URL, después del último `/`). En el ejemplo anterior, sería `1aBcDeFgHiJkLmNoPqRsTuVwXyZ`.
6. Guarda este ID, lo usaremos en el paso 2.

---

## Paso 2: Crear y Publicar el Google Apps Script ⚙️

1. Ve a **Google Apps Script** ([script.google.com](https://script.google.com)).
2. Inicia sesión con la cuenta de Google donde quieras almacenar las fotos.
3. Haz clic en **"Nuevo proyecto"** (New project).
4. Cambia el nombre del proyecto en la parte superior izquierda (ej. `Subida Fotos Cumple`).
5. Borra el código existente por defecto en el archivo y pega el contenido completo de nuestro archivo [Codigo.gs](file:///C:/Users/biond/Desktop/Cumple%20Caro/Codigo.gs).
6. Localiza la línea 9 de [Codigo.gs](file:///C:/Users/biond/Desktop/Cumple%20Caro/Codigo.gs):
   ```javascript
   var FOLDER_ID = "REEMPLAZA_CON_EL_ID_DE_TU_CARPETA_DE_DRIVE";
   ```
   Reemplaza el texto `"REEMPLAZA_CON_EL_ID_DE_TU_CARPETA_DE_DRIVE"` con el **ID de la carpeta** que copiaste en el **Paso 1**. Asegúrate de mantener las comillas.
7. Haz clic en el botón de **"Guardar"** (icono de disquete o `Ctrl + S`).

### Desplegar como Web App:
8. Haz clic en el botón **"Implementar"** (Deploy) en la esquina superior derecha ➔ Selecciona **"Nueva implementación"** (New deployment).
9. En el engranaje de tipo de implementación (esquina superior izquierda), selecciona **"Aplicación web"** (Web app).
10. Rellena los campos con la siguiente configuración:
    * **Descripción**: `Versión inicial`
    * **Ejecutar como** (Execute as): Selecciona **"Yo"** (Me - tu_correo@gmail.com). *Esto permite escribir en tu Drive.*
    * **Quién tiene acceso** (Who has access): Selecciona **"Cualquiera"** (Anyone). *Esto permite que tus invitados suban fotos de forma anónima sin tener que iniciar sesión en Google.*
11. Haz clic en **"Implementar"** (Deploy).
12. Si es la primera vez, Google te pedirá que **"Autorices el acceso"** (Authorize access). 
    * Haz clic en "Autorizar acceso", selecciona tu cuenta de Google.
    * Verás una pantalla de advertencia ("Google no ha verificado esta aplicación"). Haz clic en **"Configuración avanzada"** (Advanced) abajo a la izquierda y luego en **"Ir a Proyecto Sin Nombre (no seguro)"** (Go to ... (unsafe)).
    * Haz clic en **"Permitir"** (Allow) para dar permisos de escritura en Google Drive.
13. Una vez completado, verás una ventana con la **URL de la aplicación web**.
    * Copia esa URL (debe terminar en `/exec`). **¡Esta es tu API_URL!**

---

## Paso 3: Configurar el Frontend en React 💻

Ya tenemos todos los archivos creados en tu computadora dentro de la carpeta `Cumple Caro`.

1. Abre el archivo [src/config.js](file:///C:/Users/biond/Desktop/Cumple%20Caro/src/config.js).
2. Reemplaza `"TU_GOOGLE_APPS_SCRIPT_URL_AQUI"` con la URL de ejecución de Google Apps Script (`/exec`) que copiaste en el **Paso 2**.
3. También puedes personalizar el nombre del evento modificando la propiedad `EVENT_NAME: "Cumple Caro"`.
4. Guarda el archivo.

---

## Paso 4: Instalar Node.js e Inicializar el Proyecto Localmente 🛠️

Para ejecutar el frontend en tu computadora y compilarlo, necesitas tener instalado **Node.js** (que incluye `npm`).

1. Descarga e instala **Node.js** (versión LTS recomendada) desde su web oficial: [nodejs.org](https://nodejs.org/).
2. Abre tu terminal de comandos (PowerShell, CMD en Windows o la terminal de tu editor de código preferido).
3. Asegúrate de estar dentro del directorio del proyecto (`Cumple Caro`). Puedes navegar a él en tu terminal usando `cd "C:\Users\biond\Desktop\Cumple Caro"`.
4. Ejecuta el comando para instalar todas las dependencias listadas en [package.json](file:///C:/Users/biond/Desktop/Cumple%20Caro/package.json):
   ```bash
   npm install
   ```
5. Una vez instalado, ejecuta el servidor de desarrollo local para verificar que todo funcione:
   ```bash
   npm run dev
   ```
6. Abre tu navegador en la dirección local que te indique (generalmente [http://localhost:3000](http://localhost:3000)). Deberías ver la interfaz de usuario en modo oscuro con el botón para capturar fotos.

---

## Paso 5: Despliegue del Frontend Gratis en la Nube 🌐

Para que tus invitados puedan acceder desde sus celulares escaneando un código QR en la fiesta, debes subir la aplicación a Internet. Vercel y Netlify ofrecen hosting gratuito de forma muy simple y rápida.

### Opción A: Despliegue rápido con Vercel CLI (Recomendado sin usar GitHub)
Si no usas GitHub o quieres desplegarlo en 1 minuto directamente desde tu terminal:

1. Instala el CLI de Vercel de manera global:
   ```bash
   npm install -g vercel
   ```
2. Ejecuta el siguiente comando dentro de tu carpeta `Cumple Caro`:
   ```bash
   vercel
   ```
3. Sigue las instrucciones interactivas de la terminal:
   * ¿Quieres iniciar sesión o registrarte? Sigue los pasos rápidos en el navegador para crear tu cuenta gratuita.
   * *Set up and deploy "C:\Users\biond\Desktop\Cumple Caro"?* Escribe `y` y presiona Enter.
   * *Which scope do you want to deploy to?* Presiona Enter para elegir tu cuenta personal.
   * *Link to existing project?* Escribe `n` (no) y presiona Enter.
   * *What's your project's name?* Presiona Enter para dejar el nombre por defecto (`cumple-caro-fotos`).
   * *In which directory is your code located?* Presiona Enter para usar el directorio actual `./`.
   * *Want to modify these settings?* Escribe `n` (no) y presiona Enter. Vercel detectará automáticamente que es un proyecto de Vite.
4. Espera a que termine la carga y la compilación. En pocos segundos verás en la pantalla la URL de producción (Production URL), por ejemplo: `https://cumple-caro-fotos-xxx.vercel.app`. **¡Tu web ya está en línea de forma segura con HTTPS!**

### Opción B: Despliegue con Netlify Drop (El método visual más fácil)
Si prefieres no usar la consola:

1. En tu terminal dentro de la carpeta del proyecto, genera la carpeta de compilación ejecutando:
   ```bash
   npm run build
   ```
   Esto compilará todo el código de React y creará una carpeta llamada **`dist`** en tu proyecto.
2. Abre en tu navegador [app.netlify.com/drop](https://app.netlify.com/drop).
3. Arrastra y suelta la carpeta **`dist`** (ubicada en `C:\Users\biond\Desktop\Cumple Caro\dist`) en la caja de carga de Netlify.
4. En pocos segundos, Netlify compilará el sitio y te dará una URL pública gratuita (ej. `https://random-name-12345.netlify.app`). Puedes cambiar ese nombre aleatorio por uno personalizado en la configuración del sitio dentro del panel de Netlify.

---

## Paso 6: Generar el Código QR para la Fiesta 📱🎉

Una vez tengas tu URL pública de Vercel o Netlify (asegúrate de que empiece con `https://` para que la cámara del celular pueda activar los permisos de la cámara web):

1. Abre un generador de códigos QR gratuito en línea (como [qr-code-generator.com](https://www.qr-code-generator.com/) o [qrcode-monkey.com](https://www.qrcode-monkey.com/)).
2. Pega tu URL de producción.
3. Descarga el código QR en alta calidad.
4. Imprímelo o colócalo en carteles en las mesas de la fiesta con un texto atractivo como: **"📸 ¡Ayúdanos a capturar los recuerdos! Escanea este código y sube tus fotos directamente al álbum."**
