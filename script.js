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
const tutorialBtn  = document.getElementById('tutorialBtn');

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

  // 👇 Intercepta modo álbum (Enter desde cualquier input)
  if (modoSubida === 'album') { subirAlbum(); return; }

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
  formLocked?.classList.remove('hidden
