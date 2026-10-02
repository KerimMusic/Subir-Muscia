import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, onAuthStateChanged, signOut,
  setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, serverTimestamp, onSnapshot,
  deleteDoc, doc, updateDoc, getDoc, setDoc, getDocs, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn('[WebView] Persistencia:', err);
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
    }
  });

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

const formLocked   = document.getElementById('formLocked');
const lockMessage  = document.getElementById('lockMessage');
const verSuscBtn   = document.getElementById('verSuscBtn');

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

function mostrarStatus(msg, tipo = 'ok') {
  status.textContent = msg;
  status.className = 'status ' + tipo;
  if (tipo === 'ok') setTimeout(() => { status.className = 'status'; }, 4000);
}

function dropboxDirecto(url) {
  if (!url) return '';
  return url.trim()
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
  return (Number(n) || 0).toLocaleString('es-MX');
}
function fmtDinero(n) {
  return '$' + (Number(n) || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }) + ' MXN';
}
function normalizarTitulo(t) {
  return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

function crearFilaColaborador(valor = '') {
  const row = document.createElement('div');
  row.className = 'collaborator-row';
  row.innerHTML = `
    <input type="text" class="collaborator-input" placeholder="Ej: Nombre del colaborador" value="${escapeHtml(valor)}">
    <button type="button" class="btn-remove-collab" aria-label="Eliminar colaborador">✕</button>
  `;
  row.querySelector('.btn-remove-collab').addEventListener('click', () => row.remove());
  return row;
}
function agregarColaboradorAlContenedor(c) {
  if (c) c.appendChild(crearFilaColaborador(''));
}
function obtenerColaboradoresDe(c) {
  if (!c) return [];
  return Array.from(c.querySelectorAll('.collaborator-input'))
    .map(i => i.value.trim()).filter(v => v !== '');
}
function cargarColaboradoresEn(c, lista) {
  if (!c) return;
  c.innerHTML = '';
  const l = Array.isArray(lista) ? lista.filter(Boolean) : [];
  if (l.length === 0) c.appendChild(crearFilaColaborador(''));
  else l.forEach(n => c.appendChild(crearFilaColaborador(n)));
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
function obtenerStatsDeCancion(c) {
  if (!c) return { oyentes: 0, docId: null };
  const cands = [c.titulo, c.title, c.nombre, c.id];
  for (const x of cands) {
    if (!x) continue;
    const key = normalizarTitulo(x);
    const s = statsOyentes[key];
    if (s) return s;
  }
  return { oyentes: 0, docId: null };
}

loginBtn.addEventListener('click', async () => {
  try {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loader"></span>Iniciando sesión...';
    if (esWebView()) { await signInWithRedirect(auth, provider); return; }
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error('[Auth] Error login:', e);
    const fallback = e.code === 'auth/popup-blocked' ||
      e.code === 'auth/operation-not-supported-in-this-environment' ||
      e.code === 'auth/web-storage-unsupported';
    if (fallback) {
      try { await signInWithRedirect(auth, provider); return; }
      catch (e2) { mostrarStatus('Error: ' + e2.message, 'error'); }
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
    historySection.classList.remove('hidden');
    userEmail.textContent = user.email;
    menuWrap.classList.remove('hidden');
    escucharHistorial(user.uid);
    escucharOyentesCanciones();

    escucharSuscripcion(user.uid);
    escucharUsuario(user.uid);
    detectarAdmin(user);
    actualizarAccesoSubida();
  } else {
    loginBtn.classList.remove('hidden');
    loginBtn.disabled = false;
    loginBtn.innerHTML = LOGIN_BTN_HTML;
    userBox.classList.add('hidden');
    form.classList.add('hidden');
    formLocked?.classList.add('hidden');
    historySection.classList.add('hidden');
    menuWrap.classList.add('hidden');
    cerrarMenu();

    if (unsubscribeHistorial) { unsubscribeHistorial(); unsubscribeHistorial = null; }
    if (unsubscribeOyentes) { unsubscribeOyentes(); unsubscribeOyentes = null; }
    if (unsubscribeSusc) { unsubscribeSusc(); unsubscribeSusc = null; }
    if (unsubscribeUsuario) { unsubscribeUsuario(); unsubscribeUsuario = null; }

    suscripcionActual = null;
    esAdminSusc = false;
    planGratisUsado = false;
    document.getElementById('btn-admin')?.remove();

    historyList.innerHTML = '';
    historyCount.textContent = '0';
    historyEmpty.classList.add('hidden');
    cancionesActuales = [];
    statsOyentes = {};
    cerrarPlayer();
    cerrarEditModal();
    cerrarStatsModal();
    actualizarAccesoSubida();
  }
});

['artista', 'titulo', 'imagen', 'album'].forEach(id => {
  document.getElementById(id).addEventListener('input', actualizarPreview);
});

function actualizarPreview() {
  const artista = document.getElementById('artista').value.trim();
  const titulo  = document.getElementById('titulo').value.trim();
  const imagen  = document.getElementById('imagen').value.trim();
  const album   = document.getElementById('album').value.trim();

  if (!artista && !titulo && !imagen && !album) {
    preview.classList.remove('show'); return;
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
    mostrarStatus('Error: ' + err.message, 'error');
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
      const cands = [d.id, data.titulo, data.title, data.nombre, data.cancion, data.song];
      cands.forEach(c => {
        if (!c) return;
        const key = normalizarTitulo(c);
        if (key && !mapa[key]) mapa[key] = stats;
      });
    });
    statsOyentes = mapa;
    if (statsAbierto) renderStats(cancionesActuales);
  }, (err) => { console.error('Error oyentes:', err); });
}

