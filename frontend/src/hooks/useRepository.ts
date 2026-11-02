import { createContext, useContext } from "react";
import { guideRepository } from "../services/index.ts";
import type { GuideRepository } from "../services/guideRepository.ts";

/**
 * Repositorio de guías que ven los componentes. Por defecto es el de la
 * aplicación (demo o API); las pruebas pueden sustituirlo con un `Provider`.
 */
export const RepositoryContext = createContext<GuideRepository>(guideRepository);

export function useRepository(): GuideRepository {
  return useContext(RepositoryContext);
}
