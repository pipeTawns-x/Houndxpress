import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { GuidesTable } from "../components/panel/GuidesTable.tsx";
import { createTestRepository } from "../test/renderApp.tsx";
import { NETWORK_NODES } from "../content/coverage.ts";
it("filters by destination and offers only optional network cities", async () => {
  const repository = createTestRepository();
  const guides = await repository.list();
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <GuidesTable
        guides={guides}
        onAdvance={(number, input) => repository.advance(number, input)}
        onHistory={jest.fn()}
      />
    </MemoryRouter>,
  );
  await user.type(screen.getByRole("searchbox"), "Monterrey");
  expect(screen.getAllByRole("row")).toHaveLength(
    guides.filter((g) => g.destination.includes("Monterrey")).length + 1,
  );
  expect(
    Array.from(
      screen.getByLabelText<HTMLSelectElement>("Ubicación del avance").options,
    ).map((o) => o.value),
  ).toEqual(["", ...NETWORK_NODES.map((n) => n.name)]);
});

it("requires explicit confirmation before archiving a guide", async () => {
  const { renderApp } = await import("../test/renderApp.tsx");
  const repository = {
    ...createTestRepository(),
    archive: jest.fn().mockResolvedValue(undefined),
  };
  const { user } = await renderApp("/panel/guias/2148213907650312", repository);
  await user.click(
    await screen.findByRole("button", { name: "Archivar guía" }),
  );
  expect(repository.archive).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(repository.archive).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Archivar guía" }));
  await user.click(screen.getByRole("button", { name: "Confirmar archivo" }));
  expect(repository.archive).toHaveBeenCalledWith("2148213907650312");
  expect(
    await screen.findByRole("heading", { name: "Archivo" }),
  ).toBeInTheDocument();
});
it("separates summary, registry and creation pages", async () => {
  const { renderApp } = await import("../test/renderApp.tsx");
  const { user } = await renderApp("/panel");
  expect(
    await screen.findByRole("heading", { level: 1, name: "Resumen" }),
  ).toBeInTheDocument();
  expect(await screen.findByText("operator")).toBeInTheDocument();
  expect(
    screen.queryByRole("form", { name: "Registrar guía" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: "Registro de guías" }));
  expect(await screen.findByRole("searchbox")).toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: "Alta de guía" }));
  expect(
    await screen.findByRole("form", { name: "Registrar guía" }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
});
