const SESSION_LOST = "hound:session-lost";

/** Avisa a la interfaz que la API rechazó la sesión de personal. */
export function notifySessionLost() {
  window.dispatchEvent(new Event(SESSION_LOST));
}

export function onSessionLost(listener: () => void) {
  window.addEventListener(SESSION_LOST, listener);
  return () => window.removeEventListener(SESSION_LOST, listener);
}
