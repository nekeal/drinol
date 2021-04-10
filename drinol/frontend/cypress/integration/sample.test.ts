describe("Sample Cypress test", () => {
  it("Check main page", () => {
    cy.visit("http://localhost:3000/");
    cy.findByText(/Welcome to react/).should("exist");
  });
});
