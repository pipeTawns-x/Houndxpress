import { combineReducers, configureStore, isPlain } from "@reduxjs/toolkit";
import type { GuideRepository } from "../services/guideRepository.ts";
import { createInitialGuidesState, guidesReducer } from "./guidesSlice.ts";

const rootReducer = combineReducers({ guides: guidesReducer });

/**
 * Crea el almacén de la aplicación sobre un repositorio de guías. El repositorio es el
 * argumento extra de los thunks: así el estado se prueba con un repositorio falso y el
 * almacén no depende de si los datos vienen de `localStorage` o de la API Django.
 */
export function createAppStore(repository: GuideRepository) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: { guides: createInitialGuidesState(repository.reset !== undefined) },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: repository },
        // Las acciones de error llevan el `Error` original (ver guidesSlice.ts); el estado nunca.
        serializableCheck: { isSerializable: (value: unknown) => isPlain(value) || value instanceof Error },
      }),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
