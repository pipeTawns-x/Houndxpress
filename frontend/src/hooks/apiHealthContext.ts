import { createContext } from "react";
import type { ApiHealthStatus } from "./useApiHealth.ts";

/** Estado de la API compartido: el encabezado consulta una sola vez y el pie y el panel lo leen. */
export const ApiHealthContext = createContext<ApiHealthStatus>("checking");
