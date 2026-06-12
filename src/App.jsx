import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Heart, 
  Sparkles, 
  User, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CONFIG } from './config';

export default function App() {
  // Estados de la aplicación: 'idle', 'preview', 'uploading', 'success', 'error'
  const [status, setStatus] = useState('idle');
  const [imagePreview, setImagePreview] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Procesando foto...');
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef(null);

  // Mensajes de carga dinámicos para mejorar la experiencia de usuario
  const loadingMessages = [
    'Optimizando imagen para Google Drive...',
    'Procesando foto...',
    'Preparando paquete de datos...',
    'Subiendo al álbum de Caro...',
    'Casi listo, guardando foto...',
    '¡Listo! Generando confirmación...'
  ];

  // Cambiar mensajes de carga secuencialmente
  useEffect(() => {
    let interval;
    if (status === 'uploading') {
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Manejar la selección o captura de la foto
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar si el archivo es una imagen
    if (!file.type.startsWith('image/')) {
      showError('Por favor, selecciona o toma una imagen válida.');
      return;
    }

    // Validar el tamaño del archivo original (por precaución)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > CONFIG.MAX_FILE_SIZE_MB) {
      showError(`La foto es demasiado grande. El límite es de ${CONFIG.MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setOriginalFile(file);
    setStatus('selecting');

    // Generar previsualización local
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setStatus('preview');
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Función para optimizar y redimensionar la imagen en el cliente
  // Esto reduce fotos de 10MB a menos de 1MB conservando excelente calidad,
  // evitando timeouts en Google Apps Script y haciendo la carga súper rápida.
  const optimizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resolución máxima (Full HD flexible)
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir a JPEG con calidad 0.82 (balance óptimo peso/calidad)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Subir la foto al backend de Google Apps Script
  const uploadPhoto = async () => {
    if (!imagePreview) return;
    setStatus('uploading');
    setLoadingMessage('Optimizando imagen...');

    try {
      let base64Data = '';
      let mimeType = 'image/jpeg'; // Por defecto tras la optimización
      
      try {
        // Intentar optimizar en Canvas
        const optimizedDataUrl = await optimizeImage(originalFile);
        // El formato es: data:image/jpeg;base64,.....
        base64Data = optimizedDataUrl.split(',')[1];
      } catch (optimizeError) {
        console.warn('Fallo la optimización de imagen, se enviará el archivo original:', optimizeError);
        // Fallback: usar el archivo original tal cual
        base64Data = imagePreview.split(',')[1];
        mimeType = originalFile.type;
      }

      // Preparar payload
      const nameCleaned = guestName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Invitado';
      const timestamp = new Date().getTime();
      const fileName = `cumple_${nameCleaned}_${timestamp}.jpg`;

      const payload = {
        name: fileName,
        mimeType: mimeType,
        base64: base64Data,
        guestName: guestName.trim() || 'Anónimo'
      };

      // Validar si hay URL configurada
      if (!CONFIG.API_URL || CONFIG.API_URL === "TU_GOOGLE_APPS_SCRIPT_URL_AQUI") {
        throw new Error('La URL de Google Apps Script no está configurada. Por favor, edita src/config.js.');
      }

      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        mode: 'no-cors', // Exigido para peticiones simples de GAS si no se maneja preflight,
        // pero hemos configurado soporte completo en el Código.gs. Intentamos primero normal:
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      // Nota: Si usamos 'no-cors', fetch no tendrá acceso a la respuesta detallada (response.ok será false y status 0).
      // Para brindar la mejor experiencia, enviamos normal. Si falla por CORS o red, lanzamos error.
      // Sin embargo, Google Apps Script con redirecciones a veces arroja problemas de CORS.
      // Para solucionar esto de forma robusta a nivel de código de producción,
      // intentaremos una petición normal, pero si falla por CORS (status 0) tras enviar el payload,
      // podemos verificar si se subió correctamente o estructurar la respuesta.
      // Dado que doPost redirige a un sandbox de Google User Content, la forma más infalible es enviar la petición.
      // Si usamos fetch normal y el script responde con JSON + CORS headers, todo funciona excelente.
      
      // Lanzamos la petición. Con CORS configurado en Código.gs, funcionará de manera nativa.
      const responseData = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Evita el preflight OPTIONS de CORS de manera segura en GAS
        },
        body: JSON.stringify(payload)
      });

      const result = await responseData.json();

      if (result && result.status === 'success') {
        triggerSuccess();
      } else {
        throw new Error(result?.message || 'Error en el servidor de Google Drive.');
      }

    } catch (err) {
      console.error('Error al subir:', err);
      // Si es un error de CORS común de Google Apps Script (donde el navegador bloquea la lectura del JSON pero el archivo se subió)
      // Podemos manejar una confirmación. Pero con nuestra configuración 'text/plain' y retorno CORS,
      // minimizaremos estos fallos.
      showError(err.message || 'No se pudo conectar con el servidor. Revisa tu conexión.');
    }
  };

  const triggerSuccess = () => {
    setStatus('success');
    
    // Disparar confeti de celebración
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF2E93', '#A020F0', '#FFD700', '#FF5E36']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF2E93', '#A020F0', '#FFD700', '#FF5E36']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Limpiar formulario tras 6 segundos y volver a idle automáticamente
    const timer = setTimeout(() => {
      resetApp();
    }, 6000);

    return () => clearTimeout(timer);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setStatus('error');
  };

  const resetApp = () => {
    setImagePreview(null);
    setOriginalFile(null);
    setErrorMessage('');
    setUploadProgress(0);
    setStatus('idle');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-padding-bottom">
      
      {/* Elementos Decorativos de Fondo de Fiesta */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-festive-pink opacity-20 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-festive-purple opacity-20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      {/* Tarjeta Contenedor Principal */}
      <div className="w-full max-w-md glass-panel rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col relative overflow-hidden transition-all duration-300">
        
        {/* Borde sutil de neón festivo */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-festive-pink via-festive-purple to-festive-gold"></div>

        {/* Titular Principal / Header */}
        <header className="text-center mb-6 flex flex-col items-center">
          <div className="flex items-center justify-center space-x-2 bg-dark-700/60 px-4 py-1.5 rounded-full border border-white/5 mb-3">
            <Sparkles className="w-4 h-4 text-festive-gold animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs font-semibold tracking-wider uppercase text-festive-gold">Álbum de Recuerdos</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-1">
            📸 <span className="bg-gradient-to-r from-white via-slate-200 to-festive-pink bg-clip-text text-transparent">{CONFIG.EVENT_NAME}</span>
          </h1>
          <p className="text-sm text-slate-400">
            Comparte tus mejores momentos capturados al instante
          </p>
        </header>

        {/* --- ESTADO: IDLE (Pantalla de Bienvenida) --- */}
        {status === 'idle' && (
          <section className="flex-1 flex flex-col justify-between" id="section-idle">
            <div className="flex flex-col items-center text-center my-6 py-6 px-4 rounded-2xl bg-dark-800/40 border border-white/5 relative group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-festive-pink to-festive-purple flex items-center justify-center shadow-lg shadow-festive-pink/20 animate-float mb-4">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">¡Sube tus fotos a la fiesta!</h2>
              <p className="text-xs text-slate-400 max-w-[280px]">
                Presiona el botón para abrir la cámara de tu móvil, capturar una foto o seleccionarla de tu galería.
              </p>
            </div>

            <div className="space-y-4">
              {/* Botón principal animado */}
              <button
                onClick={triggerFileInput}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-festive-pink via-festive-purple to-festive-pink bg-[size:200%_auto] text-white font-bold text-lg shadow-xl shadow-festive-pink/20 hover:shadow-festive-pink/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-shimmer scale-pulse flex items-center justify-center space-x-3"
              >
                <Camera className="w-6 h-6 animate-bounce" />
                <span>📸 Tomar o Elegir Foto</span>
              </button>

              <div className="text-center">
                <span className="text-xs text-slate-500 flex items-center justify-center space-x-1">
                  <span>Hecho con</span>
                  <Heart className="w-3.5 h-3.5 text-festive-pink fill-festive-pink animate-pulse" />
                  <span>para Caro</span>
                </span>
              </div>
            </div>
          </section>
        )}

        {/* --- ESTADO: PREVIEW (Previsualización de Foto y Nombre) --- */}
        {status === 'preview' && (
          <section className="flex-1 flex flex-col justify-between" id="section-preview">
            <div className="space-y-4">
              
              {/* Contenedor Polaroid-style para la imagen */}
              <div className="bg-white p-3 pb-6 rounded-2xl shadow-2xl rotate-[-1deg] mx-auto max-w-[320px] border border-slate-200">
                <div className="aspect-[4/3] bg-slate-900 rounded-lg overflow-hidden relative border border-slate-100 flex items-center justify-center">
                  <img 
                    src={imagePreview} 
                    alt="Previsualización" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 flex items-center justify-center">
                  <div className="h-2 w-12 bg-slate-200 rounded-full"></div>
                </div>
              </div>

              {/* Input para el Nombre del Invitado */}
              <div className="bg-dark-800/80 p-4 rounded-2xl border border-white/5 space-y-2 mt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-festive-pink" />
                  <span>¿Quién eres? (Tu nombre)</span>
                </label>
                <input 
                  type="text" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ej: Sofi y Mati, Tío Juan..."
                  maxLength={40}
                  className="w-full bg-dark-900 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-festive-pink focus:ring-1 focus:ring-festive-pink/50 transition-all duration-200"
                />
              </div>

            </div>

            {/* Botonera de Acción */}
            <div className="flex flex-col space-y-2.5 mt-6">
              <button
                onClick={uploadPhoto}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>🚀 Subir Foto al Álbum</span>
              </button>

              <button
                onClick={resetApp}
                className="w-full py-3.5 px-6 rounded-2xl bg-dark-700/80 hover:bg-dark-700 text-slate-300 font-semibold text-sm border border-white/5 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tomar otra foto</span>
              </button>
            </div>
          </section>
        )}

        {/* --- ESTADO: UPLOADING (Cargando) --- */}
        {status === 'uploading' && (
          <section className="flex-1 flex flex-col items-center justify-center py-10" id="section-uploading">
            <div className="relative mb-6">
              {/* Spinner animado circular */}
              <div className="w-24 h-24 rounded-full border-4 border-dark-700 border-t-festive-pink animate-spin"></div>
              {/* Icono central estático */}
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-festive-pink animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 text-center">Subiendo tu recuerdo</h3>
            <p className="text-sm text-slate-400 text-center animate-pulse max-w-[260px]">
              {loadingMessage}
            </p>

            {/* Barra de progreso visual simulada/estética para evitar esperas vacías */}
            <div className="w-full bg-dark-700 h-2.5 rounded-full overflow-hidden mt-6 border border-white/5 max-w-[280px]">
              <div className="h-full bg-gradient-to-r from-festive-pink to-festive-purple shimmer-bg w-[85%] rounded-full"></div>
            </div>
            
            <p className="text-[10px] text-slate-500 mt-2">
              No cierres el navegador ni bloquees tu móvil.
            </p>
          </section>
        )}

        {/* --- ESTADO: SUCCESS (Subida Exitosa) --- */}
        {status === 'success' && (
          <section className="flex-1 flex flex-col items-center text-center py-8" id="section-success">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 scale-pulse">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <h3 className="text-2xl font-extrabold text-white mb-2">¡Foto subida con éxito! 🎉</h3>
            <p className="text-sm text-slate-400 max-w-[280px] mb-6">
              Gracias {guestName ? <strong className="text-festive-pink font-semibold">{guestName}</strong> : 'amigo/a'} por capturar este hermoso momento. ¡Ya está en el álbum de Caro!
            </p>

            <button
              onClick={resetApp}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-festive-pink to-festive-purple hover:scale-[1.02] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              📸 Subir otra foto
            </button>
            
            <p className="text-[11px] text-slate-500 mt-6">
              Volviendo a la pantalla principal automáticamente en unos segundos...
            </p>
          </section>
        )}

        {/* --- ESTADO: ERROR (Pantalla de Error) --- */}
        {status === 'error' && (
          <section className="flex-1 flex flex-col items-center text-center py-8" id="section-error">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6 animate-bounce">
              <AlertTriangle className="w-12 h-12" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">¡Ups! Algo salió mal</h3>
            <p className="text-sm text-rose-300 bg-rose-950/40 p-4 rounded-2xl border border-rose-900/30 max-w-sm mb-6 text-left break-words">
              {errorMessage}
            </p>

            <div className="flex flex-col w-full space-y-2">
              <button
                onClick={uploadPhoto}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-festive-pink to-festive-purple text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                🔄 Reintentar subir
              </button>
              
              <button
                onClick={resetApp}
                className="w-full py-3.5 px-6 rounded-2xl bg-dark-700/80 hover:bg-dark-700 text-slate-300 font-semibold text-sm border border-white/5 transition-all"
              >
                Volver a empezar
              </button>
            </div>
          </section>
        )}

        {/* Input Oculto de Captura */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

      </div>
    </main>
  );
}
