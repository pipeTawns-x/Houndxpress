import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Footer } from "./Footer.tsx";

describe("Footer", () => {
  it("avisa que es un rediseño no oficial", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Rediseño no oficial de Hound Express\./)).toBeInTheDocument();
  });
});
