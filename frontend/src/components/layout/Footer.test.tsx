import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Footer } from "./Footer.tsx";

describe("Footer", () => {
  it("avisa que es un proyecto académico y no el sitio oficial", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Proyecto académico\. No es el sitio oficial de Hound Express\./),
    ).toBeInTheDocument();
  });
});
