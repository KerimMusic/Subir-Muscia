import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc // <-- NUEVO: Importado para la edición
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

// ============================================================
// ✅ COMPATIBILIDAD CON WEBVIEW
// ============================================================
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn('[WebView] No se pudo establecer persistencia:', err);
});

function esWebView() {
  const ua = (navigator.userAgent || '').toLowerCase();
  const esAndroidWV = /android/.test(ua) && /(wv|version\/[\d.]+)/.test(ua);
  const esIOSWV = /iphone|ipad|ipod/.test(ua) && !/safari|crios|fxios|edgios/.test(ua);
  const tieneBridge = !!(window.Android || window.ReactNativeWebView || (window.webkit && window.webkit.messageHandlers));
  return esAndroidWV || esIOSWV || tieneBridge;
}

const LOGIN_BTN_HTML = `
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  Iniciar sesión con Google
`;

getRedirectResult(auth)
  .then(result => {
    if (result && result.user) {
      mostrarStatus('✅ Sesión iniciada correctamente', 'ok');
    }
  })
  .catch(err => {
    if (err && err.code && err.code !== 'auth/no-auth-event') {
      console.error('[Auth] getRedirectResult:', err);
      mostrarStatus('Error al iniciar sesión: ' + err.message, 'error');
    }
  });

// ============================================================
// FIN BLOQUE WEBVIEW
// ============================================================

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

// Menú hamburguesa
const menuWrap     = document.getElementById('menuWrap');
const menuBtn      = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const logoutBtn    = document.getElementById('logoutBtn');

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

// Modal editar (NUEVO)
const editModal    = document.getElementById('editModal');
const editForm     = document.getElementById('editForm');
const editImg      = document.getElementById('editImg');
const editArtista  = document.getElementById('editArtista');
const editTitulo   = document.getElementById('editTitulo');
const editAlbum    = document.getElementById('editAlbum');
const editAudio    = document.getElementById('editAudio');
const editImagen   = document.getElementById('editImagen');
const editSubmitBtn = document.getElementById('editSubmitBtn');

let usuarioActual = null;
let unsubscribeHistorial = null;
let cancionesActuales = [];
let editandoId = null; // ID de la canción que se está editando

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

    if (esWebView()) {
      await signInWithRedirect(auth, provider);
      return;
    }

    await signInWithPopup(auth, provider);

  } catch (e) {
    console.error('[Auth] Error login:', e);
    const necesitaFallback =
      e.code === 'auth/popup-blocked' ||
      e.code === 'auth/operation-not-supported-in-this-environment' ||
      e.code === 'auth/web-storage-unsupported';

    if (necesitaFallback) {
      try {
        await signInWithRedirect(auth, provider);
        return;
      } catch (e2) {
        console.error('[Auth] Fallback redirect falló:', e2);
        mostrarStatus('Error al iniciar sesión: ' + e2.message, 'error');
      }
    } else {
      mostrarStatus('Error al iniciar sesión: ' + e.message, 'error');
    }

    loginBtn.disabled = false;
    loginBtn.innerHTML = LOGIN_BTN_HTML;
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
    menuWrap.classList.remove('hidden');
    escucharHistorial(user.uid);
  } else {
    loginBtn.classList.remove('hidden');
    loginBtn.disabled = false;
    loginBtn.innerHTML = LOGIN_BTN_HTML;
    userBox.classList.add('hidden');
    form.classList.add('hidden');
    historySection.classList.add('hidden');
    menuWrap.classList.add('hidden');
    cerrarMenu();

    if (unsubscribeHistorial) {
      unsubscribeHistorial();
      unsubscribeHistorial = null;
    }
    historyList.innerHTML = '';
    historyCount.textContent = '0';
    historyEmpty.classList.add('hidden');
    cancionesActuales = [];
    cerrarPlayer();
    cerrarEditModal(); // Cerrar modal de edición si está abierto
  }
});

