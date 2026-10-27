// Equivale a `?raw` de Vite: el módulo exporta el contenido del archivo como texto.
export default {
  process(sourceText) {
    return { code: `module.exports = ${JSON.stringify(sourceText)};` };
  },
};
