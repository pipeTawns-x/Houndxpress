import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { App } from "../App.tsx";
import { RepositoryContext } from "../hooks/useRepository.ts";
import { createDemoRepository } from "../services/demoRepository.ts";
import type { GuideRepository } from "../services/guideRepository.ts";

/** Repositorio de demostración con almacenamiento propio, para que cada prueba parta de las guías de ejemplo. */
export function createTestRepository(): GuideRepository {
  const data = new Map<string, string>();
  return createDemoRepository({
    getStorage: () => ({
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
      removeItem: (key: string) => {
        data.delete(key);
      },
    }),
  });
}

/** Monta la aplicación completa en una ruta y espera a que termine la consulta de estado de la API. */
export async function renderApp(route = "/", repository: GuideRepository = createTestRepository()) {
  const user = userEvent.setup();
  const utils = render(
    <RepositoryContext.Provider value={repository}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </RepositoryContext.Provider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  return { user, repository, ...utils };
}
