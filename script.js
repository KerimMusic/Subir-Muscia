import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ============================================
// ✅ TU CONFIGURACIÓN REAL DE FIREBASE
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyDMabE70hIApcNU5RY3_WEEIF-BWUzO0K4",
  authDomain: "kerim-music-a9c46.firebaseapp.com",
  projectId: "kerim-music-a9c46",
  storageBucket: "kerim-music-a9c46.firebasestorage.app",
  messagingSenderId: "470731440209",
  appId: "1:470731440209:web:f6eba4784027a5d8c57870",
  measurementId: "G-LBHTKL8KDK"
};
// ============================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Elementos del DOM
const loginBtn   = document.getElementById('loginBtn');
const form       = document.getElementById('formCancion');
const userBox    = document.getElementById('userBox');
const userEmail  = document.getElementById('userEmail');
const status     = document.getElementById('status');
const submitBtn  = document.getElementById('submitBtn');
const preview    = document.getElementById('preview');
const previewImg = document.getElementById('previewImg');
const previewTitulo  = document.getElementById('previewTitulo');
const previewArtista = document.getElementById('previewArtista');

// Historial
const historySection = document.getElementById('historySection');
const historyList    = document.getElementById('historyList');
const historyCount   = document.getElementById('historyCount');
const historyEmpty   = document.getElementById('historyEmpty');

// Modal reproductor
const playerModal    = document.getElementById('playerModal');
const playerImg      = document.getElementById('playerImg');
const playerTitle    = document.getElementById('playerTitle');
const playerArtist   = document.getElementById('playerArtist');
const playerPlay     = document.getElementById('playerPlay');
const playerRewind   = document.getElementById('playerRewind');
const playerForward  = document.getElementById('playerForward');
const playerSeek     = document.getElementById('playerSeek');
const playerVol      = document.getElementById('playerVol');
const playerCurrent  = document.getElementById('playerCurrent');
const playerDuration = document.getElementById('playerDuration');

let usuarioActual = null;
let unsubscribeHistorial = null;
let cancionesActuales = [];

const PLACEHOLDER = 'https://via.placeholder.com/64/333/666?text=%E2%99%AB';

// ===================
// Utilidades
// ===================
function mostrarStatus(msg, tipo = 'ok') {
  status.textContent = msg;
  status.className = 'status ' + tipo;
  if (tipo === 'ok') {
    setTimeout(() => { status.className = 'status'; }, 4000);
  }
}

// Convertir link normal de Dropbox a link directo
function dropboxDirecto(url) {
  if (!url) return '';
  url = url.trim();
  return url
    .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
    .replace('?dl=0', '')
    .replace('?dl=1', '')
    .replace('&dl=0', '')
    .replace('&dl=1', '')
    .replace('?raw=1', '');
}

// Evitar inyección de HTML en el historial
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

// ===================
// Autenticación
// ===================
loginBtn.addEventListener('click', async () => {
  try {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loader"></span>Iniciando sesión...';
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error(e);
    mostrarStatus('Error al iniciar sesión: ' + e.message, 'error');
    loginBtn.disabled = false;
    loginBtn.innerHTML = 'Iniciar sesión con Google';
  }
});

