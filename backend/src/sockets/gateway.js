let ioInstance = null;

function setSocketServer(io) {
  ioInstance = io;
}

function getSocketServer() {
  return ioInstance;
}

function tenantRoom(tenantId) {
  return `tenant_${tenantId}`;
}

function emitToTenant(tenantId, eventName, payload) {
  if (!ioInstance || !tenantId) {
    return;
  }

  ioInstance.to(tenantRoom(String(tenantId))).emit(eventName, payload);
}

export {
  setSocketServer,
  getSocketServer,
  tenantRoom,
  emitToTenant,
};
