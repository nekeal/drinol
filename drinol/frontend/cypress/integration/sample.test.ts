describe("Sample Cypress test", () => {
  it("Check main page", () => {
    cy.visit("http://localhost:3000/");
    cy.findByText(/Main route/).should("exist");
  });
});
