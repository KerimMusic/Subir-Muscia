import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, onAuthStateChanged, signOut,
  setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, serverTimestamp, onSnapshot,
  deleteDoc, doc, updateDoc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage, ref as storageRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

/* ============================================
   ✅ TU CONFIGURACIÓN REAL DE FIREBASE
   ============================================ */
const firebaseConfig = {
  apiKey: "AIzaSyDMabE70hIApcNU5RY3_WEEIF-BWUzO0K4",
  authDomain: "kerim-music-a9c46.firebaseapp.com",
  projectId: "kerim-music-a9c46",
  storageBucket: "kerim-music-a9c46.firebasestorage.app",
  messagingSenderId: "470731440209",
  appId: "1:470731440209:web:f6eba4784027a5d8c57870",
  measurementId: "G-LBHTKL8KDK"
};
/* ============================================ */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

/* ============================================================
   ✅ COMPATIBILIDAD CON WEBVIEW
   ============================================================ */
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

/* ============================================================
   ELEMENTOS DEL DOM
   ============================================================ */
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

const historySection = document.getElementById('historySection');
const historyList    = document.getElementById('historyList');
const historyCount   = document.getElementById('historyCount');
const historyEmpty   = document.getElementById('historyEmpty');

const menuWrap     = document.getElementById('menuWrap');
const menuBtn      = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const logoutBtn    = document.getElementById('logoutBtn');
const statsBtn     = document.getElementById('statsBtn');
const suscBtn      = document.getElementById('suscBtn');

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

const editModal    = document.getElementById('editModal');
const editForm     = document.getElementById('editForm');
const editImg      = document.getElementById('editImg');
const editArtista  = document.getElementById('editArtista');
const editTitulo   = document.getElementById('editTitulo');
const editAlbum    = document.getElementById('editAlbum');
const editAudio    = document.getElementById('editAudio');
const editImagen   = document.getElementById('editImagen');
const editSubmitBtn = document.getElementById('editSubmitBtn');

const statsModal          = document.getElementById('statsModal');
const statsList           = document.getElementById('statsList');
const statsEmpty          = document.getElementById('statsEmpty');
const statsTotalListeners = document.getElementById('statsTotalListeners');
const statsTotalEarnings  = document.getElementById('statsTotalEarnings');

const collabContainerForm = document.getElementById('collaboratorsContainer');
const collabContainerEdit = document.getElementById('collaboratorsEditContainer');
const addCollabBtnForm    = document.getElementById('addCollaboratorBtn');
const addCollabBtnEdit    = document.getElementById('addCollaboratorBtnEdit');

let usuarioActual = null;
let unsubscribeHistorial = null;
let unsubscribeOyentes   = null;
let cancionesActuales = [];
let editandoId = null;
let statsAbierto = false;
let statsOyentes = {};

const PLACEHOLDER = 'https://via.placeholder.com/64/333/666?text=%E2%99%AB';
const COLECCION_OYENTES = 'oyentes_canciones';
const PAGO_POR_OYENTE = 0.20;

/* ===================
   Utilidades
   =================== */
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
    .replace('?dl=0', '').replace('?dl=1', '')
    .replace('&dl=0', '').replace('&dl=1', '')
    .replace('?raw=1', '');
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function fmtNumero(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('es-MX');
}

function fmtDinero(n) {
  const v = Number(n) || 0;
  return '$' + v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MXN';
}

function normalizarTitulo(t) {
  return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

/* ==========================================================
   COLABORADORES
   ========================================================== */
function crearFilaColaborador(valor = '') {
  const row = document.createElement('div');
  row.className = 'collaborator-row';
  row.innerHTML = `
    <input type="text" class="collaborator-input" placeholder="Ej: Nombre del colaborador" value="${escapeHtml(valor)}">
    <button type="button" class="btn-remove-collab" title="Eliminar colaborador" aria-label="Eliminar colaborador">✕</button>
  `;
  row.querySelector('.btn-remove-collab').addEventListener('click', () => row.remove());
  return row;
}

function agregarColaboradorAlContenedor(contenedor) {
  if (!contenedor) return;
  contenedor.appendChild(crearFilaColaborador(''));
}

function obtenerColaboradoresDe(contenedor) {
  if (!contenedor) return [];
  return Array.from(contenedor.querySelectorAll('.collaborator-input'))
    .map(inp => inp.value.trim()).filter(v => v !== '');
}

function cargarColaboradoresEn(contenedor, colaboradores) {
  if (!contenedor) return;
  contenedor.innerHTML = '';
  const lista = Array.isArray(colaboradores) ? colaboradores.filter(Boolean) : [];
  if (lista.length === 0) contenedor.appendChild(crearFilaColaborador(''));
  else lista.forEach(nombre => contenedor.appendChild(crearFilaColaborador(nombre)));
}

addCollabBtnForm?.addEventListener('click', () => {
  agregarColaboradorAlContenedor(collabContainerForm);
  const inputs = collabContainerForm.querySelectorAll('.collaborator-input');
  inputs[inputs.length - 1]?.focus();
});

addCollabBtnEdit?.addEventListener('click', () => {
  agregarColaboradorAlContenedor(collabContainerEdit);
  const inputs = collabContainerEdit.querySelectorAll('.collaborator-input');
  inputs[inputs.length - 1]?.focus();
});

cargarColaboradoresEn(collabContainerForm, []);
cargarColaboradoresEn(collabContainerEdit, []);

/* ==========================================================
   OYENTES
   ========================================================== */
function extraerOyentes(data) {
  if (!data) return 0;
  const posibles = [data.oyentes, data.Oyentes, data.oyente, data.listeners,
    data.Listeners, data.listener, data.oyentes_totales, data.totalOyentes,
    data.total_oyentes, data.listenerCount, data.listener_count];
  for (const v of posibles) {
    if (v === undefined || v === null || v === '') continue;
    if (typeof v === 'object' && !Array.isArray(v)) return Object.keys(v).length;
    if (Array.isArray(v)) return v.length;
    const n = Number(v);
    if (!isNaN(n)) return n;
  }
  return 0;
}

function obtenerStatsDeCancion(cancion) {
  if (!cancion) return { oyentes: 0, docId: null };
  const candidatos = [cancion.titulo, cancion.title, cancion.nombre, cancion.id];
  for (const c of candidatos) {
    if (!c) continue;
    const key = normalizarTitulo(c);
    const s = statsOyentes[key];
    if (s) return s;
  }
  return { oyentes: 0, docId: null };
}

/* ===================
   Autenticación
   =================== */
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
    const necesitaFallback = e.code === 'auth/popup-blocked' ||
      e.code === 'auth/operation-not-supported-in-this-environment' ||
      e.code === 'auth/web-storage-unsupported';
    if (necesitaFallback) {
      try { await signInWithRedirect(auth, provider); return; }
      catch (e2) {
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
    escucharOyentesCanciones();

    // ═══ INICIAR SUSCRIPCIONES ═══
    iniciarSuscripciones(user);
  } else {
    loginBtn.classList.remove('hidden');
    loginBtn.disabled = false;
    loginBtn.innerHTML = LOGIN_BTN_HTML;
    userBox.classList.add('hidden');
    form.classList.add('hidden');
    historySection.classList.add('hidden');
    menuWrap.classList.add('hidden');
    cerrarMenu();

    if (unsubscribeHistorial) { unsubscribeHistorial(); unsubscribeHistorial = null; }
    if (unsubscribeOyentes) { unsubscribeOyentes(); unsubscribeOyentes = null; }

    historyList.innerHTML = '';
    historyCount.textContent = '0';
    historyEmpty.classList.add('hidden');
    cancionesActuales = [];
    statsOyentes = {};
    cerrarPlayer();
    cerrarEditModal();
    cerrarStatsModal();

    // ═══ DETENER SUSCRIPCIONES ═══
    detenerSuscripciones();
  }
});

