import { TestEnvironment as JsdomEnvironment } from "jest-environment-jsdom";

/**
 * jsdom con las clases de la API Fetch de Node. jsdom no implementa `fetch`, `Headers`,
 * `Request` ni `Response`, y el repositorio HTTP y las pruebas de la API las necesitan.
 * `fetch` no se expone a propósito: ninguna prueba toca la red (src/test/setup.ts lo sustituye).
 */
export default class HoundJsdomEnvironment extends JsdomEnvironment {
  constructor(config, context) {
    super(config, context);
    // React Router usa TextEncoder al cargarse; jsdom tampoco lo trae.
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder;
    this.global.Headers = Headers;
    this.global.Request = Request;
    this.global.Response = Response;
  }
}
