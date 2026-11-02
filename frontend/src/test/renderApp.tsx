import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { App } from "../App.tsx";
import { RepositoryContext } from "../hooks/useRepository.ts";
import { createDemoRepository } from "../services/demoRepository.ts";
import type { GuideRepository } from "../services/guideRepository.ts";
import { createAppStore } from "../store/index.ts";

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

/**
 * Crea un almacén de Redux nuevo sobre `repository` y devuelve el componente que lo provee junto con
 * el repositorio (la búsqueda del rastreo lee del contexto). Cada llamada arranca sin guías cargadas.
 */
export function createProviders(repository: GuideRepository) {
  const store = createAppStore(repository);
  function Providers({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <RepositoryContext.Provider value={repository}>{children}</RepositoryContext.Provider>
      </Provider>
    );
  }
  return { store, Providers };
}

/** Monta la aplicación completa en una ruta y espera a que termine la consulta de estado de la API. */
export async function renderApp(route = "/", repository: GuideRepository = createTestRepository()) {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url === "/api/v1/auth/me/") return new Response(JSON.stringify({ username: "operator", isStaff: true }));
    if (url.startsWith("/api/v1/public/track/")) {
      const numbers = new URL(url, "http://localhost").searchParams.get("numbers")?.split(",") ?? [];
      const results = await Promise.all(numbers.map(async trackingNumber => {
        const guide = await repository.get(trackingNumber);
        return guide ? { trackingNumber, currentStatus: guide.currentStatus, history: guide.history.map(({ stage, timestamp, location }) => ({ stage, timestamp, location })) } : { trackingNumber, found: false };
      }));
      return new Response(JSON.stringify(results));
    }
    return previousFetch(input, init);
  };
  const user = userEvent.setup();
  // Un almacén por montaje: ninguna prueba hereda las guías cargadas por otra.
  const { store, Providers } = createProviders(repository);
  const utils = render(
    <Providers>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </Providers>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  return { user, repository, store, ...utils };
}