/* ===================
   Vista previa dinámica
   =================== */
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
  if (albumSpan) albumSpan.textContent = album || 'Reggeton 1';
  if (imagen) {
    previewImg.src = dropboxDirecto(imagen);
    previewImg.onerror = () => { previewImg.src = PLACEHOLDER; };
  } else {
    previewImg.src = PLACEHOLDER;
  }
}

/* ===================
   HISTORIAL
   =================== */
function escucharHistorial(uid) {
  if (unsubscribeHistorial) unsubscribeHistorial();
  historyList.innerHTML = '<p class="history-empty">Cargando canciones...</p>';
  historyEmpty.classList.add('hidden');
  const ref = collection(db, 'historial_usuarios', uid, 'canciones');
  unsubscribeHistorial = onSnapshot(ref, (snap) => {
    const canciones = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    canciones.sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0));
    renderHistorial(canciones);
    if (statsAbierto) renderStats(canciones);
  }, (err) => {
    console.error('Error historial:', err);
    historyList.innerHTML = '';
    mostrarStatus('Error al cargar el historial: ' + err.message, 'error');
  });
}

function escucharOyentesCanciones() {
  if (unsubscribeOyentes) unsubscribeOyentes();
  const ref = collection(db, COLECCION_OYENTES);
  unsubscribeOyentes = onSnapshot(ref, (snap) => {
    const mapa = {};
    snap.docs.forEach(d => {
      const data = d.data() || {};
      const oyentes = extraerOyentes(data);
      const stats = { docId: d.id, oyentes };
      const candidatos = [d.id, data.titulo, data.title, data.nombre, data.cancion, data.song];
      candidatos.forEach(c => {
        if (!c) return;
        const key = normalizarTitulo(c);
        if (key && !mapa[key]) mapa[key] = stats;
      });
    });
    statsOyentes = mapa;
    if (statsAbierto) renderStats(cancionesActuales);
  }, (err) => { console.error('Error al escuchar oyentes_canciones:', err); });
}

async function asegurarRegistroOyentes(titulo) {
  if (!titulo) return;
  const key = normalizarTitulo(titulo);
  if (statsOyentes[key]) return;
  try {
    const docRef = doc(db, COLECCION_OYENTES, titulo);
    const snap = await getDoc(docRef);
    if (snap.exists()) return;
    await setDoc(docRef, { oyentes: 0 });
  } catch (e) { console.warn('No se pudo asegurar registro en oyentes_canciones:', e); }
}

async function sincronizarOyentesAlEditar(tituloAntiguo, tituloNuevo) {
  if (!tituloNuevo) return;
  const keyAntiguo = normalizarTitulo(tituloAntiguo);
  const keyNuevo   = normalizarTitulo(tituloNuevo);
  if (keyAntiguo === keyNuevo) { await asegurarRegistroOyentes(tituloNuevo); return; }
  try {
    const statsAntiguas = statsOyentes[keyAntiguo];
    const docIdAntiguo  = statsAntiguas?.docId || tituloAntiguo;
    let contenidoAntiguo = null;
    if (docIdAntiguo) {
      const snapAntiguo = await getDoc(doc(db, COLECCION_OYENTES, docIdAntiguo));
      if (snapAntiguo.exists()) contenidoAntiguo = snapAntiguo.data();
    }
    const snapNuevo   = await getDoc(doc(db, COLECCION_OYENTES, tituloNuevo));
    const existeNuevo = snapNuevo.exists();
    if (contenidoAntiguo) {
      if (existeNuevo) {
        const datosNuevos = snapNuevo.data() || {};
        const oyentesAntiguos = contenidoAntiguo.oyentes || {};
        const oyentesNuevos   = datosNuevos.oyentes     || {};
        let oyentesFinales;
        const ambosSonMapas = oyentesAntiguos && typeof oyentesAntiguos === 'object' && !Array.isArray(oyentesAntiguos) &&
                              oyentesNuevos   && typeof oyentesNuevos   === 'object' && !Array.isArray(oyentesNuevos);
        if (ambosSonMapas) oyentesFinales = { ...oyentesAntiguos, ...oyentesNuevos };
        else if (Array.isArray(oyentesAntiguos) && Array.isArray(oyentesNuevos))
          oyentesFinales = Array.from(new Set([...oyentesAntiguos, ...oyentesNuevos]));
        else oyentesFinales = oyentesNuevos || oyentesAntiguos || {};
        await setDoc(doc(db, COLECCION_OYENTES, tituloNuevo), { ...datosNuevos, oyentes: oyentesFinales });
      } else {
        await setDoc(doc(db, COLECCION_OYENTES, tituloNuevo), contenidoAntiguo);
      }
    } else if (!existeNuevo) {
      await setDoc(doc(db, COLECCION_OYENTES, tituloNuevo), { oyentes: {} });
    }
    if (docIdAntiguo && docIdAntiguo !== tituloNuevo) {
      await deleteDoc(doc(db, COLECCION_OYENTES, docIdAntiguo));
    }
  } catch (e) { console.warn('No se pudo sincronizar oyentes_canciones al editar:', e); }
}

