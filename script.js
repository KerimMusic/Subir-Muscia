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

// ============================================ FIREBASE ============================================
const firebaseConfig = {
  apiKey: "AIzaSyDMabE70hIApcNU5RY3_WEEIF-BWUzO0K4",
  authDomain: "kerim-music-a9c46.firebaseapp.com",
  projectId: "kerim-music-a9c46",
  storageBucket: "kerim-music-a9c46.firebasestorage.app",
  messagingSenderId: "470731440209",
  appId: "1:470731440209:web:f6eba4784027a5d8c57870",
  measurementId: "G-LBHTKL8KDK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ============================================ WEBVIEW ============================================
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
    if (result && result.user) mostrarStatus('✅ Sesión iniciada correctamente', 'ok');
  })
  .catch(err => {
    if (err && err.code && err.code !== 'auth/no-auth-event') {
      console.error('[Auth] getRedirectResult:', err);
      mostrarStatus('Error al iniciar sesión: ' + err.message, 'error');
    }
  });

// ============================================ DOM ============================================
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

const paywall         = document.getElementById('paywall');
const paywallLogout   = document.getElementById('paywallLogout');
const limiteBanner    = document.getElementById('limiteBanner');
const upgradeBtn      = document.getElementById('upgradeBtn');

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

// ================== PLANES ==================
const PLAN_ID_PRO   = 'P-88D20959NU409831ENK66MMI';
const PLAN_ID_BASIC = 'P-6AG16533PP0259939NK7AD7I';
const PRECIO_PRO    = 550;
const PRECIO_BASIC  = 1;
const LIMITE_BASICO = 1;

const MESES_ENTRE_RETIROS = 3;
const COLECCION_SUSCRIPCIONES = 'suscripciones';

const subBox     = document.getElementById('subBox');
const subEstado  = document.getElementById('subEstado');
const subDetalle = document.getElementById('subDetalle');
const subBtn     = document.getElementById('subBtn');
const retiroBtn  = document.getElementById('retiroBtn');
const retiroInfo = document.getElementById('retiroInfo');

let suscripcionActual = null;
let paypalRenderizado = false;

// ============================================ UTILIDADES ============================================
function mostrarStatus(msg, tipo = 'ok') {
  status.textContent = msg;
  status.className = 'status ' + tipo;
  if (tipo === 'ok') setTimeout(() => { status.className = 'status'; }, 4000);
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

function fmtNumero(n) { return (Number(n) || 0).toLocaleString('es-MX'); }
function fmtDinero(n) {
  return '$' + (Number(n) || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }) + ' MXN';
}

