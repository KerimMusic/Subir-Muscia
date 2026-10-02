match /suscripciones/{uid} {
  allow read: if isOwner(uid) || isAdmin() || esAdminPanel();

  allow create, update: if isOwner(uid)
    && request.resource.data.uid == uid
    && request.resource.data.estado in ['pendiente', 'rechazada']
    && (!('fechaInicio' in request.resource.data)
        || request.resource.data.fechaInicio == null)
    && (!('fechaVencimiento' in request.resource.data)
        || request.resource.data.fechaVencimiento == null);

  allow update: if esAdminPanel()
    && request.resource.data.diff(resource.data)
         .affectedKeys().hasOnly(['estado']);

  // 🆕 Permite al admin whitelist borrar la solicitud rechazada
  allow delete: if esAdminPanel();

  allow write: if isAdmin();
}