async function eliminarRegistroOyentes(cancion) {
  if (!cancion || !cancion.titulo) return;
  const stats = obtenerStatsDeCancion(cancion);
  const docId = stats.docId || cancion.titulo;
  try { await deleteDoc(doc(db, COLECCION_OYENTES, docId)); }
  catch (e) { console.warn('No se pudo eliminar de oyentes_canciones:', e); }
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
        <img src="${img}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
        <div class="history-info">
          <strong title="${titulo}">${titulo}</strong>
          <small title="${artista}">${artista}</small>
        </div>
        <button type="button" class="btn-edit" data-id="${escapeHtml(c.id)}" title="Editar canción">✏️</button>
        <button type="button" class="btn-delete" data-id="${escapeHtml(c.id)}" title="Eliminar canción">🗑️</button>
      </div>
    `;
  }).join('');
}

historyList.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.btn-delete');
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    const item = deleteBtn.closest('.history-item');
    const titulo = item?.querySelector('.history-info strong')?.textContent || 'esta canción';
    const cancion = cancionesActuales.find(c => c.id === id);
    eliminarCancion(id, deleteBtn, titulo, cancion);
    return;
  }
  const editBtn = e.target.closest('.btn-edit');
  if (editBtn) {
    const id = editBtn.dataset.id;
    const cancion = cancionesActuales.find(c => c.id === id);
    if (cancion) abrirEditModal(cancion);
    return;
  }
  const item = e.target.closest('.history-item');
  if (!item) return;
  const id = item.dataset.id;
  const cancion = cancionesActuales.find(c => c.id === id);
  if (cancion) abrirPlayer(cancion);
});

async function eliminarCancion(id, boton, titulo, cancion) {
  if (!usuarioActual) { mostrarStatus('Debes iniciar sesión primero', 'error'); return; }
  const confirmado = confirm(`¿Seguro que quieres eliminar "${titulo}"?\nEsta acción no se puede deshacer.`);
  if (!confirmado) return;
  try {
    boton.disabled = true;
    boton.textContent = '⏳';
    await deleteDoc(doc(db, 'historial_usuarios', usuarioActual.uid, 'canciones', id));
    if (cancion) await eliminarRegistroOyentes(cancion);
    else {
      try { await deleteDoc(doc(db, COLECCION_OYENTES, titulo)); }
      catch (e) { console.warn('Fallback eliminar oyentes_canciones:', e); }
    }
    mostrarStatus('🗑️ Canción eliminada correctamente', 'ok');
  } catch (err) {
    console.error('Error al eliminar:', err);
    mostrarStatus('Error al eliminar: ' + err.message, 'error');
    boton.disabled = false;
    boton.textContent = '🗑️';
  }
}

/* ===================
   Guardar canción
   =================== */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!usuarioActual) { mostrarStatus('Debes iniciar sesión primero', 'error'); return; }

  const artista   = document.getElementById('artista').value.trim();
  const titulo    = document.getElementById('titulo').value.trim();
  const album     = document.getElementById('album').value.trim();
  const genero    = (document.getElementById('genero')?.value || '').trim();
  const subgenero = (document.getElementById('subgenero')?.value || '').trim();
  const audioRaw  = document.getElementById('audio').value.trim();
  const imagenRaw = document.getElementById('imagen').value.trim();
  const colaboradores = obtenerColaboradoresDe(collabContainerForm);

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
  } catch (err) { console.warn('Validación de audio:', err); }

  try {
    submitBtn.innerHTML = '<span class="loader"></span>Guardando...';
    mostrarStatus('Guardando en la base de datos...', 'loading');
    const uid = usuarioActual.uid;
    await addDoc(collection(db, 'historial_usuarios', uid, 'canciones'), {
      artista, titulo, album, genero, subgenero, colaboradores,
      audioUrl, imagenUrl, origen: 'dropbox',
      uid, email: usuarioActual.email, fecha: serverTimestamp()
    });
    await asegurarRegistroOyentes(titulo);
    mostrarStatus('✅ Canción subida correctamente', 'ok');
    form.reset();
    preview.classList.remove('show');
    cargarColaboradoresEn(collabContainerForm, []);
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

/* ================================================================
   MODAL REPRODUCTOR
   ================================================================ */
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
  if (e.key === 'Escape' && !playerModal.classList.contains('hidden')) cerrarPlayer();
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
  } catch (err) { console.warn('No se pudo reproducir:', err); }
});

playerRewind.addEventListener('click', () => {
  previewAudio.currentTime = Math.max(0, previewAudio.currentTime - 10);
});
playerForward.addEventListener('click', () => {
  previewAudio.currentTime = Math.min(previewAudio.duration || 0, previewAudio.currentTime + 10);
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

/* ================================================================
   MODAL EDITAR
   ================================================================ */
function abrirEditModal(cancion) {
  if (!cancion) return;
  editandoId = cancion.id;
  editArtista.value = cancion.artista || '';
  editTitulo.value  = cancion.titulo  || '';
  editAlbum.value   = cancion.album   || '';
  const revertirDropbox = (url) => url ? url.replace('dl.dropboxusercontent.com', 'www.dropbox.com') : '';
  editAudio.value   = revertirDropbox(cancion.audioUrl || '');
  editImagen.value  = revertirDropbox(cancion.imagenUrl || '');
  cargarColaboradoresEn(collabContainerEdit, cancion.colaboradores || []);
  editImg.src = cancion.imagenUrl || PLACEHOLDER;
  editImg.onerror = () => { editImg.onerror = null; editImg.src = PLACEHOLDER; };
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
  cargarColaboradoresEn(collabContainerEdit, []);
}

editModal.addEventListener('click', (e) => {
  if (e.target.dataset.close === '1') cerrarEditModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !editModal.classList.contains('hidden')) cerrarEditModal();
});

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
  const colaboradores = obtenerColaboradoresDe(collabContainerEdit);
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
    const cancionAntigua = cancionesActuales.find(c => c.id === editandoId);
    const tituloAntiguo  = cancionAntigua?.titulo || '';
    const docRef = doc(db, 'historial_usuarios', uid, 'canciones', editandoId);
    await updateDoc(docRef, {
      artista, titulo, album, colaboradores, audioUrl, imagenUrl,
      fechaEdicion: serverTimestamp()
    });
    await sincronizarOyentesAlEditar(tituloAntiguo, titulo);
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

editImagen.addEventListener('input', () => {
  const url = editImagen.value.trim();
  if (url) {
    editImg.src = dropboxDirecto(url);
    editImg.onerror = () => { editImg.src = PLACEHOLDER; };
  } else {
    editImg.src = PLACEHOLDER;
  }
});

/* ================================================================
   MODAL ESTADÍSTICAS
   ================================================================ */
function renderStats(canciones) {
  const lista = canciones || cancionesActuales || [];
  if (!lista.length) {
    statsList.innerHTML = '';
    statsEmpty.classList.remove('hidden');
    statsTotalListeners.textContent = '0';
    statsTotalEarnings.textContent  = fmtDinero(0);
    return;
  }
  statsEmpty.classList.add('hidden');
  let totalOyentes = 0;
  statsList.innerHTML = lista.map(c => {
    const img     = c.imagenUrl ? escapeHtml(c.imagenUrl) : PLACEHOLDER;
    const titulo  = escapeHtml(c.titulo  || 'Sin título');
    const artista = escapeHtml(c.artista || 'Desconocido');
    const stats     = obtenerStatsDeCancion(c);
    const listeners = stats.oyentes || 0;
    const ganancia  = listeners * PAGO_POR_OYENTE;
    totalOyentes += listeners;
    return `
      <div class="stats-item">
        <img src="${img}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
        <div class="stats-item-info">
          <span class="stats-item-title" title="${titulo}">${titulo}</span>
          <span class="stats-item-artist" title="${artista}">${artista}</span>
        </div>
        <div class="stats-item-grid">
          <div class="stats-cell">
            <span class="stats-cell-label">👥 Oyentes</span>
            <span class="stats-cell-value">${fmtNumero(listeners)}</span>
          </div>
          <div class="stats-cell earn">
            <span class="stats-cell-label">💰 Ganancias</span>
            <span class="stats-cell-value">${fmtDinero(ganancia)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  const totalGanancias = totalOyentes * PAGO_POR_OYENTE;
  statsTotalListeners.textContent = fmtNumero(totalOyentes);
  statsTotalEarnings.textContent  = fmtDinero(totalGanancias);
}

function abrirStatsModal() {
  statsAbierto = true;
  renderStats(cancionesActuales);
  statsModal.classList.remove('hidden');
  statsModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function cerrarStatsModal() {
  statsAbierto = false;
  if (!statsModal) return;
  statsModal.classList.add('hidden');
  statsModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

statsModal.addEventListener('click', (e) => {
  if (e.target.dataset.close === '1') cerrarStatsModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !statsModal.classList.contains('hidden')) cerrarStatsModal();
});

statsBtn.addEventListener('click', () => {
  cerrarMenu();
  setTimeout(abrirStatsModal, 120);
});

/* ================================================================
   MENÚ HAMBURGUESA
   ================================================================ */
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
  if (menuDropdown.classList.contains('hidden')) abrirMenu();
  else cerrarMenu();
});