// ===================
// Vista previa dinámica (formulario)
// ===================
['artista', 'titulo', 'imagen', 'album'].forEach(id => {
  document.getElementById(id).addEventListener('input', actualizarPreview);
});

function actualizarPreview() {
  const artista = document.getElementById('artista').value.trim();
  const titulo  = document.getElementById('titulo').value.trim();
  const imagen  = document.getElementById('imagen').value.trim();
  const album   = document.getElementById('album').value.trim();

  if (!artista && !titulo && !imagen && !album) {
    preview.classList.remove('show');
    return;
  }

  preview.classList.add('show');
  previewTitulo.textContent  = titulo || '—';
  previewArtista.textContent = artista || '—';

  const albumSpan = document.querySelector('.preview-info .Album');
  if (albumSpan) {
    albumSpan.textContent = album || 'Reggeton 1';
  }

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
        <button type="button" class="btn-edit" data-id="${escapeHtml(c.id)}" title="Editar canción">
          ✏️
        </button>
        <button type="button" class="btn-delete" data-id="${escapeHtml(c.id)}" title="Eliminar canción">
          🗑️
        </button>
      </div>
    `;
  }).join('');
}

// Delegación de eventos para los botones de eliminar y editar
historyList.addEventListener('click', (e) => {
  // 1. Manejar botón eliminar
  const deleteBtn = e.target.closest('.btn-delete');
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    const item = deleteBtn.closest('.history-item');
    const titulo = item?.querySelector('.history-info strong')?.textContent || 'esta canción';
    eliminarCancion(id, deleteBtn, titulo);
    return;
  }

  // 2. Manejar botón editar (NUEVO)
  const editBtn = e.target.closest('.btn-edit');
  if (editBtn) {
    const id = editBtn.dataset.id;
    const cancion = cancionesActuales.find(c => c.id === id);
    if (cancion) abrirEditModal(cancion);
    return;
  }

  // 3. Manejar clic en el item para reproducir
  const item = e.target.closest('.history-item');
  if (!item) return;

  const id = item.dataset.id;
  const cancion = cancionesActuales.find(c => c.id === id);
  if (cancion) abrirPlayer(cancion);
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
  const album     = document.getElementById('album').value.trim();
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
      album:     album,
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

    const albumSpan = document.querySelector('.preview-info .Album');
    if (albumSpan) albumSpan.textContent = 'Reggeton 1';

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

playerModal.addEventListener('click', (e) => {
  if (e.target.dataset.close === '1') cerrarPlayer();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !playerModal.classList.contains('hidden')) {
    cerrarPlayer();
  }
});

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

playerRewind.addEventListener('click', () => {
  previewAudio.currentTime = Math.max(0, previewAudio.currentTime - 10);
});
playerForward.addEventListener('click', () => {
  previewAudio.currentTime = Math.min(
    previewAudio.duration || 0,
    previewAudio.currentTime + 10
  );
});

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

playerVol.addEventListener('input', () => {
  previewAudio.volume = parseFloat(playerVol.value);
});
previewAudio.volume = parseFloat(playerVol.value);

document.addEventListener('visibilitychange', () => {
  if (document.hidden && !previewAudio.paused) {
    previewAudio.pause();
    playerPlay.textContent = '▶';
  }
});

// ================================================================
// MODAL EDITAR — LÓGICA (NUEVO)
// ================================================================
function abrirEditModal(cancion) {
  if (!cancion) return;

  editandoId = cancion.id;

  // Rellenar campos
  editArtista.value = cancion.artista || '';
  editTitulo.value  = cancion.titulo  || '';
  editAlbum.value   = cancion.album   || '';
  
  // Convertir links directos de vuelta a links normales de Dropbox para editar
  const revertirDropbox = (url) => {
    if (!url) return '';
    return url.replace('dl.dropboxusercontent.com', 'www.dropbox.com');
  };

  editAudio.value   = revertirDropbox(cancion.audioUrl || '');
  editImagen.value  = revertirDropbox(cancion.imagenUrl || '');

  // Imagen de portada
  editImg.src = cancion.imagenUrl || PLACEHOLDER;
  editImg.onerror = () => { editImg.onerror = null; editImg.src = PLACEHOLDER; };

  // Mostrar modal
  editModal.classList.remove('hidden');
  editModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function cerrarEditModal() {
  editModal.classList.add('hidden');
  editModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  editandoId = null;
  editForm.reset();
}

// Cerrar modal con backdrop o botón ✕
editModal.addEventListener('click', (e) => {
  if (e.target.dataset.close === '1') cerrarEditModal();
});

// Cerrar con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !editModal.classList.contains('hidden')) {
    cerrarEditModal();
  }
});

// Guardar cambios
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!usuarioActual || !editandoId) {
    mostrarStatus('Error: No hay sesión o canción seleccionada', 'error');
    return;
  }

  const artista   = editArtista.value.trim();
  const titulo    = editTitulo.value.trim();
  const album     = editAlbum.value.trim();
  const audioRaw  = editAudio.value.trim();
  const imagenRaw = editImagen.value.trim();

  if (!artista || !titulo || !audioRaw) {
    mostrarStatus('Completa artista, título y audio', 'error');
    return;
  }

  const audioUrl  = dropboxDirecto(audioRaw);
  const imagenUrl = imagenRaw ? dropboxDirecto(imagenRaw) : '';

  editSubmitBtn.disabled = true;
  editSubmitBtn.innerHTML = '<span class="loader"></span>Guardando cambios...';

  try {
    const uid = usuarioActual.uid;
    const docRef = doc(db, 'historial_usuarios', uid, 'canciones', editandoId);

    await updateDoc(docRef, {
      artista:   artista,
      titulo:    titulo,
      album:     album,
      audioUrl:  audioUrl,
      imagenUrl: imagenUrl,
      fechaEdicion: serverTimestamp()
    });

    mostrarStatus('✅ Canción actualizada correctamente', 'ok');
    cerrarEditModal();

  } catch (err) {
    console.error('Error al editar:', err);
    mostrarStatus('Error al guardar cambios: ' + err.message, 'error');
  } finally {
    editSubmitBtn.disabled = false;
    editSubmitBtn.textContent = 'TEREMINAR';
  }
});

// Vista previa en vivo de la imagen al editar
editImagen.addEventListener('input', () => {
  const url = editImagen.value.trim();
  if (url) {
    editImg.src = dropboxDirecto(url);
    editImg.onerror = () => { editImg.src = PLACEHOLDER; };
  } else {
    editImg.src = PLACEHOLDER;
  }
});

// ================================================================
// MENÚ HAMBURGUESA + CERRAR SESIÓN
// ================================================================
function abrirMenu() {
  if (!menuDropdown || !menuBtn) return;
  menuDropdown.classList.remove('hidden');
  menuBtn.classList.add('open');
  menuBtn.setAttribute('aria-expanded', 'true');
}

function cerrarMenu() {
  if (!menuDropdown || !menuBtn) return;
  menuDropdown.classList.add('hidden');
  menuBtn.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}

menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (menuDropdown.classList.contains('hidden')) {
    abrirMenu();
  } else {
    cerrarMenu();
  }
});

document.addEventListener('click', (e) => {
  if (menuWrap.classList.contains('hidden')) return;
  if (!menuWrap.contains(e.target)) cerrarMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarMenu();
});

logoutBtn.addEventListener('click', async () => {
  try {
    logoutBtn.disabled = true;
    logoutBtn.textContent = 'Cerrando sesión...';

    await signOut(auth);

    cerrarMenu();
    mostrarStatus('👋 Sesión cerrada correctamente', 'ok');

  } catch (err) {
    console.error('Error al cerrar sesión:', err);
    mostrarStatus('Error al cerrar sesión: ' + err.message, 'error');
  } finally {
    logoutBtn.disabled = false;
    logoutBtn.innerHTML = '🚪 Cerrar sesión';
  }
});
