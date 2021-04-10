import React from "react";
import { render, screen } from "@testing-library/react";
import { Root } from "./Root";

it("renders example component", () => {
  render(<Root />);
  const linkElement = screen.getByText(/Just an example component/i);
  expect(linkElement).toBeInTheDocument();
});