document.addEventListener('click', (e) => {
  if (menuWrap.classList.contains('hidden')) return;
  if (!menuWrap.contains(e.target)) cerrarMenu();
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarMenu(); });

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

/* ================================================================
   SELECTOR DE GÉNERO
   ================================================================ */
const GENEROS_RAW = [
  "Regional Mexicano","Reggaetón","Pop","Rock","Hip-Hop / Rap","Música Latina","Cumbia",
  "Electrónica","R&B / Soul","Indie / Alternativo","Metal","Punk","Reggae","Afrobeat",
  "Country","Folk","Jazz","Blues","K-Pop","J-Pop","Cristiana / Gospel","Clásica","Flamenco",
  "Acústica","Instrumental","Soundtrack","Otros",
  "Art Pop","Dance Pop","Electropop","Synth-pop","Indie Pop","Dream Pop","Bedroom Pop",
  "Hyperpop","Teen Pop","Bubblegum Pop","Power Pop","C-Pop","Latin Pop","Europop","Britpop",
  "Sophisti-Pop","Baroque Pop","Sunshine Pop","Chamber Pop","Experimental Pop",
  "Alternative Rock","Indie Rock","Hard Rock","Soft Rock","Classic Rock","Progressive Rock",
  "Psychedelic Rock","Garage Rock","Blues Rock","Folk Rock","Southern Rock","Surf Rock",
  "Glam Rock","Art Rock","Experimental Rock","Post-Rock","Math Rock","Noise Rock","Space Rock",
  "Gothic Rock","Industrial Rock","Christian Rock","Grunge","Brit Rock","Emo","Shoegaze","Dream Rock",
  "Heavy Metal","Thrash Metal","Death Metal","Black Metal","Doom Metal","Power Metal","Speed Metal",
  "Progressive Metal","Symphonic Metal","Folk Metal","Groove Metal","Nu Metal","Alternative Metal",
  "Industrial Metal","Gothic Metal","Metalcore","Deathcore","Grindcore","Sludge Metal","Stoner Metal",
  "Funeral Doom","Melodic Death Metal","Technical Death Metal","Viking Metal","Pagan Metal","Post-Metal","Djent",
  "Punk Rock","Hardcore Punk","Post-Punk","Pop Punk","Skate Punk","Street Punk","Anarcho-Punk","Crust Punk",
  "D-Beat","Garage Punk","Riot Grrrl","Emo Punk","Ska Punk","Celtic Punk","Folk Punk","Horror Punk","Psychobilly",
  "Hip-Hop","Rap","Trap","Drill","Gangsta Rap","Boom Bap","Conscious Hip-Hop","Underground Hip-Hop",
  "Alternative Hip-Hop","Old School Hip-Hop","West Coast Hip-Hop","East Coast Hip-Hop","Southern Hip-Hop",
  "Crunk","Dirty South","G-Funk","Cloud Rap","Emo Rap","Jazz Rap","Experimental Hip-Hop","Hardcore Hip-Hop",
  "Latin Hip-Hop","Chicano Rap","UK Hip-Hop","UK Drill","Grime","Freestyle Rap","Trap Latino",
  "R&B","Contemporary R&B","Alternative R&B","Neo Soul","Soul","Classic Soul","Southern Soul","Motown",
  "Funk","P-Funk","Quiet Storm","New Jack Swing","Blue-Eyed Soul","Psychedelic Soul","Gospel Soul","Soul Jazz",
  "Blues","Delta Blues","Chicago Blues","Texas Blues","Electric Blues","Acoustic Blues","Country Blues",
  "Piedmont Blues","British Blues","Jump Blues","Swamp Blues","Gospel Blues","Soul Blues",
  "Jazz","Bebop","Hard Bop","Cool Jazz","Free Jazz","Fusion","Jazz Fusion","Smooth Jazz","Acid Jazz",
  "Latin Jazz","Afro-Cuban Jazz","Gypsy Jazz","Swing","Big Band","Dixieland","Ragtime","Modal Jazz",
  "Avant-Garde Jazz","Jazz Funk","Nu Jazz","Vocal Jazz","Contemporary Jazz",
  "Electronic","EDM","House","Deep House","Tech House","Progressive House","Electro House","Future House",
  "Tropical House","Bass House","Acid House","Chicago House","French House","Minimal House","Techno",
  "Detroit Techno","Minimal Techno","Industrial Techno","Hard Techno","Acid Techno","Trance",
  "Progressive Trance","Psytrance","Goa Trance","Uplifting Trance","Hard Trance","Electro","Ambient",
  "Dark Ambient","Chillout","Downtempo","IDM","Breakbeat","Drum & Bass","Jungle","Liquid Drum & Bass",
  "Dubstep","Brostep","UK Garage","Future Bass","Synthwave","Vaporwave","Retrowave","Lo-Fi","Chillwave",
  "Glitch","Industrial","EBM","Hardcore","Gabber","Hardstyle","Future Rave",
  "Reggae","Roots Reggae","Dancehall","Dub","Rocksteady","Ska","Lovers Rock","Ragga","Reggae Fusion",
  "Digital Reggae","Dub Poetry",
  "Música Latina","Latin Urban","Salsa","Salsa Romántica","Salsa Dura","Son Cubano","Bachata","Merengue",
  "Cumbia","Cumbia Mexicana","Cumbia Colombiana","Cumbia Villera","Cumbia Peruana","Cumbia Andina",
  "Vallenato","Bolero","Mambo","Cha-cha-chá","Rumba","Guaracha","Danzón","Timba","Latin Rock","Latin Soul",
  "Tango","Milonga","Bossa Nova","Samba","MPB","Forró","Axé","Frevo","Sertanejo",
  "Mariachi","Ranchera","Norteño","Norteño-Banda","Banda","Banda Sinaloense","Corridos",
  "Corrido Tradicional","Corrido Tumbado","Corrido Bélico","Corridos Alterados","Tejano","Grupero",
  "Duranguense","Sierreño","Huapango","Son Jarocho","Son Huasteco","Música de Tierra Caliente",
  "Música Norteña","Cumbia Norteña","Bolero Ranchero","Mariachi Moderno",
  "Country","Country Pop","Country Rock","Traditional Country","Outlaw Country","Alternative Country",
  "Bluegrass","Americana","Honky Tonk","Country Blues","Western Swing","Nashville Sound","Red Dirt",
  "Contemporary Country","Country Folk",
  "Folk","Contemporary Folk","Traditional Folk","Celtic Folk","Irish Folk","Scottish Folk","English Folk",
  "American Folk","Appalachian","Nordic Folk","Balkan Folk","Slavic Folk","Gypsy / Romani","Klezmer",
  "Neofolk","World Folk","Folk Fusion",
  "Música Clásica","Medieval","Renacimiento","Barroco","Clasicismo","Romanticismo","Impresionismo",
  "Modernismo","Música Contemporánea","Música de Cámara","Sinfónica","Coral","Ópera","Opereta","Oratorio",
  "Cantata","Concierto","Sonata","Sinfonía","Música Minimalista","Música Experimental",
  "Gospel","Christian","Christian Pop","Christian Hip-Hop","Christian Metal","Worship",
  "Contemporary Christian","Spiritual","Hymns","Islamic Music","Nasheed","Jewish Music","Buddhist Music",
  "Hindu Devotional","Mantra",
  "Afrobeat","Afrobeats","Afro-Pop","Amapiano","Highlife","Hiplife","Kizomba","Kuduro","Kwaito","Gqom",
  "Mbalax","Juju","Fuji","Makossa","Soukous","Congolese Rumba","Benga","Bikutsi","Chimurenga","Jit",
  "Marrabenta","Mbube","Marabi","Township Jazz","Rai","Gnawa","Desert Blues","Maloya","Sega","Cape Jazz",
  "Calypso","Soca","Zouk","Kompa","Son","Mento","Steelpan","Bouyon","Punta",
  "Pagode","Choro","Tropicália","Maracatu","Baião","Carimbó","Lambada","Música Caipira","Samba-Reggae",
  "Funk Carioca",
  "K-Rock","K-Hip-Hop","J-Rock","J-Hip-Hop","City Pop","Enka","Shibuya-kei","Mandopop","Cantopop",
  "Bollywood","Bhangra","Qawwali","Ghazal","Carnatic","Hindustani Classical","Raga","Dhrupad","Gamelan",
  "Dangdut","Thai Pop","V-Pop","Pinoy Pop","Persian Pop","Arabic Pop","Turkish Pop",
  "Arabic Music","Shaabi","Dabke","Khaleeji","Egyptian Pop","Lebanese Pop","Iraqi Music","Persian Music",
  "Turkish Music","Kurdish Music","Armenian Music","Israeli Music","Mizrahi","Andalusian Music",
  "Oud Music","Traditional Middle Eastern",
  "Hawaiian","Hawaiian Pop","Polynesian","Samoan","Tahitian","Tongan","Maori","Aboriginal Australian",
  "Melanesian","Micronesian","Pacific Island Music","New Zealand Folk",
  "Experimental","Avant-Garde","Noise","Drone","Musique Concrète","Electroacoustic","Minimalism",
  "Sound Art","Free Improvisation","Experimental Electronic",
  "Film Score","Soundtrack","Movie Soundtrack","Television Score","Video Game Music","Anime Music",
  "Orchestral Score","Cinematic","Trailer Music","Ambient Score","Musical Theatre","Broadway","Stage & Screen",
  "A Cappella","Vocal Pop","Choral","Choir","Barbershop","Doo-Wop","Beatboxing","Gregorian Chant",
  "Operatic","Vocal Classical",
  "Children's Music","Nursery Rhymes","Educational Music","Comedy Music","Novelty","Parody","Comedy Rock",
  "Comedy Rap","Comedy Pop",
  "Dance","Dance-Pop","Eurodance","Eurobeat","Disco","Nu-Disco","Garage","Jersey Club","Baltimore Club",
  "Footwork","Juke",
  "Acústica","Acústica Pop","Rock Acústico","Folk Acústico","Latino Acústico","Indie Acústico",
  "Regional Mexicano Acústico","Acústica Instrumental","Unplugged","Balada Acústica","Bolero Acústico"
];

