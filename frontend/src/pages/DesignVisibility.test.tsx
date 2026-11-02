import { screen } from "@testing-library/react";
import { renderApp } from "../test/renderApp.tsx";
import { env } from "../config/env.ts";
it("does not expose the designs route in production mode", async () => {
  const previous = env.isDevelopment;
  Object.defineProperty(env, "isDevelopment", { value: false, configurable: true });
  try {
    await renderApp("/disenos");
    expect(
      await screen.findByRole("heading", { name: /Esta página no está en la ruta/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Índice de diseños" })).not.toBeInTheDocument();
  } finally {
    Object.defineProperty(env, "isDevelopment", { value: previous, configurable: true });
  }
});