function normalizarTitulo(t) {
  return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

// ============================================ COLABORADORES ============================================
function crearFilaColaborador(valor = '') {
  const row = document.createElement('div');
  row.className = 'collaborator-row';
  row.innerHTML = `
    <input type="text" class="collaborator-input"
           placeholder="Ej: Nombre del colaborador"
           value="${escapeHtml(valor)}">
    <button type="button" class="btn-remove-collab"
            title="Eliminar colaborador" aria-label="Eliminar">✕</button>
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
  else lista.forEach(n => contenedor.appendChild(crearFilaColaborador(n)));
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

// ============================================ OYENTES ============================================
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
    const s = statsOyentes[normalizarTitulo(c)];
    if (s) return s;
  }
  return { oyentes: 0, docId: null };
}

// ============================================ AUTH LOGIN ============================================
loginBtn.addEventListener('click', async () => {
  try {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loader"></span>Iniciando sesión...';
    if (esWebView()) { await signInWithRedirect(auth, provider); return; }
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error('[Auth] Error login:', e);
    const necesitaFallback =
      e.code === 'auth/popup-blocked' ||
      e.code === 'auth/operation-not-supported-in-this-environment' ||
      e.code === 'auth/web-storage-unsupported';
    if (necesitaFallback) {
      try { await signInWithRedirect(auth, provider); return; }
      catch (e2) {
        console.error('[Auth] Fallback redirect falló:', e2);
        mostrarStatus('Error al iniciar sesión: ' + e2.message, 'error');
      }
    } else mostrarStatus('Error al iniciar sesión: ' + e.message, 'error');
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
  } else {
    loginBtn.classList.remove('hidden');
    loginBtn.disabled = false;
    loginBtn.innerHTML = LOGIN_BTN_HTML;
    userBox.classList.add('hidden');
    form.classList.add('hidden');
    historySection.classList.add('hidden');
    menuWrap.classList.add('hidden');
    limiteBanner?.classList.add('hidden');
    cerrarMenu();
    if (unsubscribeHistorial) { unsubscribeHistorial(); unsubscribeHistorial = null; }
    if (unsubscribeOyentes)   { unsubscribeOyentes();   unsubscribeOyentes = null; }
    historyList.innerHTML = '';
    historyCount.textContent = '0';
    historyEmpty.classList.add('hidden');
    cancionesActuales = [];
    statsOyentes = {};
    cerrarPlayer(); cerrarEditModal(); cerrarStatsModal();
  }
});

// ============================================ PREVIEW ============================================
['artista', 'titulo', 'imagen', 'album'].forEach(id => {
  document.getElementById(id).addEventListener('input', actualizarPreview);
});
function actualizarPreview() {
  const artista = document.getElementById('artista').value.trim();
  const titulo  = document.getElementById('titulo').value.trim();
  const imagen  = document.getElementById('imagen').value.trim();
  const album   = document.getElementById('album').value.trim();
  if (!artista && !titulo && !imagen && !album) { preview.classList.remove('show'); return; }
  preview.classList.add('show');
  previewTitulo.textContent  = titulo || '—';
  previewArtista.textContent = artista || '—';
  const albumSpan = document.querySelector('.preview-info .Album');
  if (albumSpan) albumSpan.textContent = album || 'Reggeton 1';
  if (imagen) {
    previewImg.src = dropboxDirecto(imagen);
    previewImg.onerror = () => { previewImg.src = PLACEHOLDER; };
  } else previewImg.src = PLACEHOLDER;
}

// ============================================ HISTORIAL ============================================
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
    actualizarBannerLimite();
    aplicarEstadoSuscripcion(); // refresca textos con conteo actualizado
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
      const stats = { docId: d.id, oyentes: extraerOyentes(data) };
      const candidatos = [d.id, data.titulo, data.title, data.nombre, data.cancion, data.song];
      candidatos.forEach(c => {
        if (!c) return;
        const key = normalizarTitulo(c);
        if (key && !mapa[key]) mapa[key] = stats;
      });
    });
    statsOyentes = mapa;
    if (statsAbierto) renderStats(cancionesActuales);
  }, (err) => console.error('Error oyentes:', err));
}

async function asegurarRegistroOyentes(titulo) {
  if (!titulo) return;
  if (statsOyentes[normalizarTitulo(titulo)]) return;
  try {
    const docRef = doc(db, COLECCION_OYENTES, titulo);
    const snap = await getDoc(docRef);
    if (snap.exists()) return;
    await setDoc(docRef, { oyentes: 0 });
  } catch (e) { console.warn('No asegurarRegistroOyentes:', e); }
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
      const s = await getDoc(doc(db, COLECCION_OYENTES, docIdAntiguo));
      if (s.exists()) contenidoAntiguo = s.data();
    }
    const snapNuevo   = await getDoc(doc(db, COLECCION_OYENTES, tituloNuevo));
    const existeNuevo = snapNuevo.exists();
    if (contenidoAntiguo) {
      if (existeNuevo) {
        const datosNuevos = snapNuevo.data() || {};
        const oA = contenidoAntiguo.oyentes || {};
        const oN = datosNuevos.oyentes || {};
        let oyentesFinales;
        if (oA && typeof oA === 'object' && !Array.isArray(oA) &&
            oN && typeof oN === 'object' && !Array.isArray(oN)) {
          oyentesFinales = { ...oA, ...oN };
        } else if (Array.isArray(oA) && Array.isArray(oN)) {
          oyentesFinales = Array.from(new Set([...oA, ...oN]));
        } else oyentesFinales = oN || oA || {};
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
  } catch (e) { console.warn('No sincronizarOyentesAlEditar:', e); }
}

async function eliminarRegistroOyentes(cancion) {
  if (!cancion || !cancion.titulo) return;
  const stats = obtenerStatsDeCancion(cancion);
  const docId = stats.docId || cancion.titulo;
  try { await deleteDoc(doc(db, COLECCION_OYENTES, docId)); }
  catch (e) { console.warn('No eliminarRegistroOyentes:', e); }
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
        <button type="button" class="btn-edit" data-id="${escapeHtml(c.id)}" title="Editar">✏️</button>
        <button type="button" class="btn-delete" data-id="${escapeHtml(c.id)}" title="Eliminar">🗑️</button>
      </div>`;
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
    const cancion = cancionesActuales.find(c => c.id === editBtn.dataset.id);
    if (cancion) abrirEditModal(cancion);
    return;
  }
  const item = e.target.closest('.history-item');
  if (!item) return;
  const cancion = cancionesActuales.find(c => c.id === item.dataset.id);
  if (cancion) abrirPlayer(cancion);
});

async function eliminarCancion(id, boton, titulo, cancion) {
  if (!usuarioActual) { mostrarStatus('Debes iniciar sesión primero', 'error'); return; }
  if (!confirm(`¿Seguro que quieres eliminar "${titulo}"?\nEsta acción no se puede deshacer.`)) return;
  try {
    boton.disabled = true; boton.textContent = '⏳';
    await deleteDoc(doc(db, 'historial_usuarios', usuarioActual.uid, 'canciones', id));
    if (cancion) await eliminarRegistroOyentes(cancion);
    else {
      try { await deleteDoc(doc(db, COLECCION_OYENTES, titulo)); }
      catch (e) { console.warn('Fallback eliminar oyentes:', e); }
    }
    mostrarStatus('🗑️ Canción eliminada correctamente', 'ok');
  } catch (err) {
    console.error('Error al eliminar:', err);
    mostrarStatus('Error al eliminar: ' + err.message, 'error');
    boton.disabled = false; boton.textContent = '🗑️';
  }
}