const GENEROS = [...new Set(GENEROS_RAW.map(g => g.trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

const SUBGENEROS_RAW = [
  "Corridos","Corridos Tumbados","Corridos Bélicos","Corridos Tradicionales","Banda",
  "Banda Sinaloense","Norteño","Norteño-Banda","Sierreño","Sad Sierreño","Grupero","Mariachi",
  "Ranchera","Huapango","Duranguense","Tejano","Cumbia Norteña"
];

const SUBGENEROS = [...new Set(SUBGENEROS_RAW.map(g => g.trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

const generoHidden  = document.getElementById('genero');
const genreSelect   = document.getElementById('genreSelect');
const genreToggle   = document.getElementById('genreToggle');
const genrePanel    = document.getElementById('genrePanel');
const genreList     = document.getElementById('genreList');
const genreSearch   = document.getElementById('genreSearch');
const genreValue    = document.getElementById('genreValue');
const genreEmpty    = document.getElementById('genreEmpty');

const subgenreGroup  = document.getElementById('subgenreGroup');
const subgeneroHidden = document.getElementById('subgenero');
const subgenreSelect = document.getElementById('subgenreSelect');
const subgenreToggle = document.getElementById('subgenreToggle');
const subgenrePanel  = document.getElementById('subgenrePanel');
const subgenreList   = document.getElementById('subgenreList');
const subgenreSearch = document.getElementById('subgenreSearch');
const subgenreValue  = document.getElementById('subgenreValue');
const subgenreEmpty  = document.getElementById('subgenreEmpty');

let generoSeleccionado = '';
let subgeneroSeleccionado = '';

const normalizarTexto = (s = '') =>
  String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function pintarGeneros(filtro = '') {
  const q = normalizarTexto(filtro);
  const lista = q ? GENEROS.filter(g => normalizarTexto(g).includes(q)) : GENEROS;
  if (!lista.length) {
    genreList.innerHTML = '';
    genreEmpty.classList.remove('hidden');
    return;
  }
  genreEmpty.classList.add('hidden');
  genreList.innerHTML = lista.map(g => {
    const sel = g === generoSeleccionado;
    return `<button type="button" class="genre-item${sel ? ' selected' : ''}" role="option" aria-selected="${sel}" data-genero="${escapeHtml(g)}">
      <span>${escapeHtml(g)}</span><span class="check">✓</span></button>`;
  }).join('');
}

function abrirGeneros() {
  genrePanel.classList.remove('hidden');
  genreToggle.setAttribute('aria-expanded', 'true');
  genreSearch.value = '';
  pintarGeneros('');
  setTimeout(() => { try { genreSearch.focus(); } catch (e) {} }, 30);
}

function cerrarGeneros() {
  genrePanel.classList.add('hidden');
  genreToggle.setAttribute('aria-expanded', 'false');
}

function seleccionarGenero(valor) {
  generoSeleccionado = valor || '';
  generoHidden.value = generoSeleccionado;
  genreValue.textContent = generoSeleccionado || 'Selecciona un género';
  genreValue.classList.toggle('placeholder', !generoSeleccionado);
  cerrarGeneros();
  if (generoSeleccionado === 'Regional Mexicano') {
    if (subgenreGroup) subgenreGroup.classList.remove('hidden');
  } else {
    if (subgenreGroup) subgenreGroup.classList.add('hidden');
    subgeneroSeleccionado = '';
    if (subgeneroHidden) subgeneroHidden.value = '';
    if (subgenreValue) {
      subgenreValue.textContent = 'Selecciona un subgénero';
      subgenreValue.classList.add('placeholder');
    }
    if (typeof cerrarSubgeneros === 'function') cerrarSubgeneros();
  }
}

function pintarSubgeneros(filtro = '') {
  const q = normalizarTexto(filtro);
  const lista = q ? SUBGENEROS.filter(g => normalizarTexto(g).includes(q)) : SUBGENEROS;
  if (!lista.length) {
    subgenreList.innerHTML = '';
    subgenreEmpty.classList.remove('hidden');
    return;
  }
  subgenreEmpty.classList.add('hidden');
  subgenreList.innerHTML = lista.map(g => {
    const sel = g === subgeneroSeleccionado;
    return `<button type="button" class="genre-item${sel ? ' selected' : ''}" role="option" aria-selected="${sel}" data-subgenero="${escapeHtml(g)}">
      <span>${escapeHtml(g)}</span><span class="check">✓</span></button>`;
  }).join('');
}

function abrirSubgeneros() {
  subgenrePanel.classList.remove('hidden');
  subgenreToggle.setAttribute('aria-expanded', 'true');
  subgenreSearch.value = '';
  pintarSubgeneros('');
  setTimeout(() => { try { subgenreSearch.focus(); } catch (e) {} }, 30);
}

function cerrarSubgeneros() {
  if (!subgenrePanel) return;
  subgenrePanel.classList.add('hidden');
  if (subgenreToggle) subgenreToggle.setAttribute('aria-expanded', 'false');
}

function seleccionarSubgenero(valor) {
  subgeneroSeleccionado = valor || '';
  if (subgeneroHidden) subgeneroHidden.value = subgeneroSeleccionado;
  if (subgenreValue) {
    subgenreValue.textContent = subgeneroSeleccionado || 'Selecciona un subgénero';
    subgenreValue.classList.toggle('placeholder', !subgeneroSeleccionado);
  }
  cerrarSubgeneros();
}

genreToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (genrePanel.classList.contains('hidden')) abrirGeneros();
  else cerrarGeneros();
});
genreSearch.addEventListener('input', () => pintarGeneros(genreSearch.value));
genreSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const primero = genreList.querySelector('.genre-item');
    if (primero) seleccionarGenero(primero.dataset.genero);
  }
  if (e.key === 'Escape') cerrarGeneros();
});
genreList.addEventListener('click', (e) => {
  const btn = e.target.closest('.genre-item');
  if (!btn) return;
  seleccionarGenero(btn.dataset.genero);
});
document.addEventListener('click', (e) => {
  if (genrePanel.classList.contains('hidden')) return;
  if (genreSelect && !genreSelect.contains(e.target)) cerrarGeneros();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !genrePanel.classList.contains('hidden')) cerrarGeneros();
});

subgenreToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (subgenrePanel.classList.contains('hidden')) abrirSubgeneros();
  else cerrarSubgeneros();
});
subgenreSearch.addEventListener('input', () => pintarSubgeneros(subgenreSearch.value));
subgenreSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const primero = subgenreList.querySelector('.genre-item');
    if (primero) seleccionarSubgenero(primero.dataset.subgenero);
  }
  if (e.key === 'Escape') cerrarSubgeneros();
});
subgenreList.addEventListener('click', (e) => {
  const btn = e.target.closest('.genre-item');
  if (!btn) return;
  seleccionarSubgenero(btn.dataset.subgenero);
});
document.addEventListener('click', (e) => {
  if (subgenrePanel.classList.contains('hidden')) return;
  if (subgenreSelect && !subgenreSelect.contains(e.target)) cerrarSubgeneros();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !subgenrePanel.classList.contains('hidden')) cerrarSubgeneros();
});

document.getElementById('formCancion').addEventListener('reset', () => {
  generoSeleccionado = '';
  generoHidden.value = '';
  genreValue.textContent = 'Selecciona un género';
  genreValue.classList.add('placeholder');
  cerrarGeneros();
  subgeneroSeleccionado = '';
  if (subgeneroHidden) subgeneroHidden.value = '';
  if (subgenreValue) {
    subgenreValue.textContent = 'Selecciona un subgénero';
    subgenreValue.classList.add('placeholder');
  }
  if (subgenreGroup) subgenreGroup.classList.add('hidden');
  cerrarSubgeneros();
  cargarColaboradoresEn(collabContainerForm, []);
});

pintarGeneros('');
pintarSubgeneros('');


/* ═══════════════════════════════════════════════════════════════
   SISTEMA DE SUSCRIPCIONES (INTEGRADO)
   ═══════════════════════════════════════════════════════════════ */

let suscripcion = null;
let esAdminSusc = false;
let configPagos = null;
let planSeleccionado = null;
let unsubscribeSusc = null;

const aFechaSusc = (ts) => ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
const fmtSusc = (f) => f ? f.toLocaleDateString("es-MX", { day:"2-digit", month:"2-digit", year:"numeric" }) : "—";
const abrirModalSusc  = (id) => document.getElementById(id)?.classList.add("abierto");
const cerrarModalSusc = (id) => document.getElementById(id)?.classList.remove("abierto");

window.tieneAccesoVigente = function() {
  if (!usuarioActual || !suscripcion) return false;
  if (suscripcion.estado !== "activa") return false;
  const venc = aFechaSusc(suscripcion.fechaVencimiento);
  if (!venc) return false;
  return new Date() < venc;
};

window.requiereSuscripcion = function(fn) {
  return async (...args) => {
    if (!window.tieneAccesoVigente()) { abrirModalSusc("modal-planes"); return; }
    return fn(...args);
  };
};

async function iniciarSuscripciones(user) {
  try {
    const snap = await getDoc(doc(db, "config", "pagos"));
    configPagos = snap.exists() ? snap.data() : {
      banco:"—", titular:"—", clabe:"—", cuenta:"—",
      instrucciones:"Realiza tu transferencia y sube el comprobante.",
      whatsappSoporte:""
    };
  } catch (e) { console.error("Config pagos:", e); configPagos = {}; }

  try {
    const snapAdm = await getDoc(doc(db, "admins", user.uid));
    esAdminSusc = snapAdm.exists();
    document.getElementById("btn-admin")?.remove();
    if (esAdminSusc) {
      const b = document.createElement("button");
      b.id = "btn-admin";
      b.textContent = "Panel admin";
      b.className = "ob-btn-susc";
      b.style.bottom = "80px";
      b.onclick = () => { abrirModalSusc("modal-admin"); cargarSolicitudesAdmin(); };
      document.body.appendChild(b);
    }
  } catch (e) { console.error("Admin:", e); }

  if (unsubscribeSusc) unsubscribeSusc();
  unsubscribeSusc = onSnapshot(doc(db, "suscripciones", user.uid), (snap) => {
    suscripcion = snap.exists() ? { ...snap.data() } : null;
    if (suscripcion?.estado === "activa") {
      const venc = aFechaSusc(suscripcion.fechaVencimiento);
      if (venc && new Date() >= venc) suscripcion.estado = "expirada";
    }
    actualizarBotonSuscripcion();
  });

  const btnMi = document.getElementById("btn-mi-suscripcion");
  if (btnMi) btnMi.style.display = "block";
}

