import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AdvanceInput, Guide, NewGuideInput } from "../domain/index.ts";
import type { GuideRepository } from "../services/guideRepository.ts";

/** Estado de la última lectura de la lista. */
export type GuidesLoadStatus = "idle" | "loading" | "succeeded" | "failed";

export interface GuidesState {
  /** Las guías tal como las devolvió el repositorio en la última lectura, en su mismo orden. */
  items: Guide[];
  status: GuidesLoadStatus;
  /** Mensaje de la última lectura fallida; `null` si no hay error. */
  error: string | null;
  /** El repositorio de demostración se puede restablecer; el de la API no. */
  canReset: boolean;
  /** `requestId` de la lectura más reciente: la respuesta de una lectura anterior se descarta. */
  latestReadId: string | null;
}

export function createInitialGuidesState(canReset = false): GuidesState {
  return { items: [], status: "idle", error: null, canReset, latestReadId: null };
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

/**
 * El repositorio llega como argumento extra del thunk (ver `createAppStore`), así que los
 * thunks no importan ninguna implementación. Las operaciones que fallan rechazan con el error
 * original (`rejectWithValue`) y no con su versión serializada: la interfaz distingue
 * `DomainError` y `RepositoryError` con `instanceof`.
 */
const createAppAsyncThunk = createAsyncThunk.withTypes<{
  extra: GuideRepository;
  rejectValue: unknown;
}>();

export interface FetchGuidesOptions {
  /**
   * Vuelve a leer sin pasar por "cargando" cuando ya hay una lista que mostrar. Es lo que
   * hacen las escrituras: la pantalla no parpadea ni pierde lo que la persona estaba haciendo.
   */
  background?: boolean;
}

/** Lee la lista completa del repositorio. */
export const fetchGuides = createAppAsyncThunk(
  "guides/fetchGuides",
  async (_options: FetchGuidesOptions | undefined, { extra: repository, rejectWithValue }) => {
    try {
      return await repository.list();
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

/**
 * Registra una guía y vuelve a leer la lista: el repositorio es la fuente de verdad, así que
 * el orden y el contenido de `items` son siempre los que él devuelve. Resuelve con la guía creada.
 */
export const createGuide = createAppAsyncThunk(
  "guides/createGuide",
  async (input: NewGuideInput, { extra: repository, dispatch, rejectWithValue }) => {
    let guide: Guide;
    try {
      guide = await repository.create(input);
    } catch (error) {
      return rejectWithValue(error);
    }
    await dispatch(fetchGuides({ background: true }));
    return guide;
  },
);

export interface AdvanceGuideArg {
  number: string;
  input: AdvanceInput;
}

/**
 * Pide al repositorio que avance la guía. La regla (solo la etapa siguiente) la aplica el
 * repositorio con `src/domain/`; aquí no se repite. Después vuelve a leer la lista.
 */
export const advanceGuide = createAppAsyncThunk(
  "guides/advanceGuide",
  async ({ number, input }: AdvanceGuideArg, { extra: repository, dispatch, rejectWithValue }) => {
    let guide: Guide;
    try {
      guide = await repository.advance(number, input);
    } catch (error) {
      return rejectWithValue(error);
    }
    await dispatch(fetchGuides({ background: true }));
    return guide;
  },
);

/** Vuelve a los datos de ejemplo. Solo funciona con un repositorio que tenga `reset`. */
export const resetGuides = createAppAsyncThunk(
  "guides/resetGuides",
  async (_: void, { extra: repository, dispatch, rejectWithValue }) => {
    try {
      if (!repository.reset) throw new Error("Este origen de datos no se puede restablecer.");
      await repository.reset();
    } catch (error) {
      return rejectWithValue(error);
    }
    await dispatch(fetchGuides({ background: true }));
    return undefined;
  },
);

const guidesSlice = createSlice({
  name: "guides",
  initialState: createInitialGuidesState(),
  reducers: {},
  // Solo la lectura toca la lista. Las escrituras (create, advance, reset) no guardan nada aquí:
  // terminan con una lectura, y el reducer guarda lo que devuelve el repositorio.
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuides.pending, (state, action) => {
        state.latestReadId = action.meta.requestId;
        const keepShowingList = action.meta.arg?.background === true && state.status === "succeeded";
        if (!keepShowingList) {
          state.status = "loading";
          state.error = null;
        }
      })
      .addCase(fetchGuides.fulfilled, (state, action) => {
        // Solo cuenta la última lectura: una respuesta vieja nunca pisa a una nueva.
        if (action.meta.requestId !== state.latestReadId) return;
        state.items = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchGuides.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestReadId) return;
        state.status = "failed";
        state.error = errorMessage(action.payload);
      });
  },
});

export const guidesReducer = guidesSlice.reducer;