onAuthStateChanged(auth, (user) => {
  usuarioActual = user;

  if (user) {
    loginBtn.classList.add('hidden');
    userBox.classList.remove('hidden');
    form.classList.remove('hidden');
    historySection.classList.remove('hidden');
    userEmail.textContent = user.email;

    // 🔥 Escuchar el historial en tiempo real
    escucharHistorial(user.uid);

  } else {
    loginBtn.classList.remove('hidden');
    loginBtn.disabled = false;
    loginBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Iniciar sesión con Google
    `;
    userBox.classList.add('hidden');
    form.classList.add('hidden');
    historySection.classList.add('hidden');

    if (unsubscribeHistorial) {
      unsubscribeHistorial();
      unsubscribeHistorial = null;
    }
    historyList.innerHTML = '';
    historyCount.textContent = '0';
    historyEmpty.classList.add('hidden');
    cancionesActuales = [];

    // Cerrar player si estaba abierto
    cerrarPlayer();
  }
});

// ===================
// Vista previa dinámica (formulario)
// ===================
['artista', 'titulo', 'imagen'].forEach(id => {
  document.getElementById(id).addEventListener('input', actualizarPreview);
});

function actualizarPreview() {
  const artista = document.getElementById('artista').value.trim();
  const titulo  = document.getElementById('titulo').value.trim();
  const imagen  = document.getElementById('imagen').value.trim();

  if (!artista && !titulo && !imagen) {
    preview.classList.remove('show');
    return;
  }

  preview.classList.add('show');
  previewTitulo.textContent  = titulo || '—';
  previewArtista.textContent = artista || '—';

  if (imagen) {
    previewImg.src = dropboxDirecto(imagen);
    previewImg.onerror = () => { previewImg.src = PLACEHOLDER; };
  } else {
    previewImg.src = PLACEHOLDER;
  }
}

// ===================
// HISTORIAL: escuchar, pintar y eliminar
// ===================
function escucharHistorial(uid) {
  if (unsubscribeHistorial) unsubscribeHistorial();

  historyList.innerHTML = '<p class="history-empty">Cargando canciones...</p>';
  historyEmpty.classList.add('hidden');

  const ref = collection(db, 'historial_usuarios', uid, 'canciones');

  unsubscribeHistorial = onSnapshot(ref, (snap) => {
    const canciones = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    canciones.sort((a, b) => {
      const fa = a.fecha?.seconds || 0;
      const fb = b.fecha?.seconds || 0;
      return fb - fa;
    });

    renderHistorial(canciones);
  }, (err) => {
    console.error('Error historial:', err);
    historyList.innerHTML = '';
    mostrarStatus('Error al cargar el historial: ' + err.message, 'error');
  });
}

function renderHistorial(canciones) {
  cancionesActuales = canciones;
  historyCount.textContent = canciones.length;

  if (!canciones.length) {
    historyList.innerHTML = '';
    historyEmpty.classList.remove('hidden');
    return;
  }

  historyEmpty.classList.add('hidden');

  historyList.innerHTML = canciones.map(c => {
    const img = c.imagenUrl ? escapeHtml(c.imagenUrl) : PLACEHOLDER;
    const titulo  = escapeHtml(c.titulo  || 'Sin título');
    const artista = escapeHtml(c.artista || 'Desconocido');

    return `
      <div class="history-item" data-id="${escapeHtml(c.id)}">
        <img src="${img}" alt="" loading="lazy"
             onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
        <div class="history-info">
          <strong title="${titulo}">${titulo}</strong>
          <small title="${artista}">${artista}</small>
        </div>
        <button type="button" class="btn-delete" data-id="${escapeHtml(c.id)}" title="Eliminar canción">
          🗑️
        </button>
      </div>
    `;
  }).join('');
}

// Delegación de eventos para los botones de eliminar
historyList.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;

  const id = btn.dataset.id;
  const item = btn.closest('.history-item');
  const titulo = item?.querySelector('.history-info strong')?.textContent || 'esta canción';

  eliminarCancion(id, btn, titulo);
});

async function eliminarCancion(id, boton, titulo) {
  if (!usuarioActual) {
    mostrarStatus('Debes iniciar sesión primero', 'error');
    return;
  }

  const confirmado = confirm(`¿Seguro que quieres eliminar "${titulo}"?\nEsta acción no se puede deshacer.`);
  if (!confirmado) return;

  try {
    boton.disabled = true;
    boton.textContent = '⏳';

    await deleteDoc(doc(db, 'historial_usuarios', usuarioActual.uid, 'canciones', id));

    mostrarStatus('🗑️ Canción eliminada correctamente', 'ok');

  } catch (err) {
    console.error('Error al eliminar:', err);
    mostrarStatus('Error al eliminar: ' + err.message, 'error');
    boton.disabled = false;
    boton.textContent = '🗑️';
  }
}

// ===================
// Guardar canción
// ===================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!usuarioActual) {
    mostrarStatus('Debes iniciar sesión primero', 'error');
    return;
  }

  const artista   = document.getElementById('artista').value.trim();
  const titulo    = document.getElementById('titulo').value.trim();
  const audioRaw  = document.getElementById('audio').value.trim();
  const imagenRaw = document.getElementById('imagen').value.trim();

  if (!artista || !titulo || !audioRaw) {
    mostrarStatus('Completa artista, título y audio', 'error');
    return;
  }

  const audioUrl  = dropboxDirecto(audioRaw);
  const imagenUrl = imagenRaw ? dropboxDirecto(imagenRaw) : '';

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loader"></span>Verificando audio...';
  mostrarStatus('Verificando que el audio de Dropbox sea accesible...', 'loading');

  try {
    const res = await fetch(audioUrl, { method: 'HEAD' });
    if (!res.ok) throw new Error('El link de audio no responde correctamente');
  } catch (err) {
    console.warn('Validación de audio:', err);
  }

  try {
    submitBtn.innerHTML = '<span class="loader"></span>Guardando...';
    mostrarStatus('Guardando en la base de datos...', 'loading');

    const uid = usuarioActual.uid;

    await addDoc(collection(db, 'historial_usuarios', uid, 'canciones'), {
      artista:   artista,
      titulo:    titulo,
      audioUrl:  audioUrl,
      imagenUrl: imagenUrl,
      origen:    'dropbox',
      uid:       uid,
      email:     usuarioActual.email,
      fecha:     serverTimestamp()
    });

    mostrarStatus('✅ Canción subida correctamente', 'ok');

    form.reset();
    preview.classList.remove('show');

    submitBtn.disabled = false;
    submitBtn.textContent = 'Subir canción';

  } catch (err) {
    console.error(err);
    mostrarStatus('Error al guardar: ' + err.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Subir canción';
  }
});

// ================================================================
// MODAL REPRODUCTOR — VISTA PREVIA
// ================================================================
const previewAudio = new Audio();
previewAudio.preload = 'metadata';

function fmtTiempo(seg) {
  if (!isFinite(seg) || seg < 0) return '0:00';
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return m + ':' + String(s).padStart(2, '0');
}

function abrirPlayer(cancion) {
  if (!cancion) return;

  playerImg.src = cancion.imagenUrl || PLACEHOLDER;
  playerImg.onerror = () => { playerImg.onerror = null; playerImg.src = PLACEHOLDER; };

  playerTitle.textContent  = cancion.titulo  || 'Sin título';
  playerArtist.textContent = cancion.artista || 'Desconocido';

  playerSeek.value = 0;
  playerCurrent.textContent = '0:00';
  playerDuration.textContent = '0:00';
  playerPlay.textContent = '▶';

  previewAudio.pause();
  previewAudio.src = cancion.audioUrl || '';
  previewAudio.currentTime = 0;

  playerModal.classList.remove('hidden');
  playerModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function cerrarPlayer() {
  previewAudio.pause();
  previewAudio.currentTime = 0;
  previewAudio.src = '';
  if (playerModal) {
    playerModal.classList.add('hidden');
    playerModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  if (playerPlay) playerPlay.textContent = '▶';
}

// Abrir modal al hacer clic en un item del historial (excepto en el botón eliminar)
historyList.addEventListener('click', (e) => {
  if (e.target.closest('.btn-delete')) return;

  const item = e.target.closest('.history-item');
  if (!item) return;

  const id = item.dataset.id;
  const cancion = cancionesActuales.find(c => c.id === id);
  if (cancion) abrirPlayer(cancion);
});

// Cerrar (backdrop y botón ✕)
playerModal.addEventListener('click', (e) => {
  if (e.target.dataset.close === '1') cerrarPlayer();
});

// Cerrar con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !playerModal.classList.contains('hidden')) {
    cerrarPlayer();
  }
});

// Play / Pause
playerPlay.addEventListener('click', async () => {
  if (!previewAudio.src) return;
  try {
    if (previewAudio.paused) {
      await previewAudio.play();
      playerPlay.textContent = '⏸';
    } else {
      previewAudio.pause();
      playerPlay.textContent = '▶';
    }
  } catch (err) {
    console.warn('No se pudo reproducir:', err);
  }
});

// -10s / +10s
playerRewind.addEventListener('click', () => {
  previewAudio.currentTime = Math.max(0, previewAudio.currentTime - 10);
});
playerForward.addEventListener('click', () => {
  previewAudio.currentTime = Math.min(
    previewAudio.duration || 0,
    previewAudio.currentTime + 10
  );
});

// Barra de progreso
previewAudio.addEventListener('loadedmetadata', () => {
  playerDuration.textContent = fmtTiempo(previewAudio.duration);
});

previewAudio.addEventListener('timeupdate', () => {
  if (!previewAudio.duration) return;
  const pct = (previewAudio.currentTime / previewAudio.duration) * 1000;
  playerSeek.value = pct;
  playerCurrent.textContent = fmtTiempo(previewAudio.currentTime);
});

playerSeek.addEventListener('input', () => {
  if (!previewAudio.duration) return;
  previewAudio.currentTime = (playerSeek.value / 1000) * previewAudio.duration;
});

previewAudio.addEventListener('ended', () => {
  playerPlay.textContent = '▶';
  previewAudio.currentTime = 0;
  playerSeek.value = 0;
  playerCurrent.textContent = '0:00';
});

// Volumen
playerVol.addEventListener('input', () => {
  previewAudio.volume = parseFloat(playerVol.value);
});
previewAudio.volume = parseFloat(playerVol.value);

// Pausar al cambiar de pestaña
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !previewAudio.paused) {
    previewAudio.pause();
    playerPlay.textContent = '▶';
  }
});