function detenerSuscripciones() {
  if (unsubscribeSusc) { unsubscribeSusc(); unsubscribeSusc = null; }
  suscripcion = null;
  esAdminSusc = false;
  document.getElementById("btn-mi-suscripcion")?.style.setProperty("display","none");
  document.getElementById("btn-admin")?.remove();
}

function actualizarBotonSuscripcion() {
  const btn = document.getElementById("btn-mi-suscripcion");
  const btnMenu = document.getElementById("suscBtn");
  if (!btn) return;
  if (!suscripcion) {
    btn.textContent = "Suscribirme";
    if (btnMenu) btnMenu.textContent = "💳 Suscribirme";
    return;
  }
  const venc = aFechaSusc(suscripcion.fechaVencimiento);
  const dias = venc ? Math.ceil((venc - new Date()) / 86400000) : null;
  if (suscripcion.estado === "activa" && dias !== null && dias <= 5) {
    btn.textContent = `⚠️ Vence en ${dias} días`;
    if (btnMenu) btnMenu.textContent = `⚠️ Vence en ${dias} días`;
  } else if (suscripcion.estado === "activa") {
    btn.textContent = "Mi suscripción ✓";
    if (btnMenu) btnMenu.textContent = "💳 Mi suscripción ✓";
  } else if (suscripcion.estado === "pendiente") {
    btn.textContent = "Pago en revisión…";
    if (btnMenu) btnMenu.textContent = "💳 Pago en revisión…";
  } else {
    btn.textContent = "Renovar suscripción";
    if (btnMenu) btnMenu.textContent = "💳 Renovar suscripción";
  }
}

/* Seleccionar plan */
document.querySelectorAll(".ob-plan").forEach((card) => {
  card.querySelector(".ob-btn-plan").onclick = () => {
    planSeleccionado = {
      plan:   card.dataset.plan,
      precio: parseFloat(card.dataset.precio)
    };
    cerrarModalSusc("modal-planes");
    if (suscripcion?.telefono) mostrarPago();
    else abrirModalSusc("modal-telefono");
  };
});

/* Guardar teléfono */
document.getElementById("ob-guardar-tel").onclick = async () => {
  const tel  = document.getElementById("ob-tel").value.trim();
  const tel2 = document.getElementById("ob-tel2").value.trim();
  const err  = document.getElementById("ob-tel-error");
  err.textContent = "";
  if (!/^\d{10}$/.test(tel))  { err.textContent = "Ingresa 10 dígitos.";       return; }
  if (tel !== tel2)           { err.textContent = "Los números no coinciden."; return; }
  if (!planSeleccionado)      { err.textContent = "Selecciona un plan.";       return; }
  if (!usuarioActual)         { err.textContent = "Inicia sesión con Google."; return; }
  try {
    await setDoc(doc(db, "suscripciones", usuarioActual.uid), {
      uid: usuarioActual.uid,
      nombre: usuarioActual.displayName || "",
      correo: usuarioActual.email || "",
      telefono: tel,
      plan: planSeleccionado.plan,
      precio: planSeleccionado.precio,
      estado: "pendiente",
      comprobanteURL: "",
      comprobantePath: "",
      fechaSolicitud: serverTimestamp(),
      fechaInicio: null,
      fechaVencimiento: null
    }, { merge: true });
    cerrarModalSusc("modal-telefono");
    mostrarPago();
  } catch (e) { console.error(e); err.textContent = "Error al guardar. Intenta de nuevo."; }
};

function mostrarPago() {
  const plan   = planSeleccionado?.plan   || suscripcion?.plan;
  const precio = planSeleccionado?.precio ?? suscripcion?.precio;
  document.getElementById("ob-res-plan").textContent   = plan === "anual" ? "Anual" : "Mensual";
  document.getElementById("ob-res-precio").textContent = `$${precio} MXN`;
  const c = configPagos || {};
  document.getElementById("ob-datos-bancarios").innerHTML = `
    <div class="dato"><span>Banco</span><b>${c.banco    || "—"}</b></div>
    <div class="dato"><span>Titular</span><b>${c.titular || "—"}</b></div>
    <div class="dato"><span>CLABE</span><b>${c.clabe     || "—"}</b></div>
    <div class="dato"><span>Cuenta</span><b>${c.cuenta   || "—"}</b></div>
    <p style="margin-top:12px;font-size:13px;color:#bbb">${c.instrucciones || ""}</p>`;
  const btnWa = document.getElementById("ob-btn-whatsapp");
  if (c.whatsappSoporte) {
    const msg = encodeURIComponent(`Hola, soy ${usuarioActual.displayName || ""}.\nQuiero pagar mi suscripción OmegaBeats.\nPlan: ${plan === "anual" ? "Anual" : "Mensual"}\nPrecio: $${precio} MXN\nCorreo: ${usuarioActual.email}`);
    btnWa.href = `https://wa.me/${c.whatsappSoporte}?text=${msg}`;
    btnWa.style.display = "inline-block";
  } else btnWa.style.display = "none";
  abrirModalSusc("modal-pago");
}

/* Subir comprobante */
document.getElementById("ob-subir").onclick = async () => {
  const fileInput = document.getElementById("ob-file");
  const msg       = document.getElementById("ob-pago-msg");
  const btn       = document.getElementById("ob-subir");
  msg.className = "ob-msg"; msg.textContent = "";
  if (!usuarioActual)      { msg.className = "ob-msg error"; msg.textContent = "Inicia sesión.";         return; }
  if (!fileInput.files[0]) { msg.className = "ob-msg error"; msg.textContent = "Selecciona una imagen."; return; }
  const file  = fileInput.files[0];
  const tipos = ["image/jpeg","image/jpg","image/png","image/webp"];
  if (!tipos.includes(file.type)) { msg.className = "ob-msg error"; msg.textContent = "Formato no válido."; return; }
  if (file.size > 5*1024*1024)    { msg.className = "ob-msg error"; msg.textContent = "Máximo 5 MB.";      return; }
  btn.disabled = true;
  msg.textContent = "Subiendo comprobante…";
  try {
    const ext  = file.name.split(".").pop();
    const path = `comprobantes/${usuarioActual.uid}/comprobante_${Date.now()}.${ext}`;
    const refArchivo = storageRef(storage, path);
    await uploadBytes(refArchivo, file);
    const url = await getDownloadURL(refArchivo);
    await updateDoc(doc(db, "suscripciones", usuarioActual.uid), {
      comprobanteURL: url, comprobantePath: path,
      estado: "pendiente", fechaSolicitud: serverTimestamp()
    });
    msg.textContent = "✅ Comprobante enviado correctamente. Tu pago será revisado.";
    fileInput.value = "";
  } catch (e) {
    console.error(e);
    msg.className = "ob-msg error";
    msg.textContent = "Error al subir. Intenta de nuevo.";
  } finally { btn.disabled = false; }
};

