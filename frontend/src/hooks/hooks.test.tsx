import { act, renderHook, waitFor } from "@testing-library/react";
import { useApiHealth } from "./useApiHealth.ts";
import { useDocumentTitle } from "./useDocumentTitle.ts";
import { useGuides } from "./useGuides.ts";
import { useMediaQuery } from "./useMediaQuery.ts";
import { createProviders, createTestRepository } from "../test/renderApp.tsx";
import type { GuideRepository } from "../services/guideRepository.ts";
import { stubGlobal } from "../test/stubGlobal.ts";

/** Envuelve el hook en un almacén de Redux nuevo que lee del repositorio dado. */
function withRepository(repository: GuideRepository) {
  return createProviders(repository).Providers;
}

describe("useDocumentTitle", () => {
  it("fija «título · Hound Express» y lo actualiza", () => {
    const { rerender } = renderHook(({ title }) => {
      useDocumentTitle(title);
    }, { initialProps: { title: "Servicios" } });
    expect(document.title).toBe("Servicios · Hound Express");
    rerender({ title: "Contacto" });
    expect(document.title).toBe("Contacto · Hound Express");
  });
});

describe("useApiHealth", () => {
  it("pasa de 'checking' a 'online' cuando la API responde bien", async () => {
    stubGlobal(
      "fetch",
      jest.fn(() => Promise.resolve(new Response(JSON.stringify({ status: "ok", database: "ok" })))),
    );
    const { result } = renderHook(() => useApiHealth());
    expect(result.current).toBe("checking");
    await waitFor(() => {
      expect(result.current).toBe("online");
    });
  });

  it("pasa a 'offline' cuando falla la red", async () => {
    const { result } = renderHook(() => useApiHealth());
    await waitFor(() => {
      expect(result.current).toBe("offline");
    });
  });
});

describe("useMediaQuery", () => {
  it("sin matchMedia usa el valor por defecto", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)", true));
    expect(result.current).toBe(true);
  });

  it("sigue los cambios de la media query", () => {
    let matches = false;
    const listeners = new Set<() => void>();
    stubGlobal("matchMedia", (query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    }));
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
    act(() => {
      matches = true;
      listeners.forEach((listener) => {
        listener();
      });
    });
    expect(result.current).toBe(true);
  });
});

describe("useGuides", () => {
  it("carga la lista, y vuelve a leerla después de crear y avanzar", async () => {
    const { result } = renderHook(() => useGuides(), { wrapper: withRepository(createTestRepository()) });
    expect(result.current.status).toBe("loading");
    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });
    expect(result.current.guides).toHaveLength(8);

    await act(async () => {
      await result.current.create({
        number: "2100000000000001",
        origin: "Laredo, TX",
        destination: "Monterrey, N.L.",
        recipient: "Ana Ruiz",
        service: "standard",
      });
    });
    expect(result.current.guides).toHaveLength(9);
    expect(result.current.guides[0]?.currentStage).toBe("cargo_received");

    await act(async () => {
      await result.current.advance("2100000000000001", { location: "Laredo, TX" });
    });
    expect(result.current.guides.find((guide) => guide.number === "2100000000000001")?.currentStage).toBe("vehicle_loaded");
  });

  it("expone reset solo cuando el repositorio lo tiene y restablece las guías", async () => {
    const { result } = renderHook(() => useGuides(), { wrapper: withRepository(createTestRepository()) });
    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });
    await act(async () => {
      await result.current.advance("2148213907650312", { location: "Miami, FL" });
    });
    expect(typeof result.current.reset).toBe("function");
    await act(async () => {
      await result.current.reset?.();
    });
    expect(result.current.guides.find((guide) => guide.number === "2148213907650312")?.currentStage).toBe("cargo_received");

    const withoutReset: GuideRepository = {
      list: () => Promise.resolve([]),
      get: () => Promise.resolve(null),
      create: jest.fn(),
      advance: jest.fn(),
    };
    const other = renderHook(() => useGuides(), { wrapper: withRepository(withoutReset) });
    await waitFor(() => {
      expect(other.result.current.status).toBe("ready");
    });
    expect(other.result.current.reset).toBeUndefined();
  });

  it("informa el error de lectura y permite reintentar", async () => {
    const list = jest.fn().mockRejectedValueOnce(new Error("Sin conexión con la API")).mockResolvedValue([]);
    const repository: GuideRepository = { list, get: jest.fn(), create: jest.fn(), advance: jest.fn() };
    const { result } = renderHook(() => useGuides(), { wrapper: withRepository(repository) });
    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });
    expect(result.current.error).toBe("Sin conexión con la API");
    act(() => {
      result.current.reload();
    });
    expect(result.current.status).toBe("loading");
    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });
  });

  it("dos componentes con el mismo almacén ven la misma lista: lo que crea uno lo ve el otro", async () => {
    const { Providers } = createProviders(createTestRepository());
    const first = renderHook(() => useGuides(), { wrapper: Providers });
    const second = renderHook(() => useGuides(), { wrapper: Providers });
    await waitFor(() => {
      expect(first.result.current.status).toBe("ready");
      expect(second.result.current.status).toBe("ready");
    });

    await act(async () => {
      await first.result.current.create({
        number: "2100000000000001",
        origin: "Laredo, TX",
        destination: "Monterrey, N.L.",
        recipient: "Ana Ruiz",
        service: "standard",
      });
    });
    expect(second.result.current.guides).toHaveLength(9);
    expect(second.result.current.guides[0]?.number).toBe("2100000000000001");
  });

  it("al volver a montarse muestra la lista que el almacén ya tenía y la actualiza sin pasar por 'loading'", async () => {
    const repository = createTestRepository();
    const list = jest.spyOn(repository, "list");
    const { Providers } = createProviders(repository);
    const first = renderHook(() => useGuides(), { wrapper: Providers });
    await waitFor(() => {
      expect(first.result.current.status).toBe("ready");
    });
    first.unmount();

    const second = renderHook(() => useGuides(), { wrapper: Providers });
    expect(second.result.current.status).toBe("ready");
    expect(second.result.current.guides).toHaveLength(8);
    await waitFor(() => {
      expect(list).toHaveBeenCalledTimes(2);
    });
    expect(second.result.current.status).toBe("ready");
  });

  it("deja pasar el error de una operación para que la muestre quien la llamó", async () => {
    const { result } = renderHook(() => useGuides(), { wrapper: withRepository(createTestRepository()) });
    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });
    await expect(result.current.advance("2154302968170435", { location: "Laredo, TX" })).rejects.toMatchObject({
      code: "already_delivered",
    });
  });
});
