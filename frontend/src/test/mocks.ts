
/** Sustituto de `window.scrollTo` (jsdom no lo implementa). Las pruebas lo consultan para saber si la página volvió arriba. */
export const scrollToMock = jest.fn();
