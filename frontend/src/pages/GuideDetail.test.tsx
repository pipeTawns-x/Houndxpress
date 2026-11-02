import { screen, waitFor } from "@testing-library/react";
import { renderApp, createTestRepository } from "../test/renderApp.tsx";
import { RepositoryError } from "../services/guideRepository.ts";
import { stubGlobal } from "../test/stubGlobal.ts";

it("loads a private detail and only offers the next stage", async () => {
  const repository = createTestRepository();
  const get = jest.spyOn(repository, "get");
  const advance = jest.spyOn(repository, "advance");
  const { user } = await renderApp("/panel/guias/2148213907650312", repository);
  expect(await screen.findByText("Laura Gómez")).toBeInTheDocument();
  expect(get).toHaveBeenCalledWith("2148213907650312");
  expect(
    screen.queryByRole("button", { name: "Avanzar a Vehículo liberado" }),
  ).not.toBeInTheDocument();
  await user.selectOptions(
    screen.getByLabelText("Ubicación del avance (opcional)"),
    "Miami, Florida",
  );
  await user.click(
    screen.getByRole("button", { name: "Avanzar a Vehículo cargado" }),
  );
  expect(advance).toHaveBeenCalledWith("2148213907650312", {
    stage: "vehicle_loaded",
    location: "Miami, Florida",
  });
  expect(
    await screen.findByRole("button", { name: "Avanzar a Vehículo liberado" }),
  ).toBeInTheDocument();
});
it("makes 409 explicit and requires a fresh detail before retrying a transition", async () => {
  const repository = createTestRepository();
  jest
    .spyOn(repository, "advance")
    .mockRejectedValue(
      new RepositoryError(
        "invalid_transition",
        "Conflicto (409): la etapa cambió. Actualiza la guía.",
        409,
      ),
    );
  const { user } = await renderApp("/panel/guias/2148213907650312", repository);
  const button = await screen.findByRole("button", {
    name: "Avanzar a Vehículo cargado",
  });
  await user.click(button);
  expect(await screen.findByRole("alert")).toHaveTextContent("409");
  expect(button).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Actualizar guía" }));
  await waitFor(() => expect(button).toBeEnabled());
});
it("shows a missing guide instead of a private detail", async () => {
  await renderApp("/panel/guias/2100000000000000");
  expect(await screen.findByText("Guía no encontrada.")).toBeInTheDocument();
});
it("logs out through CSRF and clears loaded private state", async () => {
  const { user, store } = await renderApp("/panel");
  await screen.findByRole("heading", { level: 2, name: "Resumen" });
  expect(store.getState().guides.items).not.toHaveLength(0);
  const requests: string[] = [];
  stubGlobal(
    "fetch",
    jest.fn((url: string) => {
      requests.push(url);
      return Promise.resolve(
        new Response(
          JSON.stringify(
            url.endsWith("csrf/") ? { csrfToken: "logout-token" } : {},
          ),
        ),
      );
    }),
  );
  await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
  expect(
    await screen.findByRole("heading", { name: "Inicia sesión" }),
  ).toBeInTheDocument();
  expect(requests.filter((url) => url.includes("/auth/"))).toEqual([
    "/api/v1/auth/csrf/",
    "/api/v1/auth/logout/",
  ]);
  expect(store.getState().guides.items).toHaveLength(0);
});