// ============================================ GUARDAR CANCIÓN ============================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!usuarioActual) { mostrarStatus('Debes iniciar sesión primero', 'error'); return; }

  const permiso = puedeSubirCancion();
  if (!permiso.ok) {
    if (permiso.motivo === 'sin_suscripcion') {
      mostrarStatus('Necesitas una suscripción activa para subir música', 'error');
      mostrarPaywall();
    } else if (permiso.motivo === 'limite_basico_alcanzado') {
      mostrarStatus('Ya usaste tu única canción del plan Basic. Actualiza a Pro para subir más.', 'error');
      setTimeout(mostrarPaywall, 900);
    }
    return;
  }

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

// ============================================ REPRODUCTOR ============================================
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
playerModal.addEventListener('click', (e) => { if (e.target.dataset.close === '1') cerrarPlayer(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !playerModal.classList.contains('hidden')) cerrarPlayer();
});
playerPlay.addEventListener('click', async () => {
  if (!previewAudio.src) return;
  try {
    if (previewAudio.paused) { await previewAudio.play(); playerPlay.textContent = '⏸'; }
    else { previewAudio.pause(); playerPlay.textContent = '▶'; }
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
  playerSeek.value = (previewAudio.currentTime / previewAudio.duration) * 1000;
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

// ============================================ EDITAR ============================================
function abrirEditModal(cancion) {
  if (!cancion) return;
  editandoId = cancion.id;
  editArtista.value = cancion.artista || '';
  editTitulo.value  = cancion.titulo  || '';
  editAlbum.value   = cancion.album   || '';
  const revertir = (url) => url ? url.replace('dl.dropboxusercontent.com', 'www.dropbox.com') : '';
  editAudio.value  = revertir(cancion.audioUrl || '');
  editImagen.value = revertir(cancion.imagenUrl || '');
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
editModal.addEventListener('click', (e) => { if (e.target.dataset.close === '1') cerrarEditModal(); });
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
    await updateDoc(doc(db, 'historial_usuarios', uid, 'canciones', editandoId), {
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
  } else editImg.src = PLACEHOLDER;
});

// ============================================ ESTADÍSTICAS ============================================
function renderStats(canciones) {
  const lista = canciones || cancionesActuales || [];
  const esBasic = esPlanBasico();

  if (!lista.length) {
    statsList.innerHTML = '';
    statsEmpty.classList.remove('hidden');
    statsTotalListeners.textContent = '0';
    statsTotalEarnings.textContent  = fmtDinero(0);
    renderRetiroInfo();
    return;
  }
  statsEmpty.classList.add('hidden');
  let totalOyentes = 0;
  statsList.innerHTML = lista.map(c => {
    const img = c.imagenUrl ? escapeHtml(c.imagenUrl) : PLACEHOLDER;
    const titulo  = escapeHtml(c.titulo  || 'Sin título');
    const artista = escapeHtml(c.artista || 'Desconocido');
    const stats = obtenerStatsDeCancion(c);
    const listeners = stats.oyentes || 0;
    const ganancia = listeners * PAGO_POR_OYENTE;
    totalOyentes += listeners;

    const celdaGanancia = esBasic
      ? `<div class="stats-cell">
           <span class="stats-cell-label">💰 Ganancias</span>
           <span class="stats-cell-value" title="Requiere plan Pro">🔒 Pro</span>
         </div>`
      : `<div class="stats-cell earn">
           <span class="stats-cell-label">💰 Ganancias</span>
           <span class="stats-cell-value">${fmtDinero(ganancia)}</span>
         </div>`;

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
          ${celdaGanancia}
        </div>
      </div>`;
  }).join('');

  const totalGanancias = totalOyentes * PAGO_POR_OYENTE;
  statsTotalListeners.textContent = fmtNumero(totalOyentes);
  statsTotalEarnings.textContent  = esBasic ? '🔒 Plan Pro' : fmtDinero(totalGanancias);
  renderRetiroInfo();
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
statsModal.addEventListener('click', (e) => { if (e.target.dataset.close === '1') cerrarStatsModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !statsModal.classList.contains('hidden')) cerrarStatsModal();
});
statsBtn.addEventListener('click', () => {
  cerrarMenu();
  setTimeout(abrirStatsModal, 120);
});

// ============================================ MENÚ ============================================
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

// ============================================ GÉNEROS ============================================
const GENEROS_RAW = [
  "Regional Mexicano","Reggaetón","Pop","Rock","Hip-Hop / Rap","Música Latina","Cumbia",
  "Electrónica","R&B / Soul","Indie / Alternativo","Metal","Punk","Reggae","Afrobeat",
  "Country","Folk","Jazz","Blues","K-Pop","J-Pop","Cristiana / Gospel","Clásica",
  "Flamenco","Acústica","Instrumental","Soundtrack","Otros",
  "Art Pop","Dance Pop","Electropop","Synth-pop","Indie Pop","Dream Pop","Bedroom Pop",
  "Hyperpop","Teen Pop","Bubblegum Pop","Power Pop","C-Pop","Latin Pop","Europop",
  "Britpop","Sophisti-Pop","Baroque Pop","Sunshine Pop","Chamber Pop","Experimental Pop",
  "Alternative Rock","Indie Rock","Hard Rock","Soft Rock","Classic Rock","Progressive Rock",
  "Psychedelic Rock","Garage Rock","Blues Rock","Folk Rock","Southern Rock","Surf Rock",
  "Glam Rock","Art Rock","Experimental Rock","Post-Rock","Math Rock","Noise Rock",
  "Space Rock","Gothic Rock","Industrial Rock","Christian Rock","Grunge","Brit Rock",
  "Emo","Shoegaze","Dream Rock",
  "Heavy Metal","Thrash Metal","Death Metal","Black Metal","Doom Metal","Power Metal",
  "Speed Metal","Progressive Metal","Symphonic Metal","Folk Metal","Groove Metal",
  "Nu Metal","Alternative Metal","Industrial Metal","Gothic Metal","Metalcore",
  "Deathcore","Grindcore","Sludge Metal","Stoner Metal","Funeral Doom",
  "Melodic Death Metal","Technical Death Metal","Viking Metal","Pagan Metal",
  "Post-Metal","Djent",
  "Punk Rock","Hardcore Punk","Post-Punk","Pop Punk","Skate Punk","Street Punk",
  "Anarcho-Punk","Crust Punk","D-Beat","Garage Punk","Riot Grrrl","Emo Punk",
  "Ska Punk","Celtic Punk","Folk Punk","Horror Punk","Psychobilly",
  "Hip-Hop","Rap","Trap","Drill","Gangsta Rap","Boom Bap","Conscious Hip-Hop",
  "Underground Hip-Hop","Alternative Hip-Hop","Old School Hip-Hop","West Coast Hip-Hop",
  "East Coast Hip-Hop","Southern Hip-Hop","Crunk","Dirty South","G-Funk","Cloud Rap",
  "Emo Rap","Jazz Rap","Experimental Hip-Hop","Hardcore Hip-Hop","Latin Hip-Hop",
  "Chicano Rap","UK Hip-Hop","UK Drill","Grime","Freestyle Rap","Trap Latino",
  "R&B","Contemporary R&B","Alternative R&B","Neo Soul","Soul","Classic Soul",
  "Southern Soul","Motown","Funk","P-Funk","Quiet Storm","New Jack Swing",
  "Blue-Eyed Soul","Psychedelic Soul","Gospel Soul","Soul Jazz",
  "Blues","Delta Blues","Chicago Blues","Texas Blues","Electric Blues","Acoustic Blues",
  "Country Blues","Piedmont Blues","British Blues","Jump Blues","Swamp Blues",
  "Gospel Blues","Soul Blues",
  "Jazz","Bebop","Hard Bop","Cool Jazz","Free Jazz","Fusion","Jazz Fusion","Smooth Jazz",
  "Acid Jazz","Latin Jazz","Afro-Cuban Jazz","Gypsy Jazz","Swing","Big Band","Dixieland",
  "Ragtime","Modal Jazz","Avant-Garde Jazz","Jazz Funk","Nu Jazz","Vocal Jazz",
  "Contemporary Jazz",
  "Electronic","EDM","House","Deep House","Tech House","Progressive House",
  "Electro House","Future House","Tropical House","Bass House","Acid House",
  "Chicago House","French House","Minimal House","Techno","Detroit Techno",
  "Minimal Techno","Industrial Techno","Hard Techno","Acid Techno","Trance",
  "Progressive Trance","Psytrance","Goa Trance","Uplifting Trance","Hard Trance",
  "Electro","Ambient","Dark Ambient","Chillout","Downtempo","IDM","Breakbeat",
  "Drum & Bass","Jungle","Liquid Drum & Bass","Dubstep","Brostep","UK Garage",
  "Future Bass","Synthwave","Vaporwave","Retrowave","Lo-Fi","Chillwave","Glitch",
  "Industrial","EBM","Hardcore","Gabber","Hardstyle","Future Rave",
  "Reggae","Roots Reggae","Dancehall","Dub","Rocksteady","Ska","Lovers Rock",
  "Ragga","Reggae Fusion","Digital Reggae","Dub Poetry",
  "Música Latina","Latin Urban","Salsa","Salsa Romántica","Salsa Dura","Son Cubano",
  "Bachata","Merengue","Cumbia","Cumbia Mexicana","Cumbia Colombiana","Cumbia Villera",
  "Cumbia Peruana","Cumbia Andina","Vallenato","Bolero","Mambo","Cha-cha-chá","Rumba",
  "Guaracha","Danzón","Timba","Latin Rock","Latin Soul","Tango","Milonga","Bossa Nova",
  "Samba","MPB","Forró","Axé","Frevo","Sertanejo",
  "Mariachi","Ranchera","Norteño","Norteño-Banda","Banda","Banda Sinaloense","Corridos",
  "Corrido Tradicional","Corrido Tumbado","Corrido Bélico","Corridos Alterados","Tejano",
  "Grupero","Duranguense","Sierreño","Huapango","Son Jarocho","Son Huasteco",
  "Música de Tierra Caliente","Música Norteña","Cumbia Norteña","Bolero Ranchero",
  "Mariachi Moderno",
  "Country","Country Pop","Country Rock","Traditional Country","Outlaw Country",
  "Alternative Country","Bluegrass","Americana","Honky Tonk","Country Blues",
  "Western Swing","Nashville Sound","Red Dirt","Contemporary Country","Country Folk",
  "Folk","Contemporary Folk","Traditional Folk","Celtic Folk","Irish Folk","Scottish Folk",
  "English Folk","American Folk","Appalachian","Nordic Folk","Balkan Folk","Slavic Folk",
  "Gypsy / Romani","Klezmer","Neofolk","World Folk","Folk Fusion",
  "Música Clásica","Medieval","Renacimiento","Barroco","Clasicismo","Romanticismo",
  "Impresionismo","Modernismo","Música Contemporánea","Música de Cámara","Sinfónica",
  "Coral","Ópera","Opereta","Oratorio","Cantata","Concierto","Sonata","Sinfonía",
  "Música Minimalista","Música Experimental",
  "Gospel","Christian","Christian Pop","Christian Hip-Hop","Christian Metal","Worship",
  "Contemporary Christian","Spiritual","Hymns","Islamic Music","Nasheed","Jewish Music",
  "Buddhist Music","Hindu Devotional","Mantra",
  "Afrobeat","Afrobeats","Afro-Pop","Amapiano","Highlife","Hiplife","Kizomba","Kuduro",
  "Kwaito","Gqom","Mbalax","Juju","Fuji","Makossa","Soukous","Congolese Rumba","Benga",
  "Bikutsi","Chimurenga","Jit","Marrabenta","Mbube","Marabi","Township Jazz","Rai",
  "Gnawa","Desert Blues","Maloya","Sega","Cape Jazz",
  "Calypso","Soca","Zouk","Kompa","Son","Mento","Steelpan","Bouyon","Punta",
  "Pagode","Choro","Tropicália","Maracatu","Baião","Carimbó","Lambada","Música Caipira",
  "Samba-Reggae","Funk Carioca",
  "K-Rock","K-Hip-Hop","J-Rock","J-Hip-Hop","City Pop","Enka","Shibuya-kei","Mandopop",
  "Cantopop","Bollywood","Bhangra","Qawwali","Ghazal","Carnatic","Hindustani Classical",
  "Raga","Dhrupad","Gamelan","Dangdut","Thai Pop","V-Pop","Pinoy Pop","Persian Pop",
  "Arabic Pop","Turkish Pop",
  "Arabic Music","Shaabi","Dabke","Khaleeji","Egyptian Pop","Lebanese Pop","Iraqi Music",
  "Persian Music","Turkish Music","Kurdish Music","Armenian Music","Israeli Music",
  "Mizrahi","Andalusian Music","Oud Music","Traditional Middle Eastern",
  "Hawaiian","Hawaiian Pop","Polynesian","Samoan","Tahitian","Tongan","Maori",
  "Aboriginal Australian","Melanesian","Micronesian","Pacific Island Music",
  "New Zealand Folk",
  "Experimental","Avant-Garde","Noise","Drone","Musique Concrète","Electroacoustic",
  "Minimalism","Sound Art","Free Improvisation","Experimental Electronic",
  "Film Score","Soundtrack","Movie Soundtrack","Television Score","Video Game Music",
  "Anime Music","Orchestral Score","Cinematic","Trailer Music","Ambient Score",
  "Musical Theatre","Broadway","Stage & Screen",
  "A Cappella","Vocal Pop","Choral","Choir","Barbershop","Doo-Wop","Beatboxing",
  "Gregorian Chant","Operatic","Vocal Classical",
  "Children's Music","Nursery Rhymes","Educational Music","Comedy Music","Novelty",
  "Parody","Comedy Rock","Comedy Rap","Comedy Pop",
  "Dance","Dance-Pop","Eurodance","Eurobeat","Disco","Nu-Disco","Garage","Jersey Club",
  "Baltimore Club","Footwork","Juke",
  "Acústica","Acústica Pop","Rock Acústico","Folk Acústico","Latino Acústico",
  "Indie Acústico","Regional Mexicano Acústico","Acústica Instrumental","Unplugged",
  "Balada Acústica","Bolero Acústico"
];

const GENEROS = [...new Set(GENEROS_RAW.map(g => g.trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

const SUBGENEROS_RAW = [
  "Corridos","Corridos Tumbados","Corridos Bélicos","Corridos Tradicionales","Banda",
  "Banda Sinaloense","Norteño","Norteño-Banda","Sierreño","Sad Sierreño","Grupero",
  "Mariachi","Ranchera","Huapango","Duranguense","Tejano","Cumbia Norteña"
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

const subgenreGroup   = document.getElementById('subgenreGroup');
const subgeneroHidden = document.getElementById('subgenero');
const subgenreSelect  = document.getElementById('subgenreSelect');
const subgenreToggle  = document.getElementById('subgenreToggle');
const subgenrePanel   = document.getElementById('subgenrePanel');
const subgenreList    = document.getElementById('subgenreList');
const subgenreSearch  = document.getElementById('subgenreSearch');
const subgenreValue   = document.getElementById('subgenreValue');
const subgenreEmpty   = document.getElementById('subgenreEmpty');

let generoSeleccionado = '';
let subgeneroSeleccionado = '';

const normalizarTexto = (s = '') =>
  String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function pintarGeneros(filtro = '') {
  const q = normalizarTexto(filtro);
  const lista = q ? GENEROS.filter(g => normalizarTexto(g).includes(q)) : GENEROS;
  if (!lista.length) { genreList.innerHTML = ''; genreEmpty.classList.remove('hidden'); return; }
  genreEmpty.classList.add('hidden');
  genreList.innerHTML = lista.map(g => {
    const sel = g === generoSeleccionado;
    return `<button type="button" class="genre-item${sel ? ' selected' : ''}"
      role="option" aria-selected="${sel}" data-genero="${escapeHtml(g)}">
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
    subgenreGroup?.classList.remove('hidden');
  } else {
    subgenreGroup?.classList.add('hidden');
    subgeneroSeleccionado = '';
    if (subgeneroHidden) subgeneroHidden.value = '';
    if (subgenreValue) {
      subgenreValue.textContent = 'Selecciona un subgénero';
      subgenreValue.classList.add('placeholder');
    }
    cerrarSubgeneros();
  }
}
function pintarSubgeneros(filtro = '') {
  const q = normalizarTexto(filtro);
  const lista = q ? SUBGENEROS.filter(g => normalizarTexto(g).includes(q)) : SUBGENEROS;
  if (!lista.length) { subgenreList.innerHTML = ''; subgenreEmpty.classList.remove('hidden'); return; }
  subgenreEmpty.classList.add('hidden');
  subgenreList.innerHTML = lista.map(g => {
    const sel = g === subgeneroSeleccionado;
    return `<button type="button" class="genre-item${sel ? ' selected' : ''}"
      role="option" aria-selected="${sel}" data-subgenero="${escapeHtml(g)}">
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
  if (e.key === 'Enter') { e.preventDefault(); const p = genreList.querySelector('.genre-item'); if (p) seleccionarGenero(p.dataset.genero); }
  if (e.key === 'Escape') cerrarGeneros();
});
genreList.addEventListener('click', (e) => {
  const btn = e.target.closest('.genre-item');
  if (btn) seleccionarGenero(btn.dataset.genero);
});
document.addEventListener('click', (e) => {
  if (genrePanel.classList.contains('hidden')) return;
  if (genreSelect && !genreSelect.contains(e.target)) cerrarGeneros();
});
subgenreToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (subgenrePanel.classList.contains('hidden')) abrirSubgeneros();
  else cerrarSubgeneros();
});
subgenreSearch.addEventListener('input', () => pintarSubgeneros(subgenreSearch.value));
subgenreSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); const p = subgenreList.querySelector('.genre-item'); if (p) seleccionarSubgenero(p.dataset.subgenero); }
  if (e.key === 'Escape') cerrarSubgeneros();
});
subgenreList.addEventListener('click', (e) => {
  const btn = e.target.closest('.genre-item');
  if (btn) seleccionarSubgenero(btn.dataset.subgenero);
});
document.addEventListener('click', (e) => {
  if (subgenrePanel.classList.contains('hidden')) return;
  if (subgenreSelect && !subgenreSelect.contains(e.target)) cerrarSubgeneros();
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
  subgenreGroup?.classList.add('hidden');
  cerrarSubgeneros();
  cargarColaboradoresEn(collabContainerForm, []);
});
pintarGeneros('');
pintarSubgeneros('');

// ================================================================
// 🎵 SUSCRIPCIÓN + PLANES
// ================================================================

function formatearFechaLarga(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function estaSuscripcionActiva() {
  if (!suscripcionActual) return false;
  if (suscripcionActual.estado === 'cancelada') return false;
  const venc = suscripcionActual.fechaVencimiento;
  if (!venc) return false;
  const fv = venc.toDate ? venc.toDate() : new Date(venc);
  return fv.getTime() > Date.now();
}

function tipoPlanActual() {
  if (!suscripcionActual) return null;
  return suscripcionActual.tipo || 'pro';
}
function esPlanBasico() { return tipoPlanActual() === 'basic'; }
function esPlanPro()    { return tipoPlanActual() === 'pro'; }

function puedeSubirCancion() {
  if (!estaSuscripcionActiva()) return { ok: false, motivo: 'sin_suscripcion' };
  if (esPlanPro()) return { ok: true };
  const subidas = (cancionesActuales || []).length;
  if (subidas >= LIMITE_BASICO) return { ok: false, motivo: 'limite_basico_alcanzado' };
  return { ok: true };
}

function actualizarBannerLimite() {
  if (!limiteBanner) return;
  const activa = estaSuscripcionActiva();
  const esBasic = esPlanBasico();
  const subidas = (cancionesActuales || []).length;
  if (activa && esBasic && subidas >= LIMITE_BASICO) {
    limiteBanner.classList.remove('hidden');
  } else {
    limiteBanner.classList.add('hidden');
  }
}

function mostrarPaywall() {
  if (!paywall) return;
  paywall.classList.remove('hidden');
  paywall.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  menuWrap?.classList.add('hidden');
  setTimeout(renderPayPalBotones, 120);
}
function ocultarPaywall() {
  if (!paywall) return;
  paywall.classList.add('hidden');
  paywall.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

async function cargarSuscripcion(uid) {
  try {
    const snap = await getDoc(doc(db, COLECCION_SUSCRIPCIONES, uid));
    suscripcionActual = snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    console.error('[Suscripción] Error al cargar:', e);
    suscripcionActual = null;
  }
  aplicarEstadoSuscripcion();
}

function aplicarEstadoSuscripcion() {
  const activa = estaSuscripcionActiva();

  if (activa) {
    ocultarPaywall();
    menuWrap?.classList.remove('hidden');

    const esBasic = esPlanBasico();
    const subidas = (cancionesActuales || []).length;
    const icono   = esBasic ? '🎧' : '🚀';
    const nombre  = esBasic ? 'OmegaBeats Basic' : 'Artista Pro';

    if (subBox) {
      subBox.classList.remove('hidden', 'inactiva');
      if (subEstado)  subEstado.textContent  = `${icono} Plan ${nombre} activo`;
      if (subDetalle) {
        if (esBasic) {
          subDetalle.textContent = `Canciones: ${subidas}/${LIMITE_BASICO} · Vence el ${formatearFechaLarga(suscripcionActual.fechaVencimiento)}`;
        } else {
          subDetalle.textContent = `Canciones ilimitadas · Vence el ${formatearFechaLarga(suscripcionActual.fechaVencimiento)}`;
        }
      }
      if (subBtn) {
        subBtn.onclick = null;
        if (esBasic) {
          subBtn.textContent = 'Actualizar a Pro 🚀';
          subBtn.disabled = false;
          subBtn.onclick = (e) => { e.preventDefault(); mostrarPaywall(); };
        } else {
          subBtn.textContent = '✅ Activa';
          subBtn.disabled = true;
        }
      }
    }
  } else {
    mostrarPaywall();
    subBox?.classList.add('hidden');
  }

  actualizarBannerLimite();
  renderRetiroInfo();
}

async function guardarSuscripcion(subscriptionId, tipo = 'pro') {
  if (!usuarioActual) return;

  const inicio = new Date();
  const venc   = new Date(inicio);
  venc.setFullYear(venc.getFullYear() + 1);

  const esBasic = tipo === 'basic';

  try {
    await setDoc(doc(db, COLECCION_SUSCRIPCIONES, usuarioActual.uid), {
      uid: usuarioActual.uid,
      email: usuarioActual.email,
      subscriptionId: subscriptionId || '',
      planId: esBasic ? PLAN_ID_BASIC : PLAN_ID_PRO,
      tipo: esBasic ? 'basic' : 'pro',
      precio: esBasic ? PRECIO_BASIC : PRECIO_PRO,
      moneda: 'MXN',
      fechaInicio: serverTimestamp(),
      fechaVencimiento: venc,
      estado: 'activa'
    });

    await cargarSuscripcion(usuarioActual.uid);

    mostrarStatus(
      esBasic
        ? '🎧 ¡Plan OmegaBeats Basic activado! Ya puedes subir 1 canción'
        : '🎉 ¡Plan Artista Pro activado! Ya puedes subir música ilimitada',
      'ok'
    );
  } catch (e) {
    console.error('[Suscripción] Error al guardar:', e);
    mostrarStatus('Error al guardar suscripción: ' + e.message, 'error');
  }
}

function renderPayPalBotones() {
  if (paypalRenderizado) return;
  if (typeof window.paypal === 'undefined') {
    setTimeout(renderPayPalBotones, 300);
    return;
  }

  // BOTÓN BASIC
  const contBasic = document.getElementById('paypal-button-basic');
  if (contBasic && contBasic.dataset.rendered !== '1') {
    contBasic.dataset.rendered = '1';
    contBasic.innerHTML = '';
    try {
      window.paypal.Buttons({
        style: { shape: 'pill', color: 'blue', layout: 'vertical', label: 'subscribe' },
        createSubscription: function (data, actions) {
          return actions.subscription.create({ plan_id: PLAN_ID_BASIC });
        },
        onApprove: async function (data) {
          await guardarSuscripcion(data.subscriptionID, 'basic');
        },
        onError: function (err) {
          console.error('[PayPal Basic] Error:', err);
          mostrarStatus('Error con PayPal: ' + (err?.message || 'Intenta de nuevo'), 'error');
        }
      }).render('#paypal-button-basic');
    } catch (e) { console.error('[PayPal Basic] Render falló:', e); }
  }

  // BOTÓN PRO
  const contPro = document.getElementById('paypal-button-pro');
  if (contPro && contPro.dataset.rendered !== '1') {
    contPro.dataset.rendered = '1';
    contPro.innerHTML = '';
    try {
      window.paypal.Buttons({
        style: { shape: 'pill', color: 'black', layout: 'vertical', label: 'subscribe' },
        createSubscription: function (data, actions) {
          return actions.subscription.create({ plan_id: PLAN_ID_PRO });
        },
        onApprove: async function (data) {
          await guardarSuscripcion(data.subscriptionID, 'pro');
        },
        onError: function (err) {
          console.error('[PayPal Pro] Error:', err);
          mostrarStatus('Error con PayPal: ' + (err?.message || 'Intenta de nuevo'), 'error');
        }
      }).render('#paypal-button-pro');
    } catch (e) { console.error('[PayPal Pro] Render falló:', e); }
  }

  paypalRenderizado = true;
}

paywallLogout?.addEventListener('click', async () => {
  try {
    paywallLogout.disabled = true;
    paywallLogout.textContent = 'Cerrando sesión...';
    await signOut(auth);
  } catch (e) {
    console.error('Error al cerrar sesión:', e);
  } finally {
    paywallLogout.disabled = false;
    paywallLogout.textContent = '🚪 Cerrar sesión';
  }
});

upgradeBtn?.addEventListener('click', () => {
  mostrarPaywall();
});

// ============ RETIROS ============
function calcularTotalGanancias() {
  let total = 0;
  (cancionesActuales || []).forEach(c => {
    const stats = obtenerStatsDeCancion(c);
    total += (stats.oyentes || 0) * PAGO_POR_OYENTE;
  });
  return total;
}
function retiroDisponible() {
  if (!estaSuscripcionActiva()) return { disponible: false, razon: 'Necesitas una suscripción activa' };
  if (esPlanBasico())            return { disponible: false, razon: 'Requiere plan Pro' };
  if (!suscripcionActual?.ultimoRetiro) return { disponible: true, proximo: 'Disponible ahora' };
  const ult = suscripcionActual.ultimoRetiro;
  const fechaUlt = ult.toDate ? ult.toDate() : new Date(ult);
  const prox = new Date(fechaUlt);
  prox.setMonth(prox.getMonth() + MESES_ENTRE_RETIROS);
  if (prox.getTime() <= Date.now()) return { disponible: true, proximo: 'Disponible ahora' };
  return { disponible: false, proximo: 'Próximo retiro: ' + formatearFechaLarga(prox) };
}
function renderRetiroInfo() {
  if (!retiroBtn || !retiroInfo) return;

  if (!estaSuscripcionActiva()) {
    retiroInfo.textContent = 'Requiere suscripción activa';
    retiroBtn.disabled = true;
    retiroBtn.textContent = 'Solicitar retiro';
    return;
  }
  if (esPlanBasico()) {
    retiroInfo.textContent = '🔒 Requiere plan Pro';
    retiroBtn.disabled = true;
    retiroBtn.textContent = '🔒 Actualiza a Pro';
    return;
  }
  const estado = retiroDisponible();
  const total = calcularTotalGanancias();
  retiroInfo.textContent = `${estado.proximo} · Saldo: ${fmtDinero(total)}`;
  if (estado.disponible && total > 0) {
    retiroBtn.disabled = false;
    retiroBtn.textContent = `Solicitar retiro (${fmtDinero(total)})`;
  } else {
    retiroBtn.disabled = true;
    retiroBtn.textContent = 'Solicitar retiro';
  }
}
async function solicitarRetiro() {
  if (!usuarioActual || !estaSuscripcionActiva()) return;
  if (esPlanBasico()) { mostrarStatus('Requiere plan Pro para retirar', 'error'); return; }

  const estado = retiroDisponible();
  if (!estado.disponible) { mostrarStatus(estado.proximo || 'Aún no puedes retirar', 'error'); return; }
  const total = calcularTotalGanancias();
  if (total <= 0) { mostrarStatus('No tienes ganancias para retirar todavía', 'error'); return; }
  if (!confirm(`¿Solicitar retiro de ${fmtDinero(total)}?\nSe procesará en un plazo de 5-7 días hábiles.`)) return;

  retiroBtn.disabled = true;
  retiroBtn.innerHTML = '<span class="loader"></span>Enviando...';
  try {
    await addDoc(collection(db, 'retiros', usuarioActual.uid, 'solicitudes'), {
      uid: usuarioActual.uid, email: usuarioActual.email,
      monto: total, moneda: 'MXN', estado: 'pendiente',
      metodo: 'PayPal', fecha: serverTimestamp()
    });
    await updateDoc(doc(db, COLECCION_SUSCRIPCIONES, usuarioActual.uid), {
      ultimoRetiro: serverTimestamp()
    });
    suscripcionActual.ultimoRetiro = { seconds: Date.now() / 1000 };
    mostrarStatus('✅ Solicitud de retiro enviada correctamente', 'ok');
  } catch (e) {
    console.error('[Retiro] Error:', e);
    mostrarStatus('Error al solicitar retiro: ' + e.message, 'error');
  } finally {
    renderRetiroInfo();
  }
}
retiroBtn?.addEventListener('click', solicitarRetiro);

// ============ Observador auth para suscripción ============
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await cargarSuscripcion(user.uid);
    renderPayPalBotones();
  } else {
    ocultarPaywall();
    suscripcionActual = null;
    subBox?.classList.add('hidden');
    limiteBanner?.classList.add('hidden');
    if (retiroBtn)  retiroBtn.disabled = true;
    if (retiroInfo) retiroInfo.textContent = '—';
  }
});

statsBtn?.addEventListener('click', () => setTimeout(renderRetiroInfo, 250));
