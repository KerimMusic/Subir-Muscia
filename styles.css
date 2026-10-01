/* ============================================ RESET Y BASE ============================================ */
* {
  margin: 0; padding: 0; box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
body {
  background: #ffffff; color: #000000;
  min-height: 100vh; display: flex; justify-content: center; align-items: center;
  padding: 20px; line-height: 1.5;
}
.container { width: 100%; max-width: 580px; padding: 20px 0; }

/* ============================================ HEADER ============================================ */
.header { text-align: center; margin-bottom: 32px; }
.header h1 { font-size: 28px; font-weight: 700; color: #000; margin-bottom: 4px; letter-spacing: -0.5px; }
.header p { font-size: 13px; color: #555; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; }

/* ============================================ USER BOX ============================================ */
.user-box {
  display: flex; align-items: center; gap: 10px;
  background: #f5f5f5; border: 1px solid #e0e0e0;
  border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;
  font-size: 13px; color: #000; overflow: hidden;
}
.user-box #userEmail { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-box .dot {
  width: 8px; height: 8px; background: #000; border-radius: 50%;
  flex-shrink: 0; animation: pulse 1.8s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; transform: scale(1);} 50% { opacity: .5; transform: scale(.9);} }

/* ============================================ FORMULARIO ============================================ */
.form-group { margin-bottom: 20px; }
label {
  display: block; font-size: 12px; font-weight: 700; color: #000;
  margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.8px;
}
input {
  width: 100%; padding: 14px 16px; background: #fff;
  border: 1.5px solid #d0d0d0; border-radius: 10px; color: #000;
  font-size: 15px; outline: none;
  transition: border-color .2s, box-shadow .2s;
}
input:focus { border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,.08); }
input::placeholder { color: #999; }
.hint { font-size: 11px; color: #777; margin-top: 6px; line-height: 1.4; }

/* ============================================ BOTONES ============================================ */
button {
  width: 100%; padding: 15px; margin-top: 10px;
  background: #000; border: none; border-radius: 10px; color: #fff;
  font-size: 16px; font-weight: 600; cursor: pointer; letter-spacing: .3px;
  transition: background .2s, transform .15s, box-shadow .2s;
}
button:hover:not(:disabled) { background: #222; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,.15); }
button:active:not(:disabled) { transform: translateY(0); box-shadow: none; }
button:disabled { opacity: .4; cursor: not-allowed; }

.btn-google {
  background: #fff; color: #000; border: 1.5px solid #d0d0d0;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  box-shadow: none;
}
.btn-google:hover:not(:disabled) { background: #fafafa; border-color: #000; box-shadow: 0 4px 12px rgba(0,0,0,.08); }

/* ============================================ STATUS ============================================ */
.status {
  margin-top: 18px; padding: 14px; border-radius: 10px; font-size: 14px;
  text-align: center; display: none; line-height: 1.4; border: 1.5px solid transparent;
}
.status.ok { display: block; background: #f0f0f0; border-color: #000; color: #000; }
.status.error { display: block; background: #fff0f0; border-color: #cc0000; color: #cc0000; }
.status.loading { display: block; background: #f5f5f5; border-color: #999; color: #555; }
.hidden { display: none !important; }

/* ============================================ PREVIEW ============================================ */
.preview {
  margin-top: 20px; padding: 16px; background: #fafafa;
  border-radius: 10px; border: 1.5px dashed #d0d0d0;
  display: none; align-items: center; gap: 14px;
}
.preview.show { display: flex; }
.preview img { width: 64px; height: 64px; border-radius: 8px; object-fit: cover; background: #f0f0f0; border: 1px solid #e0e0e0; }
.preview-info { flex: 1; min-width: 0; }
.preview-info strong { display: block; font-size: 15px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #000; }
.preview-info small { color: #555; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
.preview-info .Album {
  display: inline-block; margin-top: 6px; padding: 3px 10px; font-size: 10px;
  font-weight: 700; color: #000; background: #e8e8e8; border: 1px solid #d0d0d0;
  border-radius: 999px; text-transform: uppercase; letter-spacing: 1px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
}
.loader {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .8s linear infinite;
  vertical-align: middle; margin-right: 8px;
}
@keyframes spin { to { transform: rotate(360deg);} }

/* ============================================ COLABORADORES ============================================ */
.collaborators { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.collaborator-row { display: flex; align-items: center; gap: 8px; animation: fadeIn .2s; }
.collaborator-input {
  flex: 1; width: auto; padding: 12px 14px; font-size: 15px;
  background: #fff; border: 1.5px solid #d0d0d0; border-radius: 10px;
  color: #000; outline: none; margin: 0;
  transition: border-color .2s, box-shadow .2s;
}
.collaborator-input:focus { border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,.08); }
.collaborator-input::placeholder { color: #999; }
.btn-remove-collab {
  width: 42px; height: 42px; min-width: 42px; padding: 0; margin: 0;
  border-radius: 10px; background: #f5f5f5; border: 1.5px solid #e0e0e0;
  color: #000; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; box-shadow: none;
  transition: background .18s, border-color .18s, color .18s, transform .15s;
}
.btn-remove-collab:hover:not(:disabled) { background: #cc0000; border-color: #cc0000; color: #fff; transform: scale(1.05); }
.btn-add-collab {
  width: 100%; margin: 0; padding: 12px 16px; background: #fff;
  border: 1.5px dashed #d0d0d0; border-radius: 10px; color: #000;
  font-size: 14px; font-weight: 600; display: flex; align-items: center;
  justify-content: center; gap: 8px; cursor: pointer; box-shadow: none;
  transition: border-color .2s, background .2s, color .2s;
}
.btn-add-collab:hover:not(:disabled) { background: #000; border-color: #000; border-style: solid; color: #fff; }
.btn-add-collab .plus-icon { font-size: 18px; line-height: 1; font-weight: 700; }
.edit-form .collaborator-input { padding: 12px 14px; font-size: 14px; }
.edit-form .btn-add-collab { padding: 11px 14px; font-size: 13px; }

@media (max-width: 420px) {
  .collaborator-input { padding: 11px 12px; font-size: 14px; }
  .btn-remove-collab { width: 38px; height: 38px; min-width: 38px; font-size: 13px; }
  .btn-add-collab { padding: 11px 12px; font-size: 13px; }
}

/* ============================================ HISTORIAL ============================================ */
.history { margin-top: 36px; padding-top: 24px; border-top: 1.5px solid #e8e8e8; }
.history-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.history-header h2 { font-size: 16px; font-weight: 700; color: #000; }
.badge {
  background: #000; color: #fff; font-size: 12px; font-weight: 700;
  padding: 2px 12px; border-radius: 999px; min-width: 30px; text-align: center;
}
.history-list { display: flex; flex-direction: column; gap: 10px; max-height: 360px; overflow-y: auto; padding-right: 4px; }
.history-list::-webkit-scrollbar { width: 5px; }
.history-list::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 999px; }
.history-item {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border: 1.5px solid #e8e8e8; border-radius: 10px;
  padding: 10px 12px; cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
  animation: fadeIn .25s;
}
.history-item:hover { border-color: #000; box-shadow: 0 2px 10px rgba(0,0,0,.06); }
.history-item img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; background: #f0f0f0; flex-shrink: 0; border: 1px solid #e0e0e0; }
.history-info { flex: 1; min-width: 0; }
.history-info strong { display: block; font-size: 14px; font-weight: 600; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.history-info small { display: block; font-size: 11px; color: #555; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.btn-edit, .btn-delete {
  width: 36px; height: 36px; min-width: 36px; padding: 0; margin: 0;
  flex-shrink: 0; border-radius: 8px; background: #f5f5f5;
  border: 1.5px solid #e0e0e0; color: #000; font-size: 15px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: none;
  transition: background .18s, border-color .18s, transform .15s;
}
.btn-edit:hover:not(:disabled), .btn-delete:hover:not(:disabled) { background: #000; border-color: #000; color: #fff; }
.history-empty { font-size: 13px; color: #777; text-align: center; padding: 18px 0; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px);} to { opacity: 1; transform: translateY(0);} }

/* ============================================ MODAL REPRODUCTOR ============================================ */
.player-modal { position: fixed; inset: 0; z-index: 999; display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn .2s; }
.player-modal.hidden { display: none !important; }
.player-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.4); backdrop-filter: blur(4px); }
.player-card {
  position: relative; width: 100%; max-width: 820px; background: #fff;
  border: 1.5px solid #e0e0e0; border-radius: 20px; padding: 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,.12);
  display: grid; grid-template-columns: 240px 1fr;
  grid-template-areas: "cover meta" "cover progress" "cover controls" "cover volume" "cover hint";
  gap: 14px 34px; align-items: center; animation: playerIn .25s;
}
@keyframes playerIn { from { opacity: 0; transform: translateY(14px) scale(.97);} to { opacity: 1; transform: translateY(0) scale(1);} }
.player-close {
  position: absolute; top: 16px; right: 16px;
  width: 36px; height: 36px; min-width: 36px; padding: 0; margin: 0;
  border-radius: 50%; background: #f5f5f5; border: 1.5px solid #e0e0e0;
  color: #000; font-size: 14px; display: flex; align-items: center;
  justify-content: center; cursor: pointer; z-index: 2;
  transition: background .2s, border-color .2s, transform .2s;
}
.player-close:hover { background: #000; border-color: #000; color: #fff; transform: rotate(90deg); }
.player-cover { grid-area: cover; width: 240px; height: 240px; border-radius: 16px; overflow: hidden; background: #f5f5f5; border: 1px solid #e0e0e0; box-shadow: 0 10px 30px rgba(0,0,0,.06); align-self: center; }
.player-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.player-meta { grid-area: meta; padding-right: 48px; min-width: 0; }
.player-meta strong { display: block; font-size: 22px; font-weight: 700; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -.3px; }
.player-meta small { display: block; font-size: 12px; color: #555; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.player-progress { grid-area: progress; display: flex; align-items: center; gap: 12px; font-size: 11px; color: #555; font-variant-numeric: tabular-nums; }
.player-progress span { min-width: 40px; text-align: center; }
.player-progress input[type="range"], .player-volume input[type="range"] {
  -webkit-appearance: none; appearance: none; flex: 1; height: 4px; padding: 0; margin: 0;
  border-radius: 999px; background: #e0e0e0; border: none; outline: none; cursor: pointer; width: auto;
}
.player-progress input[type="range"]::-webkit-slider-thumb, .player-volume input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none; width: 14px; height: 14px;
  border-radius: 50%; background: #000; cursor: pointer; border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,.2);
}
.player-controls { grid-area: controls; display: flex; align-items: center; justify-content: center; gap: 22px; }
.player-btn {
  width: 48px; height: 48px; min-width: 48px; padding: 0; margin: 0;
  border-radius: 50%; background: #f5f5f5; border: 1.5px solid #e0e0e0;
  color: #000; font-size: 16px; display: flex; align-items: center;
  justify-content: center; cursor: pointer; box-shadow: none;
  transition: background .2s, border-color .2s, transform .15s;
}
.player-btn:hover { background: #000; border-color: #000; color: #fff; transform: scale(1.06); }
.player-btn-main { width: 68px; height: 68px; min-width: 68px; font-size: 24px; background: #000; border: none; color: #fff; box-shadow: 0 8px 24px rgba(0,0,0,.15); }
.player-btn-main:hover { background: #222; transform: scale(1.08); }
.player-volume { grid-area: volume; display: flex; align-items: center; gap: 12px; font-size: 14px; color: #555; }
.player-hint { grid-area: hint; font-size: 11px; color: #888; text-align: center; }

@media (max-width: 700px) {
  .player-card { grid-template-columns: 1fr; grid-template-areas: "cover" "meta" "progress" "controls" "volume" "hint"; max-width: 400px; padding: 28px 22px 22px; gap: 16px; }
  .player-cover { width: 180px; height: 180px; justify-self: center; }
  .player-meta { text-align: center; padding-right: 0; }
  .player-meta strong { font-size: 18px; } .player-meta small { font-size: 11px; }
}
@media (max-width: 420px) {
  .container { padding: 16px 0; }
  .player-cover { width: 150px; height: 150px; }
  .player-card { padding: 24px 18px 18px; }
  .player-btn-main { width: 60px; height: 60px; min-width: 60px; font-size: 20px; }
}

/* ============================================ MENÚ ============================================ */
.menu-wrap { position: fixed; top: 18px; right: 18px; z-index: 1000; }
.menu-btn {
  width: 46px; height: 46px; min-width: 46px; padding: 0; margin: 0;
  border-radius: 10px; background: #fff; border: 1.5px solid #d0d0d0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 5px; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,.06);
  transition: border-color .2s, box-shadow .2s, transform .15s;
}
.menu-btn:hover:not(:disabled) { border-color: #000; box-shadow: 0 4px 16px rgba(0,0,0,.1); transform: translateY(-1px); }
.menu-btn span { display: block; width: 20px; height: 2px; border-radius: 999px; background: #000; transition: transform .25s, opacity .2s; }
.menu-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.menu-btn.open span:nth-child(2) { opacity: 0; }
.menu-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
.menu-dropdown {
  position: absolute; top: calc(100% + 10px); right: 0; min-width: 210px;
  background: #fff; border: 1.5px solid #e0e0e0; border-radius: 12px;
  padding: 8px; box-shadow: 0 12px 40px rgba(0,0,0,.1);
  animation: menuIn .18s;
}
@keyframes menuIn { from { opacity: 0; transform: translateY(-6px) scale(.97);} to { opacity: 1; transform: translateY(0) scale(1);} }
.menu-item {
  width: 100%; margin: 0; padding: 12px 14px; background: transparent;
  border: none; border-radius: 8px; color: #000; font-size: 14px;
  font-weight: 600; text-align: left; display: flex; align-items: center;
  gap: 10px; cursor: pointer; box-shadow: none; transition: background .18s;
}
.menu-item:hover:not(:disabled) { background: #f5f5f5; }
@media (max-width: 420px) {
  .menu-wrap { top: 12px; right: 12px; }
  .menu-btn { width: 42px; height: 42px; min-width: 42px; }
}

/* ============================================ MODAL EDITAR ============================================ */
.edit-modal { position: fixed; inset: 0; z-index: 1001; display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn .2s; }
.edit-modal.hidden { display: none !important; }
.edit-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.4); backdrop-filter: blur(4px); }
.edit-card {
  position: relative; width: 100%; max-width: 860px; max-height: 90vh; overflow-y: auto;
  background: #fff; border: 1.5px solid #e0e0e0; border-radius: 20px; padding: 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,.12); display: flex; flex-direction: row;
  gap: 34px; align-items: stretch; animation: playerIn .25s;
}
.edit-close {
  position: absolute; top: 16px; right: 16px;
  width: 36px; height: 36px; min-width: 36px; padding: 0; margin: 0;
  border-radius: 50%; background: #f5f5f5; border: 1.5px solid #e0e0e0;
  color: #000; font-size: 14px; display: flex; align-items: center;
  justify-content: center; cursor: pointer; z-index: 2;
  transition: background .2s, border-color .2s, transform .2s;
}
.edit-close:hover { background: #000; border-color: #000; color: #fff; transform: rotate(90deg); }
.edit-cover { flex: 1; max-width: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.edit-cover img { width: 100%; aspect-ratio: 1/1; border-radius: 16px; object-fit: cover; border: 1px solid #e0e0e0; box-shadow: 0 10px 30px rgba(0,0,0,.06); background: #f5f5f5; }
.edit-content { flex: 1.5; display: flex; flex-direction: column; }
.edit-heading { font-size: 24px; font-weight: 700; color: #000; margin-bottom: 24px; text-align: center; letter-spacing: .5px; }
.edit-form .form-group { margin-bottom: 14px; }
.edit-form label { color: #000; font-size: 11px; letter-spacing: 1px; }
.edit-form input { background: #fff; border: 1.5px solid #d0d0d0; color: #000; padding: 12px 14px; }
.edit-form input:focus { border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,.08); }
.btn-edit-submit {
  width: 100%; padding: 16px; margin-top: 10px; background: #000;
  border: none; border-radius: 10px; color: #fff; font-size: 18px;
  font-weight: 700; cursor: pointer; letter-spacing: .5px;
  transition: background .2s, transform .15s, box-shadow .2s;
}
.btn-edit-submit:hover:not(:disabled) { background: #222; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,.15); }
@media (max-width: 700px) {
  .edit-card { flex-direction: column; padding: 28px 22px 22px; gap: 16px; max-width: 400px; }
  .edit-cover { max-width: 180px; margin: 0 auto; }
  .edit-heading { font-size: 20px; margin-bottom: 16px; }
}

/* ============================================ SELECTOR DE GÉNERO ============================================ */
.genre-select { position: relative; width: 100%; }
.genre-toggle {
  width: 100%; margin: 0; padding: 14px 16px; background: #fff;
  border: 1.5px solid #d0d0d0; border-radius: 10px; color: #000;
  font-size: 15px; font-weight: 500; display: flex; align-items: center;
  justify-content: space-between; gap: 10px; text-align: left;
  cursor: pointer; box-shadow: none;
  transition: border-color .2s, box-shadow .2s;
}
.genre-toggle:hover:not(:disabled) { border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,.06); }
.genre-toggle[aria-expanded="true"] { border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,.08); }
.genre-value { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.genre-value.placeholder { color: #999; }
.genre-arrow { flex-shrink: 0; font-size: 12px; color: #555; transition: transform .2s; }
.genre-toggle[aria-expanded="true"] .genre-arrow { transform: rotate(180deg); }
.genre-panel {
  position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 80;
  background: #fff; border: 1.5px solid #e0e0e0; border-radius: 12px;
  padding: 10px; box-shadow: 0 12px 40px rgba(0,0,0,.12);
  animation: genreIn .18s;
}
@keyframes genreIn { from { opacity: 0; transform: translateY(-6px) scale(.98);} to { opacity: 1; transform: translateY(0) scale(1);} }
.genre-search { width: 100%; padding: 11px 14px; font-size: 14px; border: 1.5px solid #d0d0d0; border-radius: 9px; background: #fafafa; }
.genre-search:focus { background: #fff; border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,.08); }
.genre-list { margin-top: 8px; max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; padding-right: 2px; }
.genre-list::-webkit-scrollbar { width: 5px; }
.genre-list::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 999px; }
.genre-item {
  width: 100%; margin: 0; padding: 10px 12px; background: transparent;
  border: none; border-radius: 8px; color: #000; font-size: 14px;
  font-weight: 500; text-align: left; display: flex; align-items: center;
  justify-content: space-between; gap: 10px; cursor: pointer;
  box-shadow: none; transition: background .15s, color .15s;
}
.genre-item:hover:not(:disabled) { background: #f5f5f5; }
.genre-item.selected, .genre-item.selected:hover:not(:disabled) { background: #000; color: #fff; }
.genre-item .check { flex-shrink: 0; font-size: 12px; opacity: 0; }
.genre-item.selected .check { opacity: 1; }
.genre-empty { font-size: 13px; color: #777; text-align: center; padding: 16px 0; }

/* ============================================ MODAL ESTADÍSTICAS ============================================ */
.stats-modal { position: fixed; inset: 0; z-index: 1002; display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn .2s; }
.stats-modal.hidden { display: none !important; }
.stats-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); backdrop-filter: blur(4px); }
.stats-card {
  position: relative; width: 100%; max-width: 720px; max-height: 90vh; overflow-y: auto;
  background: #fff; border: 1.5px solid #e0e0e0; border-radius: 20px; padding: 32px 28px 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,.15); animation: playerIn .25s;
}
.stats-close {
  position: absolute; top: 16px; right: 16px;
  width: 36px; height: 36px; min-width: 36px; padding: 0; margin: 0;
  border-radius: 50%; background: #f5f5f5; border: 1.5px solid #e0e0e0;
  color: #000; font-size: 14px; display: flex; align-items: center;
  justify-content: center; cursor: pointer; z-index: 2;
  transition: background .2s, border-color .2s, transform .2s;
}
.stats-close:hover { background: #000; border-color: #000; color: #fff; transform: rotate(90deg); }
.stats-heading { font-size: 22px; font-weight: 700; color: #000; text-align: center; margin-bottom: 22px; padding-right: 40px; }
.stats-list { display: flex; flex-direction: column; gap: 12px; max-height: 46vh; overflow-y: auto; padding-right: 4px; margin-bottom: 20px; }
.stats-list::-webkit-scrollbar { width: 5px; }
.stats-list::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 999px; }
.stats-item { display: grid; grid-template-columns: 56px 1fr; gap: 12px; align-items: center; background: #fafafa; border: 1.5px solid #e8e8e8; border-radius: 12px; padding: 12px 14px; }
.stats-item:hover { border-color: #000; box-shadow: 0 2px 10px rgba(0,0,0,.06); }
.stats-item img { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; background: #f0f0f0; border: 1px solid #e0e0e0; grid-row: span 2; }
.stats-item-info { min-width: 0; }
.stats-item-title { display: block; font-size: 14px; font-weight: 700; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stats-item-artist { display: block; font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stats-item-grid { grid-column: 2; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px; }
.stats-cell { background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 7px 8px; text-align: center; }
.stats-cell-label { display: block; font-size: 9px; font-weight: 700; color: #777; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 3px; }
.stats-cell-value { display: block; font-size: 13px; font-weight: 700; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stats-cell.earn .stats-cell-value { color: #0a7d3a; }
.stats-empty { font-size: 13px; color: #777; text-align: center; padding: 20px 0; }
.stats-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #000; border-radius: 14px; padding: 16px; margin-bottom: 12px; }
.stats-summary-item { display: flex; flex-direction: column; gap: 4px; text-align: center; min-width: 0; }
.stats-summary-label { font-size: 10px; font-weight: 700; color: #ccc; text-transform: uppercase; letter-spacing: .6px; }
.stats-summary-value { font-size: 16px; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stats-summary-earnings .stats-summary-value { color: #4ade80; }
.stats-hint { font-size: 11px; color: #888; text-align: center; line-height: 1.4; }
@media (max-width: 640px) {
  .stats-card { padding: 26px 18px 20px; border-radius: 16px; max-height: 92vh; }
  .stats-heading { font-size: 18px; margin-bottom: 16px; }
  .stats-list { max-height: 42vh; gap: 10px; }
  .stats-item { grid-template-columns: 48px 1fr; padding: 10px; }
  .stats-item img { width: 48px; height: 48px; }
  .stats-item-grid { gap: 5px; }
  .stats-cell { padding: 6px 4px; }
  .stats-cell-label { font-size: 8px; }
  .stats-cell-value { font-size: 11px; }
  .stats-summary { grid-template-columns: 1fr; gap: 10px; padding: 14px; }
  .stats-summary-item { flex-direction: row; justify-content: space-between; align-items: center; }
  .stats-summary-value { font-size: 15px; }
}

/* ============================================ SUSCRIPCIÓN BOX ============================================ */
.sub-box {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; background: #f8f8f8; border: 1.5px solid #e0e0e0;
  border-radius: 10px; padding: 12px 14px; margin-bottom: 20px;
  animation: fadeIn .25s;
}
.sub-box.inactiva { background: #fff8e8; border-color: #e0b000; }
.sub-info { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
.sub-icon { font-size: 20px; flex-shrink: 0; }
.sub-text { display: flex; flex-direction: column; min-width: 0; }
.sub-text strong { font-size: 13px; font-weight: 700; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sub-text small { font-size: 11px; color: #666; font-weight: 500; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.btn-sub {
  width: auto; margin: 0; padding: 9px 16px; font-size: 12px;
  font-weight: 700; letter-spacing: .4px; border-radius: 8px;
  background: #000; color: #fff; border: none; white-space: nowrap;
  flex-shrink: 0; box-shadow: none; transition: background .2s;
}
.btn-sub:hover:not(:disabled) { background: #222; }
.btn-sub:disabled { opacity: .5; cursor: default; }

/* ============================================ PAYWALL ============================================ */
.paywall {
  position: fixed; inset: 0; z-index: 9999;
  background: #ffffff; display: flex; align-items: center; justify-content: center;
  padding: 24px; overflow-y: auto; animation: fadeIn .3s ease;
}
.paywall.hidden { display: none !important; }

.paywall-card {
  width: 100%; max-width: 460px;
  background: #fff; border: 1.5px solid #e0e0e0; border-radius: 20px;
  padding: 32px 28px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  text-align: center; animation: playerIn .35s ease;
}

.paywall-brand { margin-bottom: 24px; }
.paywall-brand h1 {
  font-size: 26px; font-weight: 700; color: #000;
  letter-spacing: -0.5px; margin-bottom: 4px;
}
.paywall-brand p {
  font-size: 11px; font-weight: 700; color: #777;
  letter-spacing: 2px; text-transform: uppercase;
}

.paywall-title {
  font-size: 20px; font-weight: 700; color: #000;
  margin-bottom: 8px; letter-spacing: -0.3px;
}
.paywall-subtitle {
  font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 20px;
}

.paywall-price {
  font-size: 40px; font-weight: 800; color: #000;
  letter-spacing: -1.5px; margin-bottom: 22px; line-height: 1;
}
.paywall-price span {
  display: block; font-size: 12px; font-weight: 700; color: #777;
  letter-spacing: 1.5px; text-transform: uppercase;
  margin-top: 6px;
}

.paywall-benefits {
  list-style: none; background: #fafafa;
  border: 1.5px solid #e8e8e8; border-radius: 12px;
  padding: 16px 18px; margin-bottom: 22px;
  display: flex; flex-direction: column; gap: 11px;
  text-align: left;
}
.paywall-benefits li {
  font-size: 14px; font-weight: 500; color: #000; line-height: 1.4;
}

.paywall-paypal { margin-bottom: 14px; min-height: 50px; }

.paywall-hint {
  font-size: 11px; color: #888; line-height: 1.4; margin-bottom: 16px;
}

.paywall-logout {
  width: 100%; margin: 0; padding: 12px;
  background: #f5f5f5; color: #666;
  border: 1.5px solid #e0e0e0; border-radius: 10px;
  font-size: 13px; font-weight: 600;
  cursor: pointer; box-shadow: none;
  transition: background .2s, color .2s, border-color .2s;
}
.paywall-logout:hover:not(:disabled) {
  background: #fff; color: #000; border-color: #000;
  transform: none; box-shadow: none;
}

@media (max-width: 420px) {
  .paywall-card { padding: 26px 18px 20px; }
  .paywall-brand h1 { font-size: 22px; }
  .paywall-title { font-size: 18px; }
  .paywall-price { font-size: 34px; }
  .paywall-benefits li { font-size: 13px; }
}

/* ============================================ RETIRO ============================================ */
.retiro-section {
  display: flex; flex-direction: column; gap: 10px;
  background: #f8faf8; border: 1.5px solid #d6e6d6;
  border-radius: 12px; padding: 14px 16px; margin-bottom: 12px;
}
.retiro-header { display: flex; align-items: center; gap: 10px; }
.retiro-icon { font-size: 22px; }
.retiro-header > div { display: flex; flex-direction: column; min-width: 0; }
.retiro-header strong { font-size: 13px; font-weight: 700; color: #000; }
.retiro-header small { font-size: 11px; color: #666; margin-top: 1px; line-height: 1.3; }
.btn-retiro {
  width: 100%; margin: 0; padding: 12px;
  font-size: 14px; font-weight: 700;
  border-radius: 10px; background: #0a7d3a; color: #fff; border: none;
  cursor: pointer; transition: background .2s, transform .15s;
}
.btn-retiro:hover:not(:disabled) { background: #086b30; transform: translateY(-1px); }
.btn-retiro:disabled { background: #d0d0d0; color: #666; cursor: not-allowed; opacity: .7; }