async function asegurarRegistroOyentes(titulo) {
  if (!titulo) return;
  const key = normalizarTitulo(titulo);
  if (statsOyentes[key]) return;
  try {
    const ref = doc(db, COLECCION_OYENTES, titulo);
    const snap = await getDoc(ref);
    if (snap.exists()) return;
    await setDoc(ref, { oyentes: 0 });
  } catch (e) { console.warn(e); }
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
    const snapNuevo = await getDoc(doc(db, COLECCION_OYENTES, tituloNuevo));
    const existeNuevo = snapNuevo.exists();
    if (contenidoAntiguo) {
      if (existeNuevo) {
        const datosNuevos = snapNuevo.data() || {};
        const oyentesAntiguos = contenidoAntiguo.oyentes || {};
        const oyentesNuevos   = datosNuevos.oyentes     || {};
        let oyentesFinales;
        const ambosMapas = oyentesAntiguos && typeof oyentesAntiguos === 'object' && !Array.isArray(oyentesAntiguos) &&
                           oyentesNuevos   && typeof oyentesNuevos   === 'object' && !Array.isArray(oyentesNuevos);
        if (ambosMapas) oyentesFinales = { ...oyentesAntiguos, ...oyentesNuevos };
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
  } catch (e) { console.warn(e); }
}

async function eliminarRegistroOyentes(cancion) {
  if (!cancion || !cancion.titulo) return;
  const stats = obtenerStatsDeCancion(cancion);
  const docId = stats.docId || cancion.titulo;
  try { await deleteDoc(doc(db, COLECCION_OYENTES, docId)); }
  catch (e) { console.warn(e); }
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
      </div>
    `;
  }).join('');
}

historyList.addEventListener('click', (e) => {
  const del = e.target.closest('.btn-delete');
  if (del) {
    const id = del.dataset.id;
    const item = del.closest('.history-item');
    const titulo = item?.querySelector('.history-info strong')?.textContent || 'esta canción';
    const cancion = cancionesActuales.find(c => c.id === id);
    eliminarCancion(id, del, titulo, cancion);
    return;
  }
  const edit = e.target.closest('.btn-edit');
  if (edit) {
    const id = edit.dataset.id;
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
  if (!window.tieneAccesoVigente()) {
    mostrarStatus('Necesitas una suscripción activa.', 'error');
    abrirModalSusc('modal-susc');
    return;
  }
  if (!confirm(`¿Seguro que quieres eliminar "${titulo}"?\nEsta acción no se puede deshacer.`)) return;
  try {
    boton.disabled = true;
    boton.textContent = '⏳';
    await deleteDoc(doc(db, 'historial_usuarios', usuarioActual.uid, 'canciones', id));
    if (cancion) await eliminarRegistroOyentes(cancion);
    mostrarStatus('🗑️ Canción eliminada correctamente', 'ok');
  } catch (err) {
    console.error('Error al eliminar:', err);
    mostrarStatus('Error al eliminar: ' + err.message, 'error');
    boton.disabled = false;
    boton.textContent = '🗑️';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!usuarioActual) { mostrarStatus('Debes iniciar sesión primero', 'error'); return; }

  if (!window.tieneAccesoVigente()) {
    mostrarStatus('Necesitas una suscripción activa para subir música.', 'error');
    abrirModalSusc('modal-susc');
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
  mostrarStatus('Verificando audio de Dropbox...', 'loading');

  try {
    const res = await fetch(audioUrl, { method: 'HEAD' });
    if (!res.ok) throw new Error('Audio no responde');
  } catch (err) { console.warn('Validación audio:', err); }

  try {
    submitBtn.innerHTML = '<span class="loader"></span>Guardando...';
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
  } catch (err) { console.warn(err); }
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

function abrirEditModal(cancion) {
  if (!cancion) return;
  if (!window.tieneAccesoVigente()) {
    mostrarStatus('Necesitas una suscripción activa.', 'error');
    abrirModalSusc('modal-susc');
    return;
  }
  editandoId = cancion.id;
  editArtista.value = cancion.artista || '';
  editTitulo.value  = cancion.titulo  || '';
  editAlbum.value   = cancion.album   || '';
  const rev = (u) => u ? u.replace('dl.dropboxusercontent.com', 'www.dropbox.com') : '';
  editAudio.value   = rev(cancion.audioUrl || '');
  editImagen.value  = rev(cancion.imagenUrl || '');
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
  if (!usuarioActual || !editandoId) { mostrarStatus('Error', 'error'); return; }
  if (!window.tieneAccesoVigente()) {
    mostrarStatus('Necesitas una suscripción activa.', 'error');
    abrirModalSusc('modal-susc');
    return;
  }
  const artista = editArtista.value.trim();
  const titulo = editTitulo.value.trim();
  const album = editAlbum.value.trim();
  const audioRaw = editAudio.value.trim();
  const imagenRaw = editImagen.value.trim();
  const colaboradores = obtenerColaboradoresDe(collabContainerEdit);
  if (!artista || !titulo || !audioRaw) {
    mostrarStatus('Completa artista, título y audio', 'error');
    return;
  }
  const audioUrl = dropboxDirecto(audioRaw);
  const imagenUrl = imagenRaw ? dropboxDirecto(imagenRaw) : '';
  editSubmitBtn.disabled = true;
  editSubmitBtn.innerHTML = '<span class="loader"></span>Guardando...';
  try {
    const uid = usuarioActual.uid;
    const vieja = cancionesActuales.find(c => c.id === editandoId);
    const tituloAntiguo = vieja?.titulo || '';
    await updateDoc(doc(db, 'historial_usuarios', uid, 'canciones', editandoId), {
      artista, titulo, album, colaboradores, audioUrl, imagenUrl,
      fechaEdicion: serverTimestamp()
    });
    await sincronizarOyentesAlEditar(tituloAntiguo, titulo);
    mostrarStatus('✅ Canción actualizada correctamente', 'ok');
    cerrarEditModal();
  } catch (err) {
    console.error(err);
    mostrarStatus('Error: ' + err.message, 'error');
  } finally {
    editSubmitBtn.disabled = false;
    editSubmitBtn.textContent = 'TEREMINAR';
  }
});

editImagen.addEventListener('input', () => {
  const url = editImagen.value.trim();
  editImg.src = url ? dropboxDirecto(url) : PLACEHOLDER;
  editImg.onerror = () => { editImg.src = PLACEHOLDER; };
});

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
  let total = 0;
  statsList.innerHTML = lista.map(c => {
    const img = c.imagenUrl ? escapeHtml(c.imagenUrl) : PLACEHOLDER;
    const titulo  = escapeHtml(c.titulo  || 'Sin título');
    const artista = escapeHtml(c.artista || 'Desconocido');
    const stats = obtenerStatsDeCancion(c);
    const listeners = stats.oyentes || 0;
    const ganancia = listeners * PAGO_POR_OYENTE;
    total += listeners;
    return `
      <div class="stats-item">
        <img src="${img}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
        <div class="stats-item-info">
          <span class="stats-item-title">${titulo}</span>
          <span class="stats-item-artist">${artista}</span>
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
      </div>`;
  }).join('');
  statsTotalListeners.textContent = fmtNumero(total);
  statsTotalEarnings.textContent  = fmtDinero(total * PAGO_POR_OYENTE);
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
    console.error(err);
    mostrarStatus('Error al cerrar sesión: ' + err.message, 'error');
  } finally {
    logoutBtn.disabled = false;
    logoutBtn.innerHTML = '🚪 Cerrar sesión';
  }
});

const GENEROS_RAW = [
  "Regional Mexicano","Reggaetón","Pop","Rock","Hip-Hop / Rap","Música Latina","Cumbia",
  "Electrónica","R&B / Soul","Indie / Alternativo","Metal","Punk","Reggae","Afrobeat",
  "Country","Folk","Jazz","Blues","K-Pop","J-Pop","Cristiana / Gospel","Clásica","Flamenco",
  "Acústica","Instrumental","Soundtrack","Otros",
  "Art Pop","Dance Pop","Electropop","Synth-pop","Indie Pop","Dream Pop","Bedroom Pop",
  "Hyperpop","Teen Pop","Bubblegum Pop","Power Pop","C-Pop","Latin Pop","Europop","Britpop",
  "Alternative Rock","Indie Rock","Hard Rock","Soft Rock","Classic Rock","Progressive Rock",
  "Psychedelic Rock","Garage Rock","Blues Rock","Folk Rock","Southern Rock","Surf Rock",
  "Glam Rock","Art Rock","Experimental Rock","Post-Rock","Math Rock","Noise Rock","Space Rock",
  "Gothic Rock","Industrial Rock","Christian Rock","Grunge","Brit Rock","Emo","Shoegaze","Dream Rock",
  "Heavy Metal","Thrash Metal","Death Metal","Black Metal","Doom Metal","Power Metal","Speed Metal",
  "Progressive Metal","Symphonic Metal","Folk Metal","Groove Metal","Nu Metal","Alternative Metal",
  "Punk Rock","Hardcore Punk","Post-Punk","Pop Punk","Skate Punk","Street Punk",
  "Hip-Hop","Rap","Trap","Drill","Gangsta Rap","Boom Bap","Conscious Hip-Hop","Underground Hip-Hop",
  "Latin Hip-Hop","UK Drill","Grime","Freestyle Rap","Trap Latino",
  "R&B","Contemporary R&B","Alternative R&B","Neo Soul","Soul","Classic Soul","Motown",
  "Funk","P-Funk","Quiet Storm","New Jack Swing","Psychedelic Soul","Gospel Soul","Soul Jazz",
  "Blues","Delta Blues","Chicago Blues","Texas Blues","Electric Blues","Acoustic Blues",
  "Jazz","Bebop","Hard Bop","Cool Jazz","Free Jazz","Fusion","Smooth Jazz","Acid Jazz",
  "Latin Jazz","Gypsy Jazz","Swing","Big Band","Dixieland","Ragtime",
  "Electronic","EDM","House","Deep House","Tech House","Progressive House","Electro House","Future House",
  "Tropical House","Techno","Trance","Psytrance","Electro","Ambient","Chillout","Downtempo",
  "Drum & Bass","Jungle","Dubstep","Future Bass","Synthwave","Vaporwave","Lo-Fi","Chillwave",
  "Reggae","Roots Reggae","Dancehall","Dub","Ska","Reggae Fusion",
  "Música Latina","Latin Urban","Salsa","Bachata","Merengue","Cumbia","Vallenato","Bolero",
  "Tango","Bossa Nova","Samba","Forró","Sertanejo",
  "Mariachi","Ranchera","Norteño","Banda","Corridos","Corrido Tumbado","Corrido Bélico",
  "Tejano","Grupero","Duranguense","Sierreño","Huapango","Son Jarocho",
  "Country","Country Pop","Bluegrass","Americana","Folk","Celtic Folk",
  "Música Clásica","Barroco","Romanticismo","Ópera","Oratorio","Sinfónica",
  "Gospel","Christian","Worship","Contemporary Christian","Hymns",
  "Afrobeat","Afrobeats","Amapiano","Kizomba","Soca","Calypso",
  "K-Pop","J-Pop","J-Rock","City Pop","Bollywood",
  "Film Score","Soundtrack","Video Game Music","Anime Music",
  "A Cappella","Choral","Children's Music",
  "Dance","Dance-Pop","Eurodance","Disco","Nu-Disco",
  "Acústica","Instrumental","Experimental","Avant-Garde"
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
  if (!lista.length) {
    genreList.innerHTML = '';
    genreEmpty.classList.remove('hidden');
    return;
  }
  genreEmpty.classList.add('hidden');
  genreList.innerHTML = lista.map(g => {
    const sel = g === generoSeleccionado;
    return `<button type="button" class="genre-item${sel ? ' selected' : ''}" data-genero="${escapeHtml(g)}">
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
    cerrarSubgeneros();
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
    return `<button type="button" class="genre-item${sel ? ' selected' : ''}" data-subgenero="${escapeHtml(g)}">
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
    const p = genreList.querySelector('.genre-item');
    if (p) seleccionarGenero(p.dataset.genero);
  }
  if (e.key === 'Escape') cerrarGeneros();
});
genreList.addEventListener('click', (e) => {
  const b = e.target.closest('.genre-item');
  if (!b) return;
  seleccionarGenero(b.dataset.genero);
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
    const p = subgenreList.querySelector('.genre-item');
    if (p) seleccionarSubgenero(p.dataset.subgenero);
  }
  if (e.key === 'Escape') cerrarSubgeneros();
});
subgenreList.addEventListener('click', (e) => {
  const b = e.target.closest('.genre-item');
  if (!b) return;
  seleccionarSubgenero(b.dataset.subgenero);
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
   💳 SISTEMA DE SUSCRIPCIÓN
   ═══════════════════════════════════════════════════════════════ */

const PLAN_SUSC = {
  nombre: 'Anual',
  precio: 450,
  mesesDuracion: 12,
  horasLimitePago: 30
};

const PLANES_DISPONIBLES = {
  gratis:   { nombre: 'Gratis',     precio: 0,   mesesDuracion: 3,  etiqueta: '3 meses' },
  omega250: { nombre: 'OmegaBeats', precio: 250, mesesDuracion: 3,  etiqueta: '3 meses' },
  omega450: { nombre: 'OmegaBeats', precio: 450, mesesDuracion: 12, etiqueta: '1 año'   }
};

// Compatibilidad con datos antiguos ('anual')
function obtenerPlan(key) {
  if (!key || key === 'anual') return PLANES_DISPONIBLES.omega450;
  return PLANES_DISPONIBLES[key] || PLANES_DISPONIBLES.omega450;
}

let suscripcionActual = null;
let unsubscribeSusc   = null;
let esAdminSusc       = false;

let planGratisUsado = false;
let unsubscribeUsuario = null;
let planSeleccionadoParaPago = 'omega450';

const tsToDate = (ts) => ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
const fmtFecha = (f) => f ? f.toLocaleDateString('es-MX', {
  day: '2-digit', month: '2-digit', year: 'numeric'
}) : '—';

function abrirModalSusc(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (id === 'modal-susc') actualizarBotonPlanGratis();
  el.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function cerrarModalSusc(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('hidden');
  const abiertos = document.querySelectorAll('.susc-overlay:not(.hidden), .pago-overlay:not(.hidden)');
  if (abiertos.length === 0) document.body.style.overflow = '';
}

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => cerrarModalSusc(btn.dataset.close));
});

/* ✅ LÓGICA DE ACCESO:
   - Si NO hay fecha de vencimiento y está aprobado → acceso concedido.
   - Si HAY fecha de vencimiento → debe estar en el futuro. */
window.tieneAccesoVigente = function() {
  if (!usuarioActual || !suscripcionActual) return false;

  const est = String(suscripcionActual.estado || '').toLowerCase();

  if (est !== 'aprobado' && est !== 'activa') return false;

  const venc = tsToDate(suscripcionActual.fechaVencimiento);

  if (!venc) return true;

  return new Date() < venc;
};

function actualizarAccesoSubida() {
  if (!usuarioActual) {
    form.classList.add('hidden');
    formLocked?.classList.add('hidden');
    return;
  }

  if (window.tieneAccesoVigente()) {
    form.classList.remove('hidden');
    formLocked?.classList.add('hidden');
    return;
  }

  form.classList.add('hidden');
  formLocked?.classList.remove('hidden');

  if (!lockMessage) return;

  const est = String(suscripcionActual?.estado || '').toLowerCase();

  if (!suscripcionActual) {
    lockMessage.textContent = 'Activa tu suscripción para comenzar a subir tu música.';
  } else if (est === 'pendiente') {
    lockMessage.textContent = '🟡 Tu pago está en revisión. Estamos verificando tu comprobante.';
  } else if (est === 'rechazado') {
    lockMessage.textContent = '🔴 Tu pago fue rechazado. Envía un nuevo comprobante para reactivar el acceso.';
  } else if (est === 'expirada') {
    lockMessage.textContent = '⏰ Tu solicitud expiró. Envía el comprobante de nuevo.';
  } else if (est === 'vencido') {
    lockMessage.textContent = '⏰ Tu suscripción ha vencido. Contrata un plan para continuar.';
  } else if (est === 'aprobado' || est === 'activa') {
    lockMessage.textContent = '⏰ Tu suscripción ha vencido. Renueva para continuar subiendo música.';
  } else {
    lockMessage.textContent = 'Activa tu suscripción para comenzar a subir tu música.';
  }
}
window.actualizarAccesoSubida = actualizarAccesoSubida;

async function descargarComprobantePDF(planKey = 'omega450') {
  if (!window.jspdf) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  const plan = obtenerPlan(planKey);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;

  doc.setFillColor(230, 57, 70); doc.rect(0, 0, W, 45, 'F');
  doc.setFillColor(247, 127, 0); doc.rect(0, 40, W, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(28);
  doc.text('OmegaBeats', W / 2, 22, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  doc.text('Comprobante de suscripción', W / 2, 32, { align: 'center' });

  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text('Tipo de SUSCRIPCIÓN', 20, 65);
  doc.setFontSize(12); doc.setFont('helvetica', 'normal');
  doc.text('Plan: ' + plan.nombre + ' (' + plan.etiqueta + ')', 20, 75);
  doc.text('Precio: $' + plan.precio.toFixed(2) + ' MXN', 20, 83);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text('Tiempo válido para realizar el pago:', 20, 100);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
  doc.text('1 día con 6 horas', 20, 108);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text('Datos bancarios', 20, 128);
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(20, 133, 170, 38, 3, 3, 'FD');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold'); doc.text('Banco:', 25, 143);
  doc.setFont('helvetica', 'normal'); doc.text('Nu', 70, 143);
  doc.setFont('helvetica', 'bold'); doc.text('Cuenta:', 25, 153);
  doc.setFont('helvetica', 'normal'); doc.text('5101 2535 2025 4352', 70, 153);
  doc.setFont('helvetica', 'bold'); doc.text('Titular:', 25, 163);
  doc.setFont('helvetica', 'normal'); doc.text('OmegaBeats', 70, 163);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.text('Opcional', 20, 185);
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(20, 190, 170, 28, 3, 3, 'FD');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold'); doc.text('Banco:', 25, 200);
  doc.setFont('helvetica', 'normal'); doc.text('BBVA', 70, 200);
  doc.setFont('helvetica', 'bold'); doc.text('Cuenta:', 25, 210);
  doc.setFont('helvetica', 'normal'); doc.text('4815 1631 9674 1147', 70, 210);
  doc.setFont('helvetica', 'bold'); doc.text('Titular:', 25, 220);
  doc.setFont('helvetica', 'normal'); doc.text('OmegaBeats', 70, 220);

  doc.setFillColor(255, 245, 230);
  doc.roundedRect(20, 228, 170, 22, 3, 3, 'F');
  doc.setTextColor(180, 60, 20);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.text('IMPORTANTE:', 25, 237);
  doc.setFont('helvetica', 'normal');
  doc.text('Conserva tu ticket o los datos del pago hasta que tu suscripción sea aprobada.', 25, 244, { maxWidth: 160 });

  doc.setTextColor(150, 150, 150); doc.setFontSize(9);
  doc.text('OmegaBeats © ' + new Date().getFullYear() + ' — Todos los derechos reservados.',
    W / 2, 285, { align: 'center' });

  doc.save('OmegaBeats-Comprobante-' + planKey + '-' + Date.now() + '.pdf');
}

/* ═══════════ USUARIO — Plan Gratis usado ═══════════ */
function escucharUsuario(uid) {
  if (unsubscribeUsuario) unsubscribeUsuario();
  unsubscribeUsuario = onSnapshot(doc(db, 'usuarios', uid), (snap) => {
    const data = snap.exists() ? snap.data() : {};
    planGratisUsado = !!data.planGratisUsado;
    actualizarBotonPlanGratis();
  }, (err) => console.warn('escucharUsuario:', err));
}

function actualizarBotonPlanGratis() {
  const card = document.querySelector('[data-plan-card="gratis"]');
  const btn  = card?.querySelector('.btn-plan');
  const msg  = document.querySelector('[data-usado="gratis"]');
  if (!btn || !msg) return;
  if (planGratisUsado) {
    btn.classList.add('hidden');
    msg.classList.remove('hidden');
  } else {
    btn.classList.remove('hidden');
    msg.classList.add('hidden');
  }
}

/* ═══════════ ACTIVAR PLAN GRATIS ═══════════ */
async function activarPlanGratis() {
  if (!usuarioActual) { alert('Inicia sesión con Google primero.'); return; }

  if (planGratisUsado) {
    alert('Ya utilizaste el Plan Gratis anteriormente en esta cuenta.');
    return;
  }

  // Doble chequeo contra Firestore
  try {
    const userSnap = await getDoc(doc(db, 'usuarios', usuarioActual.uid));
    if (userSnap.exists() && userSnap.data().planGratisUsado) {
      planGratisUsado = true;
      actualizarBotonPlanGratis();
      alert('Ya utilizaste el Plan Gratis anteriormente en esta cuenta.');
      return;
    }
  } catch (e) { console.warn(e); }

  // Si ya tiene una suscripción activa, no sobreescribir
  if (suscripcionActual && window.tieneAccesoVigente()) {
    alert('Ya tienes una suscripción activa.');
    cerrarModalSusc('modal-susc');
    setTimeout(() => mostrarEstadoSuscripcion(), 150);
    return;
  }

  if (!confirm('¿Activar el Plan Gratis por 3 meses?\n\n⚠️ Solo puede usarse UNA VEZ por cuenta.')) return;

  const ahora = new Date();
  const venc  = new Date(ahora);
  venc.setMonth(venc.getMonth() + PLANES_DISPONIBLES.gratis.mesesDuracion);

  try {
    await setDoc(doc(db, 'suscripciones', usuarioActual.uid), {
      plan: 'gratis',
      precio: 0,
      estado: 'activa',
      fechaInicio: Timestamp.fromDate(ahora),
      fechaVencimiento: Timestamp.fromDate(venc),
      fechaSolicitud: serverTimestamp(),
      fechaAprobacion: serverTimestamp(),
      fechaUltimaActualizacion: serverTimestamp(),
      uid: usuarioActual.uid,
      correo: usuarioActual.email || '',
      nombre: usuarioActual.displayName || '',
      solicitudId: 'FREE-' + usuarioActual.uid.slice(0, 8) + '-' + Date.now()
    }, { merge: true });

    // Marca PERMANENTE de que ya usó el plan gratis
    await setDoc(doc(db, 'usuarios', usuarioActual.uid), {
      planGratisUsado: true,
      planGratisFechaUso: serverTimestamp()
    }, { merge: true });

    planGratisUsado = true;
    actualizarBotonPlanGratis();

    cerrarModalSusc('modal-susc');
    setTimeout(() => mostrarEstadoSuscripcion(), 200);
  } catch (e) {
    console.error('activarPlanGratis:', e);
    alert('Error al activar el Plan Gratis: ' + e.message);
  }
}

/* ═══════════ BOTONES "ELEGIR PLAN" ═══════════ */
document.querySelectorAll('.btn-plan').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!usuarioActual) { alert('Inicia sesión con Google primero.'); return; }

    const planKey = btn.dataset.plan;
    const plan    = PLANES_DISPONIBLES[planKey];
    if (!plan) return;

    if (planKey === 'gratis') { await activarPlanGratis(); return; }

    const estActual = String(suscripcionActual?.estado || '').toLowerCase();

    if (estActual === 'pendiente') {
      cerrarModalSusc('modal-susc');
      setTimeout(() => mostrarEstadoSuscripcion(), 200);
      return;
    }
    if ((estActual === 'aprobado' || estActual === 'activa') && window.tieneAccesoVigente()) {
      cerrarModalSusc('modal-susc');
      setTimeout(() => mostrarEstadoSuscripcion(), 200);
      return;
    }

    planSeleccionadoParaPago = planKey;
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'GENERANDO PDF...';

    try {
      await descargarComprobantePDF(planKey);
      cerrarModalSusc('modal-susc');
      setTimeout(() => {
        const f = document.querySelector('#pagoForm input[name="fechaPago"]');
        if (f && !f.value) f.value = new Date().toISOString().split('T')[0];

        const planInput = document.querySelector('#pagoForm input[name="plan"]');
        if (planInput) {
          planInput.value = 'Plan ' + plan.nombre + ' · $' + plan.precio + ' MXN · ' + plan.etiqueta;
        }
        abrirModalSusc('modal-pago');
      }, 200);
    } catch (e) {
      console.error('Elegir plan:', e);
      alert('No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
});

document.getElementById('pagoForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('pagoMsg');
  const btn = e.target.querySelector('.pago-submit');
  msg.className = 'pago-msg';
  msg.textContent = '';

  if (!usuarioActual) {
    msg.classList.add('error');
    msg.textContent = 'Inicia sesión primero.';
    return;
  }

  const fd = new FormData(e.target);
  const comprobante = fd.get('comprobante').trim();

  if (!fd.get('nombreTitular').trim() || !fd.get('monto') ||
      !fd.get('fechaPago') || !fd.get('referencia').trim() ||
      !fd.get('banco').trim() || !comprobante) {
    msg.classList.add('error');
    msg.textContent = 'Completa todos los campos.';
    return;
  }
  if (!/^https?:\/\//i.test(comprobante)) {
    msg.classList.add('error');
    msg.textContent = 'El enlace debe iniciar con https://';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'ENVIANDO...';
  msg.textContent = 'Guardando solicitud...';

  try {
    const ref = doc(db, 'suscripciones', usuarioActual.uid);
    const snap = await getDoc(ref);
    const previa = snap.exists() ? snap.data() : null;
    const estPrevia = String(previa?.estado || '').toLowerCase();

    if ((estPrevia === 'aprobado' || estPrevia === 'activa') && window.tieneAccesoVigente()) {
      msg.classList.add('ok');
      msg.textContent = '✅ Ya tienes una suscripción activa.';
      setTimeout(() => {
        cerrarModalSusc('modal-pago');
        mostrarEstadoSuscripcion();
      }, 1500);
      return;
    }

    const limiteActual = tsToDate(previa?.fechaLimiteValidacion);
    const yaEnRevision =
      previa &&
      estPrevia === 'pendiente' &&
      previa.fechaSolicitud &&
      (!limiteActual || new Date() < limiteActual);

    const ahora = new Date();
    const fechaLimite = new Date(
      ahora.getTime() + PLAN_SUSC.horasLimitePago * 60 * 60 * 1000
    );

    const planKey  = planSeleccionadoParaPago || 'omega450';
    const planData = obtenerPlan(planKey);

    const datos = {
      nombreTitular: fd.get('nombreTitular').trim(),
      monto:         parseFloat(fd.get('monto')) || 0,
      fechaPago:     fd.get('fechaPago'),
      referencia:    fd.get('referencia').trim(),
      banco:         fd.get('banco').trim(),
      plan:          planKey,
      precio:        planData.precio,
      comprobante,
      uid:           usuarioActual.uid,
      solicitudId:   previa?.solicitudId || ('SOL-' + usuarioActual.uid.slice(0, 8) + '-' + Date.now()),
      nombre:        usuarioActual.displayName || '',
      correo:        usuarioActual.email || '',
      estado:        'pendiente',
      fechaUltimaActualizacion: serverTimestamp()
    };

    if (!yaEnRevision) {
      datos.fechaSolicitud = serverTimestamp();
      datos.fechaLimiteValidacion = Timestamp.fromDate(fechaLimite);
    }

    await setDoc(ref, datos, { merge: true });

    msg.classList.add('ok');
    msg.textContent = yaEnRevision
      ? '🟡 Comprobante actualizado. Tu solicitud SIGUE EN REVISIÓN (no se reinició el tiempo).'
      : '🟡 ¡Comprobante enviado! Tu pago quedó EN REVISIÓN.';

    setTimeout(() => {
      cerrarModalSusc('modal-pago');
      mostrarEstadoSuscripcion();
    }, 1800);
  } catch (err) {
    console.error('Error al enviar:', err);
    msg.classList.add('error');
    msg.textContent = 'Error: ' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'ENVIAR COMPROBANTE';
  }
});

function mostrarEstadoSuscripcion() {
  const cont = document.getElementById('estadoContenido');
  if (!cont) return;

  if (!suscripcionActual) {
    cont.innerHTML = `
      <h1 class="pago-title">💳 Mi suscripción</h1>
      <div class="estado-card">
        <p>No tienes una suscripción registrada.</p>
        <button class="susc-btn" id="btnVerPlanes" style="margin-top:16px;">VER PLANES</button>
      </div>
    `;
    document.getElementById('btnVerPlanes').onclick = () => {
      cerrarModalSusc('modal-estado');
      setTimeout(() => abrirModalSusc('modal-susc'), 120);
    };
    abrirModalSusc('modal-estado');
    return;
  }

  const s = suscripcionActual;
  const est = String(s.estado || '').toLowerCase();
  const venc   = tsToDate(s.fechaVencimiento);
  const inicio = tsToDate(s.fechaInicio);
  const planInfo = obtenerPlan(s.plan);

  let emoji = '🟡', txt = 'PAGO EN REVISIÓN', cls = 'estado-pendiente';

  if (est === 'aprobado' || est === 'activa') {
    const vencida = venc && new Date() >= venc;
    if (vencida) {
      emoji = '🔴'; txt = 'VENCIDO'; cls = 'estado-rechazada';
    } else {
      emoji = '🟢'; txt = 'ACTIVO'; cls = 'estado-activa';
    }
  }
  if (est === 'vencido')   { emoji = '🔴'; txt = 'VENCIDO';            cls = 'estado-rechazada'; }
  if (est === 'rechazado') { emoji = '🔴'; txt = 'PAGO RECHAZADO';    cls = 'estado-rechazada'; }
  if (est === 'expirada')  { emoji = '⏰'; txt = 'SOLICITUD EXPIRADA'; cls = 'estado-expirada'; }

  let avisoTiempo = '';
  if (est === 'pendiente') {
    const limite = tsToDate(s.fechaLimiteValidacion);
    if (limite) {
      const ms = limite - new Date();
      const horas = Math.floor(ms / 3600000);
      const mins  = Math.floor((ms % 3600000) / 60000);
      if (ms > 0) {
        avisoTiempo = `<p style="color:#ffd76a;"><strong>⏱ Tiempo restante de revisión:</strong> ${horas}h ${mins}m</p>`;
      }
    }
  }

  cont.innerHTML = `
    <h1 class="pago-title">💳 Mi suscripción</h1>
    <div class="estado-card">
      <p><span class="estado-badge ${cls}">${emoji} ${txt}</span></p>
      ${avisoTiempo}
      <p style="margin-top:14px;"><strong>ID de solicitud:</strong> ${s.solicitudId || s.uid || '—'}</p>
      <p><strong>Plan actual:</strong> ${planInfo.nombre} — ${planInfo.etiqueta}</p>
      <p><strong>Precio:</strong> $${s.precio ?? s.monto ?? planInfo.precio} MXN</p>
      <p><strong>Titular:</strong> ${s.nombreTitular || '—'}</p>
      <p><strong>Referencia:</strong> ${s.referencia || '—'}</p>
      <p><strong>Banco:</strong> ${s.banco || '—'}</p>
      <p><strong>Fecha de pago:</strong> ${s.fechaPago || '—'}</p>
      <p><strong>Solicitud creada:</strong> ${fmtFecha(tsToDate(s.fechaSolicitud))}</p>
      <p><strong>Última actualización:</strong> ${fmtFecha(tsToDate(s.fechaUltimaActualizacion))}</p>
      <p><strong>Fecha de inicio:</strong> ${fmtFecha(inicio)}</p>
      <p><strong>Fecha de vencimiento:</strong> ${fmtFecha(venc)}</p>
      ${s.comprobante ? `<p><strong>Comprobante:</strong> <a href="${s.comprobante}" target="_blank" style="color:#4ade80;">Ver en Dropbox ↗</a></p>` : ''}
    </div>
    ${(est === 'rechazado' || est === 'expirada' || est === 'vencido' || ((est === 'aprobado' || est === 'activa') && venc && new Date() >= venc))
      ? `<button class="susc-btn" id="btnReenviar" style="background:#e63946;">RENOVAR / CONTRATAR PLAN</button>`
      : ''}
  `;

  document.getElementById('btnReenviar')?.addEventListener('click', () => {
    cerrarModalSusc('modal-estado');
    setTimeout(() => abrirModalSusc('modal-susc'), 120);
  });

  abrirModalSusc('modal-estado');
}

function escucharSuscripcion(uid) {
  if (unsubscribeSusc) unsubscribeSusc();

  unsubscribeSusc = onSnapshot(doc(db, 'suscripciones', uid), async (snap) => {
    suscripcionActual = snap.exists() ? { ...snap.data() } : null;

    const est = String(suscripcionActual?.estado || '').toLowerCase();

    if (est === 'rechazado') {
      try {
        await deleteDoc(doc(db, 'suscripciones', uid));
      } catch (e) {
        console.warn('No se pudo eliminar el doc rechazado:', e.message);
      }
      suscripcionActual = null;
    }

    if (suscripcionActual && String(suscripcionActual.estado || '').toLowerCase() === 'pendiente') {
      const limite = tsToDate(suscripcionActual.fechaLimiteValidacion);
      if (limite && new Date() >= limite) {
        suscripcionActual.estado = 'expirada';
        updateDoc(doc(db, 'suscripciones', uid), { estado: 'expirada' })
          .catch(err => console.warn('No se pudo marcar como expirada:', err.message));
      }
    }

    // Auto-expirar aprobados vencidos
    if (suscripcionActual) {
      const est2 = String(suscripcionActual.estado || '').toLowerCase();
      if (est2 === 'aprobado' || est2 === 'activa') {
        const venc = tsToDate(suscripcionActual.fechaVencimiento);
        if (venc && new Date() >= venc) {
          suscripcionActual.estado = 'vencido';
          updateDoc(doc(db, 'suscripciones', uid), { estado: 'vencido' })
            .catch(err => console.warn('No se pudo marcar como vencido:', err.message));
        }
      }
    }

    actualizarAccesoSubida();
  }, (err) => console.error('Error suscripción:', err));
}

async function detectarAdmin(user) {
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    esAdminSusc = snap.exists();
    document.getElementById('btn-admin')?.remove();
    if (esAdminSusc) {
      const b = document.createElement('button');
      b.id = 'btn-admin';
      b.textContent = '🛡️ Panel admin';
      b.className = 'susc-btn-inline';
      b.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:900;box-shadow:0 8px 24px rgba(0,0,0,0.2);';
      b.onclick = () => { abrirModalSusc('modal-admin'); cargarAdminSuscripciones(); };
      document.body.appendChild(b);
    }
  } catch (e) { console.warn('detectarAdmin:', e); }
}

async function cargarAdminSuscripciones() {
  if (!esAdminSusc) return;
  const cont = document.getElementById('adminLista');
  cont.innerHTML = '<p style="color:#aaa;">Cargando solicitudes…</p>';

  try {
    const snap = await getDocs(collection(db, 'suscripciones'));
    if (snap.empty) {
      cont.innerHTML = '<p style="color:#aaa;">No hay solicitudes.</p>';
      return;
    }

    let html = `<table class="admin-tabla">
      <thead><tr>
        <th>Usuario</th><th>Correo</th><th>Titular</th>
        <th>Plan</th><th>Monto</th><th>Referencia</th><th>Banco</th>
        <th>Fecha</th><th>Estado</th><th>Comprobante</th><th>Acciones</th>
      </tr></thead><tbody>`;

    snap.forEach(d => {
      const s = d.data();
      const est = String(s.estado || '').toLowerCase();
      const planInfo = obtenerPlan(s.plan);

      let badge = 'estado-pendiente', emoji = '🟡';
      if (est === 'aprobado' || est === 'activa') { badge = 'estado-activa';    emoji = '🟢'; }
      if (est === 'rechazado')                    { badge = 'estado-rechazada'; emoji = '🔴'; }
      if (est === 'expirada')                     { badge = 'estado-expirada';  emoji = '⏰'; }
      if (est === 'vencido')                      { badge = 'estado-rechazada'; emoji = '🔴'; }

      html += `<tr>
        <td>${s.nombre || '—'}</td>
        <td style="font-size:11px;">${s.correo || '—'}</td>
        <td>${s.nombreTitular || '—'}</td>
        <td>${planInfo.nombre} — ${planInfo.etiqueta}</td>
        <td>$${s.monto || s.precio || 0}</td>
        <td style="font-size:11px;">${s.referencia || '—'}</td>
        <td>${s.banco || '—'}</td>
        <td style="font-size:11px;">${s.fechaPago || fmtFecha(tsToDate(s.fechaSolicitud))}</td>
        <td><span class="estado-badge ${badge}">${emoji} ${(est || '').toUpperCase()}</span></td>
        <td>${s.comprobante ? `<a href="${s.comprobante}" target="_blank" class="admin-btn ver" style="text-decoration:none;">👁️ Ver</a>` : '—'}</td>
        <td>
          ${!(est === 'aprobado' || est === 'activa') ? `<button class="admin-btn ok" data-uid="${d.id}" data-act="aprobar">✅ Aprobar</button>` : ''}
          <button class="admin-btn no" data-uid="${d.id}" data-act="rechazar">❌ Rechazar y borrar</button>
        </td>
      </tr>`;
    });
    html += '</tbody></table>';
    cont.innerHTML = html;

    cont.querySelectorAll('.admin-btn[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid;
        const act = btn.dataset.act;
        if (act === 'aprobar') aprobarSuscripcion(uid);
        if (act === 'rechazar') rechazarSuscripcion(uid);
      });
    });
  } catch (e) {
    console.error('Error admin:', e);
    cont.innerHTML = '<p style="color:#ff7a7a;">Error al cargar.</p>';
  }
}

async function aprobarSuscripcion(uid) {
  if (!esAdminSusc) return;
  try {
    const snap = await getDoc(doc(db, 'suscripciones', uid));
    const s = snap.exists() ? snap.data() : {};
    const planData = obtenerPlan(s.plan);

    if (!confirm(`¿Aprobar esta suscripción?\nPlan: ${planData.nombre} (${planData.etiqueta})`)) return;

    const ahora = new Date();
    const venc = new Date(ahora);
    venc.setMonth(venc.getMonth() + planData.mesesDuracion);

    await updateDoc(doc(db, 'suscripciones', uid), {
      estado: 'aprobado',
      fechaInicio: Timestamp.fromDate(ahora),
      fechaVencimiento: Timestamp.fromDate(venc),
      fechaAprobacion: serverTimestamp(),
      fechaUltimaActualizacion: serverTimestamp()
    });

    await addDoc(collection(db, 'historial_pagos', uid, 'pagos'), {
      plan: s.plan || 'omega450',
      precio: planData.precio,
      estado: 'aprobado',
      fechaAprobacion: serverTimestamp(),
      fechaInicio: Timestamp.fromDate(ahora),
      fechaVencimiento: Timestamp.fromDate(venc)
    });

    cargarAdminSuscripciones();
  } catch (e) {
    console.error('aprobar:', e);
    alert('Error al aprobar: ' + e.message);
  }
}

async function rechazarSuscripcion(uid) {
  if (!esAdminSusc) return;
  if (!confirm(
    '⚠️ ¿Rechazar y ELIMINAR definitivamente esta solicitud?\n\n' +
    'El documento de /suscripciones/{uid} será borrado.\n' +
    'El usuario tendrá que enviar un comprobante nuevo.'
  )) return;

  try {
    await deleteDoc(doc(db, 'suscripciones', uid));
    cargarAdminSuscripciones();
  } catch (e) {
    console.error('rechazar:', e);
    alert('Error al rechazar: ' + e.message);
  }
}

document.getElementById('suscBtn')?.addEventListener('click', () => {
  cerrarMenu();
  setTimeout(() => {
    if (suscripcionActual) mostrarEstadoSuscripcion();
    else abrirModalSusc('modal-susc');
  }, 120);
});

document.getElementById('verSuscBtn')?.addEventListener('click', () => {
  abrirModalSusc('modal-susc');
});