/* Mi suscripción */
async function abrirMiSuscripcion() {
  if (!usuarioActual) return;
  abrirModalSusc("modal-susc");
  const cont = document.getElementById("ob-info-susc");
  const hist = document.getElementById("ob-historial");
  cont.innerHTML = "Cargando…"; hist.innerHTML = "";

  if (!suscripcion) {
    cont.innerHTML = `<p>Aún no tienes una suscripción.</p><button class="ob-btn-primario" id="ob-btn-ver-planes">Ver planes</button>`;
    document.getElementById("ob-btn-ver-planes").onclick = () => {
      cerrarModalSusc("modal-susc"); abrirModalSusc("modal-planes");
    };
    return;
  }

  const venc = aFechaSusc(suscripcion.fechaVencimiento);
  const dias = venc ? Math.ceil((venc - new Date()) / 86400000) : null;
  let aviso = "";
  if (suscripcion.estado === "activa" && dias !== null && dias <= 7)
    aviso = `<div class="ob-aviso">⚠️ Tu suscripción vence próximamente (${fmtSusc(venc)}).</div>`;

  cont.innerHTML = `
    ${aviso}
    <p><strong>Plan:</strong> OmegaBeats ${suscripcion.plan === "anual" ? "Anual" : "Mensual"}</p>
    <p><strong>Precio:</strong> $${suscripcion.precio} MXN</p>
    <p><strong>Estado:</strong> <span class="ob-estado ${suscripcion.estado}">${suscripcion.estado}</span></p>
    <p><strong>Fecha de inicio:</strong> ${fmtSusc(aFechaSusc(suscripcion.fechaInicio))}</p>
    <p><strong>Fecha de vencimiento:</strong> ${fmtSusc(venc)}</p>
    <p><strong>Teléfono registrado:</strong> ${suscripcion.telefono || "—"}</p>
    ${suscripcion.estado !== "activa" || (dias !== null && dias <= 7)
      ? `<button class="ob-btn-primario" id="ob-btn-renovar">${suscripcion.estado === "activa" ? "Renovar suscripción" : "Suscribirme / Renovar"}</button>`
      : ""}`;

  const btnRenovar = document.getElementById("ob-btn-renovar");
  if (btnRenovar) btnRenovar.onclick = () => {
    cerrarModalSusc("modal-susc"); abrirModalSusc("modal-planes");
  };

  try {
    const snap = await getDocs(collection(db, "historial_pagos", usuarioActual.uid, "pagos"));
    if (!snap.empty) {
      hist.innerHTML = `<h3>Historial de suscripciones</h3>`;
      snap.forEach((d) => {
        const p = d.data();
        hist.innerHTML += `
          <div class="ob-hist-item">
            <div><b>${p.plan === "anual" ? "Anual" : "Mensual"}</b> · $${p.precio} MXN · <span class="ob-estado ${p.estado}">${p.estado}</span></div>
            <div>Solicitud: ${fmtSusc(aFechaSusc(p.fechaSolicitud))}</div>
            <div>Aprobación: ${fmtSusc(aFechaSusc(p.fechaAprobacion))}</div>
            <div>Vigencia: ${fmtSusc(aFechaSusc(p.fechaInicio))} → ${fmtSusc(aFechaSusc(p.fechaVencimiento))}</div>
            ${p.comprobanteURL ? `<div><a href="${p.comprobanteURL}" target="_blank" style="color:#00d47e">Ver comprobante</a></div>` : ""}
          </div>`;
      });
    }
  } catch (e) { console.error("Historial:", e); }
}

document.getElementById("btn-mi-suscripcion").onclick = abrirMiSuscripcion;
suscBtn.addEventListener("click", () => {
  cerrarMenu();
  setTimeout(abrirMiSuscripcion, 120);
});

/* Panel admin */
async function cargarSolicitudesAdmin() {
  if (!esAdminSusc) return;
  const cont = document.getElementById("ob-admin-lista");
  cont.innerHTML = "Cargando…";
  try {
    const snap = await getDocs(collection(db, "suscripciones"));
    if (snap.empty) { cont.innerHTML = "<p>No hay solicitudes.</p>"; return; }
    let html = `<table class="ob-tabla"><thead><tr>
      <th>Usuario</th><th>Correo</th><th>Tel</th><th>Plan</th><th>Precio</th>
      <th>Fecha</th><th>Estado</th><th>Comprobante</th><th>Acciones</th>
    </tr></thead><tbody>`;
    snap.forEach((d) => {
      const s = d.data();
      html += `<tr>
        <td>${s.nombre   || "—"}</td>
        <td>${s.correo   || "—"}</td>
        <td>${s.telefono || "—"}</td>
        <td>${s.plan}</td>
        <td>$${s.precio}</td>
        <td>${fmtSusc(aFechaSusc(s.fechaSolicitud))}</td>
        <td><span class="ob-estado ${s.estado}">${s.estado}</span></td>
        <td>${s.comprobanteURL ? `<button class="ob-ver" onclick="verComprobante('${s.comprobanteURL}')">Ver</button>` : "—"}</td>
        <td class="ob-acciones">
          ${s.estado === "pendiente" ? `
            <button class="ob-aprobar"  onclick="aprobarPago('${s.uid}')">Aprobar</button>
            <button class="ob-rechazar" onclick="rechazarPago('${s.uid}')">Rechazar</button>` : "—"}
        </td></tr>`;
    });
    html += "</tbody></table>";
    cont.innerHTML = html;
  } catch (e) { console.error(e); cont.innerHTML = "<p>Error al cargar.</p>"; }
}

window.verComprobante = (url) => {
  document.getElementById("ob-img-visor").src = url;
  abrirModalSusc("modal-img");
};

window.aprobarPago = async (uid) => {
  if (!esAdminSusc) return;
  const refSub = doc(db, "suscripciones", uid);
  const snap   = await getDoc(refSub);
  if (!snap.exists()) return alert("No existe la suscripción.");
  const s = snap.data();
  const ahora = new Date();
  const venc  = new Date(ahora);
  if (s.plan === "anual") venc.setFullYear(venc.getFullYear() + 1);
  else                    venc.setMonth(venc.getMonth() + 1);

  const { Timestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

  await updateDoc(refSub, {
    estado: "activa",
    fechaInicio: Timestamp.fromDate(ahora),
    fechaVencimiento: Timestamp.fromDate(venc)
  });
  await addDoc(collection(db, "historial_pagos", uid, "pagos"), {
    ...s, estado: "activa",
    fechaAprobacion: serverTimestamp(),
    fechaInicio: Timestamp.fromDate(ahora),
    fechaVencimiento: Timestamp.fromDate(venc)
  });
  cargarSolicitudesAdmin();
};

window.rechazarPago = async (uid) => {
  if (!esAdminSusc) return;
  if (!confirm("¿Rechazar este comprobante?")) return;
  const refSub = doc(db, "suscripciones", uid);
  const snap   = await getDoc(refSub);
  const s      = snap.data();
  await updateDoc(refSub, { estado: "rechazada" });
  await addDoc(collection(db, "historial_pagos", uid, "pagos"), {
    ...s, estado: "rechazada", fechaAprobacion: serverTimestamp()
  });
  cargarSolicitudesAdmin();
};

/* Cerrar modales */
document.querySelectorAll("[data-cerrar]").forEach((el) => {
  el.onclick = () => cerrarModalSusc(el.dataset.cerrar);
});
document.querySelectorAll(".ob-modal").forEach((m) => {
  m.addEventListener("click", (e) => { if (e.target === m) m.classList.remove("abierto"); });
});
