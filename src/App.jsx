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
  Video as VideoIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CONFIG } from './config';

export default function App() {
  // Estados de la aplicación: 'idle', 'preview', 'uploading', 'success', 'error'
  const [status, setStatus] = useState('idle');
  const [uploadQueue, setUploadQueue] = useState([]); // Cola de archivos a subir
  const [guestName, setGuestName] = useState('');
  const [fileCategory, setFileCategory] = useState('image'); // 'image' o 'video' (usado para la interfaz)
  const [loadingMessage, setLoadingMessage] = useState('Procesando archivo...');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Refs independientes para cada acción de carga
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Estados para el Muro en Vivo (Live Wall)
  const [isScreenMode, setIsScreenMode] = useState(false);
  const [screenFiles, setScreenFiles] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFetchingScreen, setIsFetchingScreen] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  
  const transitionTimerRef = useRef(null);

  // Detectar si está en modo pantalla
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pantalla') === 'true' || params.get('view') === 'screen') {
      setIsScreenMode(true);
    }
  }, []);

  // Obtener los archivos multimedia de Google Drive
  const fetchScreenFiles = async () => {
    if (!CONFIG.API_URL || CONFIG.API_URL === "TU_GOOGLE_APPS_SCRIPT_URL_AQUI") {
      console.warn("La URL de Google Apps Script no está configurada.");
      return;
    }
    try {
      setIsFetchingScreen(true);
      const res = await fetch(CONFIG.API_URL);
      const data = await res.json();
      if (data.status === "success" && data.files) {
        setScreenFiles(data.files);
      }
    } catch (err) {
      console.error("Error al obtener los archivos para la pantalla:", err);
    } finally {
      setIsFetchingScreen(false);
    }
  };

  // Polling para actualizar los archivos en el muro cada 15 segundos
  useEffect(() => {
    if (!isScreenMode) return;
    fetchScreenFiles();
    const interval = setInterval(fetchScreenFiles, 15000);
    return () => clearInterval(interval);
  }, [isScreenMode]);

  // Manejar la transición automática del carrusel (cada 6 segundos)
  useEffect(() => {
    if (!isScreenMode || screenFiles.length === 0 || isPlayingVideo) return;
    
    transitionTimerRef.current = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % screenFiles.length);
    }, 6000);
    
    return () => {
      if (transitionTimerRef.current) clearInterval(transitionTimerRef.current);
    };
  }, [isScreenMode, screenFiles, isPlayingVideo]);

  // Funciones de control de reproducción de video en el carrusel
  const handleVideoPlay = () => {
    setIsPlayingVideo(true);
    if (transitionTimerRef.current) {
      clearInterval(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  };

  const handleVideoEnded = () => {
    setIsPlayingVideo(false);
    setActiveIdx(prev => (prev + 1) % screenFiles.length);
  };

  // Helper para extraer el nombre del invitado de la descripción del archivo
  const extractGuestName = (description) => {
    if (!description) return "Anónimo";
    const match = description.match(/invitado:\s*(.*)/i);
    if (match && match[1]) {
      return match[1].split("\n")[0].trim();
    }
    return "Anónimo";
  };

  const renderLiveWall = () => {
    const uploadUrl = window.location.origin + window.location.pathname;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(uploadUrl)}`;

    return (
      <main className="min-h-screen bg-gradient-to-br from-[#060A18] via-[#03050C] to-[#010204] text-slate-100 flex flex-col md:flex-row p-6 md:p-10 select-none overflow-hidden relative font-sans">
        {/* Glows de fondo para profundidad minimalista */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-slate-700/5 blur-[150px] pointer-events-none"></div>

        {/* Elementos Decorativos Flotantes */}
        <div className="absolute top-12 left-8 text-5xl select-none pointer-events-none opacity-20 animate-sway">🪩</div>
        <div className="absolute bottom-16 right-8 text-5xl select-none pointer-events-none opacity-20 animate-sway" style={{ animationDelay: '2s' }}>✨</div>
        <div className="absolute top-1/4 right-10 text-4xl select-none pointer-events-none opacity-10 animate-sway" style={{ animationDelay: '3.5s' }}>💙</div>
        <div className="absolute bottom-1/4 left-10 text-4xl select-none pointer-events-none opacity-15 animate-sway" style={{ animationDelay: '1s' }}>🎈</div>

        {/* COLUMNA IZQUIERDA: Instrucciones y QR (Glassmorphism oscuro) */}
        <section className="w-full md:w-[35%] flex flex-col justify-between items-center bg-[#0F172A]/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5),_inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden z-20 mb-6 md:mb-0 md:mr-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-900 via-slate-400 to-blue-950"></div>
          
          {/* Header */}
          <div className="text-center w-full mt-4">
            <div className="inline-block bg-blue-900/30 px-4 py-1.5 rounded-full border border-white/10 mb-4 shadow-sm">
              <span className="text-xs font-bold tracking-widest uppercase text-blue-200">
                MURO EN VIVO
              </span>
            </div>
            <h1 className="font-handwritten text-4xl md:text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(148,163,184,0.2)] mb-2">
              {CONFIG.EVENT_NAME}
            </h1>
            <div className="flex items-center justify-center my-3 w-2/3 mx-auto">
              <div className="h-[1px] bg-white/10 flex-1"></div>
              <span className="mx-2 text-xs text-slate-400">🎀</span>
              <div className="h-[1px] bg-white/10 flex-1"></div>
            </div>
          </div>

          {/* QR e Instrucciones */}
          <div className="flex flex-col items-center text-center my-6 space-y-5">
            <div className="bg-slate-100 p-5 rounded-2xl border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.4)] flex items-center justify-center transition-transform duration-300 hover:scale-[1.02]">
              <img 
                src={qrUrl} 
                alt="QR de subida" 
                className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-lg"
              />
            </div>
            <div className="space-y-2 max-w-[280px]">
              <h2 className="text-lg font-bold text-white">
                📸 ¡Compartí tu foto!
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Escaneá el código QR con tu celular y subí tus fotos para que aparezcan en pantalla al instante.
              </p>
            </div>
          </div>

          {/* Contador / Footer */}
          <div className="w-full text-center mb-2 space-y-1">
            <div className="text-xs font-semibold text-slate-300">
              Total: {screenFiles.length} {screenFiles.length === 1 ? 'foto subida' : 'fotos subidas'}
            </div>
            <div className="text-[10px] text-slate-500 font-sans italic">
              ¡A celebrar junto a Renata! 💖
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: Carrusel / Visor (Glassmorphism oscuro) */}
        <section className="flex-1 bg-[#0F172A]/20 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl p-6 flex flex-col justify-center items-center relative overflow-hidden z-20 min-h-[400px]">
          {screenFiles.length === 0 ? (
            /* Estado vacío: Sin fotos aún */
            <div className="text-center space-y-4 max-w-[320px] p-6">
              <div className="w-20 h-20 rounded-full bg-blue-900/30 border border-blue-800/20 flex items-center justify-center mx-auto shadow-[0_8px_32px_rgba(30,58,138,0.3)] animate-pulse">
                <Camera className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-xl font-handwritten font-bold text-white">
                Esperando fotos...
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ¡Escaneá el QR y sé el primero en subir una foto para inaugurar el muro de recuerdos!
              </p>
            </div>
          ) : (
            /* Carrusel con transiciones tridimensionales y desvanecimiento */
            <div className="w-full h-full flex flex-col relative justify-between">
              
              {/* Contenedor de la Imagen */}
              <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden rounded-2xl bg-black/20 min-h-[300px]">
                {screenFiles.map((file, idx) => {
                  const isActive = idx === activeIdx;
                  
                  return (
                    <div 
                      key={file.id}
                      className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1) ${
                        isActive 
                          ? 'opacity-100 scale-100 rotate-0 translate-y-0 z-10' 
                          : 'opacity-0 scale-95 rotate-[-3deg] translate-y-8 pointer-events-none z-0'
                      }`}
                    >
                      <div className="bg-[#FFFFFF]/95 p-4 pb-14 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.85),_0_0_50px_rgba(30,58,138,0.25)] border border-white/10 max-h-full max-w-full flex flex-col justify-center polaroid-frame relative">
                        <div className="max-h-[58vh] overflow-hidden rounded flex items-center justify-center bg-slate-50 border border-slate-100">
                          {isActive && (
                            <img 
                              src={`https://lh3.googleusercontent.com/d/${file.id}=w1200`}
                              alt={file.name}
                              className="max-h-[58vh] max-w-full object-contain"
                              onLoad={() => {
                                setIsPlayingVideo(false);
                              }}
                              onError={(e) => {
                                console.error("Error al cargar imagen de Drive:", e);
                              }}
                            />
                          )}
                        </div>
                        {/* Texto de firma Polaroid */}
                        <div className="absolute bottom-3 left-0 right-0 text-center">
                          <span className="font-handwritten text-2xl md:text-3xl text-slate-700 block truncate px-6">
                            📸 {extractGuestName(file.description)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Indicadores de diapositiva (Puntos elegantes estilo Dark Mode) */}
              <div className="h-6 flex items-center justify-center space-x-2 mt-3 z-20">
                {screenFiles.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setIsPlayingVideo(false);
                      setActiveIdx(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx === activeIdx 
                        ? 'w-6 bg-slate-200 shadow-[0_0_8px_rgba(255,255,255,0.7)]' 
                        : 'w-1.5 bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    );
  };

  // Mensajes de carga dinámicos para mejorar la experiencia de usuario
  const loadingMessages = [
    'Preparando tus recuerdos...',
    'Procesando archivo...',
    'Comprimiendo un poco para Drive...',
    'Subiendo al álbum de recuerdos...',
    'Guardando en la carpeta de Renata...',
    '¡Listo! Registrando tu carga...'
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

  // Manejar la selección o captura de múltiples archivos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (files.length > 3) {
      showError("Puedes seleccionar un máximo de 3 fotos a la vez.");
      return;
    }

    const newQueue = [];
    const errors = [];

    files.forEach((file, index) => {
      const isImage = file.type.startsWith('image/');

      if (!isImage) {
        errors.push(`"${file.name}" no es una foto válida.`);
        return;
      }

      // Validar el tamaño del archivo
      const maxMB = CONFIG.MAX_FILE_SIZE_MB;
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB > maxMB) {
        errors.push(`"${file.name}" supera el límite (${maxMB}MB).`);
        return;
      }

      newQueue.push({
        id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        file: file,
        category: 'image',
        previewUrl: URL.createObjectURL(file), // Genera una URL local para la preview (evita crashes de memoria)
        status: 'pending',
        error: ''
      });
    });

    if (errors.length > 0) {
      showError(errors.join('\n'));
      return;
    }

    if (newQueue.length > 0) {
      // Si ya había elementos (raro en este flujo, pero preventivo), liberamos sus urls antiguas
      uploadQueue.forEach(item => URL.revokeObjectURL(item.previewUrl));
      
      // Establecer categoría general de la subida para mensajes
      setFileCategory(newQueue.length === 1 ? newQueue[0].category : 'mix');
      setUploadQueue(newQueue);
      setStatus('preview');
    }
  };

  const removeFromQueue = (id) => {
    const itemToRemove = uploadQueue.find(item => item.id === id);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.previewUrl); // Liberar memoria
    }
    const updatedQueue = uploadQueue.filter(item => item.id !== id);
    if (updatedQueue.length === 0) {
      resetApp();
    } else {
      setUploadQueue(updatedQueue);
      setFileCategory(updatedQueue.length === 1 ? updatedQueue[0].category : 'mix');
    }
  };

  // Convertir archivo a Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Función para optimizar y redimensionar la imagen en el cliente
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
          
          // Resolución máxima
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

          // Convertir a JPEG con calidad 0.82
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Subir todos los archivos secuencialmente para evitar el límite de 50MB por post de Google
  const startQueueUpload = async () => {
    if (uploadQueue.length === 0) return;
    setStatus('uploading');
    
    let successCount = 0;
    let failCount = 0;
    const queueCopy = [...uploadQueue];

    for (let i = 0; i < queueCopy.length; i++) {
      const item = queueCopy[i];
      setLoadingMessage(`Subiendo archivo ${i + 1} de ${queueCopy.length}...`);
      
      item.status = 'uploading';
      setUploadQueue([...queueCopy]);

      try {
        let base64Data = '';
        let mimeType = item.file.type;
        
        if (item.category === 'image') {
          try {
            // Optimizar imagen en Canvas
            const optimizedDataUrl = await optimizeImage(item.file);
            base64Data = optimizedDataUrl.split(',')[1];
            mimeType = 'image/jpeg';
          } catch (optimizeError) {
            console.warn('Fallo la optimización de imagen, se enviará el original:', optimizeError);
            base64Data = await fileToBase64(item.file);
          }
        } else {
          base64Data = await fileToBase64(item.file);
        }

        // Preparar payload
        const nameCleaned = guestName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Invitado';
        const timestamp = new Date().getTime();
        const extension = item.file.name.split('.').pop() || (item.category === 'video' ? 'mp4' : 'jpg');
        const fileName = `cumple_${nameCleaned}_${timestamp}_${i}.${extension}`;

        const payload = {
          name: fileName,
          mimeType: mimeType,
          base64: base64Data,
          guestName: guestName.trim() || 'Anónimo'
        };

        if (!CONFIG.API_URL || CONFIG.API_URL === "TU_GOOGLE_APPS_SCRIPT_URL_AQUI") {
          throw new Error('La URL de Google Apps Script no está configurada.');
        }

        // Petición POST individual por archivo
        await fetch(CONFIG.API_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload)
        });

        item.status = 'success';
        successCount++;
      } catch (err) {
        console.error('Error al subir archivo:', err);
        item.status = 'error';
        item.error = err.message || 'Error de conexión.';
        failCount++;
      }

      setUploadQueue([...queueCopy]);
    }

    if (failCount === 0) {
      triggerSuccess();
    } else {
      showError(`Subida parcial: se subieron ${successCount} archivos con éxito, pero ${failCount} fallaron.`);
    }
  };

  const triggerSuccess = () => {
    setStatus('success');
    
    // Disparar confeti
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ['#A1C6EA', '#E1E7EC', '#6D92B0', '#FAF8F5', '#FFD700']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ['#A1C6EA', '#E1E7EC', '#6D92B0', '#FAF8F5', '#FFD700']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

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
    // Liberar URLs de memoria
    uploadQueue.forEach(item => URL.revokeObjectURL(item.previewUrl));
    
    setUploadQueue([]);
    setErrorMessage('');
    
    // Limpiar los inputs
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    
    setStatus('idle');
  };

  const hiddenInputStyle = {
    opacity: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '1px',
    height: '1px',
    zIndex: -1,
    pointerEvents: 'none'
  };

  if (isScreenMode) {
    return renderLiveWall();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-padding-bottom">
      
      {/* Elementos Decorativos Flotantes */}
      <div className="absolute top-12 left-8 text-4xl select-none pointer-events-none opacity-40 animate-sway">🪩</div>
      <div className="absolute bottom-16 right-8 text-4xl select-none pointer-events-none opacity-30 animate-sway" style={{ animationDelay: '2s' }}>✨</div>
      <div className="absolute top-1/4 right-10 text-3xl select-none pointer-events-none opacity-20 animate-sway" style={{ animationDelay: '3.5s' }}>💙</div>
      <div className="absolute bottom-1/4 left-10 text-3xl select-none pointer-events-none opacity-25 animate-sway" style={{ animationDelay: '1s' }}>🎈</div>

      {/* Tarjeta de Invitación Premium */}
      <div className="w-full max-w-md paper-card rounded-2xl p-6 md:p-8 flex flex-col relative overflow-hidden transition-all duration-300">
        
        {/* Borde sutil superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-invitation-blue via-invitation-silver to-invitation-blueDark"></div>

        {/* Titular Principal / Header */}
        <header className="text-center mb-6 flex flex-col items-center">
          <div className="flex items-center justify-center space-x-1 bg-invitation-blueLight/60 px-4 py-1 rounded-full border border-invitation-blue/30 mb-3.5">
            <span className="text-[10px] font-bold tracking-widest uppercase text-invitation-blueDark font-sans">
              ÁLBUM RECUERDO
            </span>
          </div>
          
          <div className="flex flex-col items-center select-none mb-1">
            <span className="font-serif tracking-[0.25em] text-xs font-bold text-invitation-blueDark uppercase">
              MIS 15
            </span>
            <span className="text-4xl font-extrabold text-invitation-blueDark drop-shadow-sm select-none font-serif py-1 tracking-wider">
              15
            </span>
          </div>

          <h1 className="font-handwritten text-4xl md:text-5xl font-bold text-invitation-charcoal mt-1">
            ¡Mis 15 Renata!
          </h1>
          
          {/* Línea divisoria decorativa con un moño */}
          <div className="flex items-center w-3/4 justify-center my-3">
            <div className="h-[1px] bg-invitation-gray flex-1"></div>
            <span className="mx-2 text-xs text-slate-400 select-none">🎀</span>
            <div className="h-[1px] bg-invitation-gray flex-1"></div>
          </div>
          
          <p className="text-xs font-sans text-slate-500 italic max-w-[280px]">
            Compartí tu momento divertido con Renata
          </p>
        </header>

        {/* --- ESTADO: IDLE (Pantalla de Bienvenida) --- */}
        {status === 'idle' && (
          <section className="flex-1 flex flex-col justify-between animate-fade-in" id="section-idle">
            
            <div className="flex flex-col items-center text-center my-4 py-5 px-4 rounded-xl bg-invitation-blueLight/20 border border-invitation-blue/20 relative">
              <div className="absolute -top-3 w-20 h-5 tape-decor"></div>
              
              <div className="w-16 h-16 rounded-full bg-invitation-blueLight/50 flex items-center justify-center shadow-blue-balloon mb-3.5">
                <Camera className="w-8 h-8 text-invitation-blueDark animate-pulse" style={{ animationDuration: '3s' }} />
              </div>
              
              <h2 className="font-handwritten text-2xl font-bold text-invitation-charcoal mb-1">
                ¿Qué vas a subir hoy?
              </h2>
              <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
                Toma fotos en vivo o selecciona hasta 3 fotos de tu galería para compartirlas juntas.
              </p>
            </div>

            <div className="space-y-3 mt-4">
              
              {/* Botón 1: Tomar Foto (Azul) */}
              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-invitation-blue to-invitation-blueDark hover:from-[#A8CDEE] hover:to-[#7499B7] text-white font-bold text-base shadow-blue-balloon hover:scale-[1.015] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2.5 btn-shimmer"
              >
                <Camera className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
                <span>📸 Tomar Foto</span>
              </button>

              {/* Botón 3: Cargar desde Galería (Múltiple) */}
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full py-3 px-6 rounded-xl bg-invitation-paper border border-invitation-gray hover:border-invitation-blueDark hover:scale-[1.015] text-invitation-charcoal font-semibold text-sm active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm btn-shimmer"
              >
                <ImageIcon className="w-4 h-4 text-invitation-blueDark" />
                <span>🖼️ Elegir de la Galería (Máx. 3)</span>
              </button>

              {/* Divisor & Botón para ver el Álbum */}
              {CONFIG.SHARED_ALBUM_URL && (
                <>
                  <div className="flex items-center w-full justify-center my-1">
                    <div className="h-[1px] bg-invitation-gray flex-1"></div>
                    <span className="mx-2 text-[10px] text-slate-400 font-sans uppercase tracking-wider">Ver recuerdos</span>
                    <div className="h-[1px] bg-invitation-gray flex-1"></div>
                  </div>

                  <a
                    href={CONFIG.SHARED_ALBUM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 rounded-xl bg-invitation-blueLight/30 border border-invitation-blue/40 hover:bg-invitation-blueLight/50 text-invitation-blueDark font-bold text-sm active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm btn-shimmer"
                  >
                    <span>✨ Ver Álbum de Fotos</span>
                  </a>
                </>
              )}

              <div className="text-center pt-2">
                <span className="font-handwritten text-base text-slate-500 flex items-center justify-center space-x-1 select-none">
                  <span>Viernes 12 de junio - ¡A festejar!</span>
                  <Heart className="w-3.5 h-3.5 text-invitation-blueDark fill-invitation-blueDark animate-pulse ml-1" />
                </span>
              </div>
            </div>
          </section>
        )}

        {/* --- ESTADO: PREVIEW (Soporta Polaroid individual o Grid múltiple) --- */}
        {status === 'preview' && (
          <section className="flex-1 flex flex-col justify-between animate-fade-in" id="section-preview">
            <div className="space-y-4">
              
              {/* Renderizado dinámico según la cantidad de archivos */}
              {uploadQueue.length === 1 ? (
                /* Polaroid individual */
                <div className="bg-white p-3.5 pb-8 rounded shadow-xl rotate-[-1deg] mx-auto max-w-[280px] border border-slate-100 polaroid-frame">
                  <div className="aspect-[4/3] bg-slate-100 rounded overflow-hidden relative border border-slate-200/60 flex items-center justify-center">
                    {uploadQueue[0].category === 'image' ? (
                      <img 
                        src={uploadQueue[0].previewUrl} 
                        alt="Previsualización" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video 
                        src={uploadQueue[0].previewUrl} 
                        controls 
                        className="w-full h-full object-cover"
                        playsInline
                      />
                    )}
                  </div>
                  <div className="mt-4 flex flex-col items-center">
                    <span className="font-handwritten text-lg text-slate-600">
                      {uploadQueue[0].category === 'video' ? '🎬 Mi Video' : '📸 Mi Recuerdo'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Grid de múltiples fotos/videos */
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Archivos seleccionados ({uploadQueue.length})
                    </span>
                    <span className="text-[10px] text-slate-400 italic">Puedes quitar con la cruz</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5 max-h-[250px] overflow-y-auto p-2 border border-invitation-gray/50 rounded-xl bg-[#FAF8F5]/60 shadow-inner">
                    {uploadQueue.map((item) => (
                      <div key={item.id} className="bg-white p-1.5 pb-4 rounded shadow border border-slate-100/80 relative group hover:scale-[1.01] transition-all">
                        
                        {/* Botón para remover de la cola */}
                        <button
                          onClick={() => removeFromQueue(item.id)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow z-10 transition-colors"
                        >
                          ✕
                        </button>

                        <div className="aspect-[4/3] bg-slate-200 rounded overflow-hidden relative flex items-center justify-center border border-slate-100">
                          {item.category === 'image' ? (
                            <img 
                              src={item.previewUrl} 
                              alt="Miniatura" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="relative w-full h-full">
                              <video 
                                src={item.previewUrl} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <VideoIcon className="w-5 h-5 text-white animate-pulse" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-[9px] text-slate-500 text-center mt-1 truncate px-1">
                          {item.file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input para el Nombre del Invitado */}
              <div className="bg-invitation-blueLight/10 p-4 rounded-xl border border-invitation-gray space-y-2 mt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5 font-sans">
                  <User className="w-3.5 h-3.5 text-invitation-blueDark" />
                  <span>Tu nombre o firma</span>
                </label>
                <input 
                  type="text" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ej: Santi, Tía Inés, Los primos..."
                  maxLength={40}
                  className="w-full bg-[#FAF8F5] border border-invitation-gray rounded-lg px-3.5 py-2.5 text-sm text-invitation-charcoal placeholder-slate-400 focus:outline-none focus:border-invitation-blueDark focus:ring-1 focus:ring-invitation-blueDark/40 transition-all duration-200"
                />
              </div>

            </div>

            {/* Botonera de Acción */}
            <div className="flex flex-col space-y-2.5 mt-5">
              <button
                onClick={startQueueUpload}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 hover:scale-[1.015] text-white font-bold text-base shadow-md active:scale-[0.98] transition-all flex items-center justify-center space-x-2 btn-shimmer"
              >
                <Upload className="w-5 h-5" />
                <span>
                  🚀 Compartir {uploadQueue.length > 1 ? `estos ${uploadQueue.length} recuerdos` : 'recuerdo'}
                </span>
              </button>

              <button
                onClick={resetApp}
                className="w-full py-2.5 px-6 rounded-xl bg-invitation-paper hover:bg-slate-50 text-slate-500 font-semibold text-xs border border-invitation-gray active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5 shadow-sm btn-shimmer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Elegir otros archivos</span>
              </button>
            </div>
          </section>
        )}

        {/* --- ESTADO: UPLOADING (Subida secuencial en cola) --- */}
        {status === 'uploading' && (
          <section className="flex-1 flex flex-col items-center justify-center py-10 animate-fade-in" id="section-uploading">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-invitation-blueDark animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                {fileCategory === 'video' ? (
                  <VideoIcon className="w-7 h-7 text-invitation-blueDark animate-pulse" />
                ) : (
                  <ImageIcon className="w-7 h-7 text-invitation-blueDark animate-pulse" />
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold text-invitation-charcoal mb-1.5 text-center">
              Guardando recuerdos...
            </h3>
            <p className="text-xs text-slate-500 text-center animate-pulse font-sans max-w-[260px]">
              {loadingMessage}
            </p>

            {/* Barra de progreso visual */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-6 border border-invitation-gray/50 max-w-[240px]">
              <div className="h-full bg-gradient-to-r from-invitation-blue to-invitation-blueDark w-[80%] rounded-full"></div>
            </div>
            
            <p className="text-[10px] text-slate-400 mt-4 font-sans text-center">
              Subiendo archivos uno a uno para evitar límites de tamaño. No cierres la ventana.
            </p>
          </section>
        )}

        {/* --- ESTADO: SUCCESS --- */}
        {status === 'success' && (
          <section className="flex-1 flex flex-col items-center text-center py-6 animate-fade-in" id="section-success">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-5 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="font-handwritten text-3xl font-extrabold text-invitation-charcoal mb-2">
              ¡Guardados con éxito! 🎉
            </h3>
            <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed mb-6 font-sans">
              Muchas gracias {guestName ? <strong className="text-invitation-blueDark font-bold">{guestName}</strong> : 'amigo/a'} por capturar estos momentos. Ya están en la carpeta de Drive de Renata.
            </p>

            <button
              onClick={resetApp}
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-invitation-blue to-invitation-blueDark hover:shadow-blue-balloon text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] btn-shimmer"
            >
              📸 Subir más recuerdos
            </button>

            {CONFIG.SHARED_ALBUM_URL && (
              <a
                href={CONFIG.SHARED_ALBUM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex py-2.5 px-6 rounded-xl bg-invitation-paper border border-invitation-gray text-slate-500 font-semibold text-xs hover:border-invitation-blueDark active:scale-[0.98] transition-all btn-shimmer"
              >
                ✨ Ver Álbum de Fotos
              </a>
            )}
            
            <p className="text-[10px] text-slate-400 mt-6 font-sans">
              Volviendo al inicio en unos segundos automáticamente...
            </p>
          </section>
        )}

        {/* --- ESTADO: ERROR --- */}
        {status === 'error' && (
          <section className="flex-1 flex flex-col items-center text-center py-6 animate-fade-in" id="section-error">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-5 animate-pulse">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <h3 className="text-lg font-bold text-invitation-charcoal mb-2">Hubo un pequeño error</h3>
            <p className="text-xs text-rose-800 bg-rose-50/70 p-4 rounded-xl border border-rose-100 max-w-sm mb-6 text-left break-words whitespace-pre-line">
              {errorMessage}
            </p>

            <div className="flex flex-col w-full space-y-2">
              <button
                onClick={startQueueUpload}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-invitation-blue to-invitation-blueDark text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] btn-shimmer"
              >
                🔄 Reintentar subir archivos fallidos
              </button>
              
              <button
                onClick={resetApp}
                className="w-full py-2.5 px-6 rounded-xl bg-invitation-paper hover:bg-slate-50 text-slate-500 font-semibold text-xs border border-invitation-gray transition-all shadow-sm btn-shimmer"
              >
                Volver al inicio
              </button>
            </div>
          </section>
        )}

        {/* --- INPUTS DE CARGA --- */}

        {/* Input Oculto de Captura Directa de Foto (Camera) */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={photoInputRef}
          onChange={handleFileChange}
          style={hiddenInputStyle}
        />

        {/* Input Oculto para Carga desde Galería/Archivos (Múltiple) */}
        <input
          type="file"
          accept="image/*"
          multiple
          ref={galleryInputRef}
          onChange={handleFileChange}
          style={hiddenInputStyle}
        />

      </div>
    </main>
  );
}
