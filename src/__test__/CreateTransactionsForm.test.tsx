import { fireEvent, render, screen } from "@testing-library/react";
import CreateTransactionForm from "~/components/CreateTransactionForm";
import "@testing-library/jest-dom";

/* eslint-disable */
const mockMutate = jest.fn();
const mockUseMutation = jest.fn().mockReturnValue({
  data: null, // Replace with your mock result data.
  isLoading: false,
  isError: false,
  mutate: mockMutate,
  // ...any other properties of the result object you may need to mock.
});

jest.mock("~/config/api", () => {
  const originalModule = jest.requireActual("~/config/api");

  return {
    ...originalModule,
    api: {
      ...originalModule.api,
      transactions: {
        create: {
          useMutation: () => mockUseMutation(),
        },
      },
      useContext: () => ({
        transactions: {
          invalidate: jest.fn(),
        },
        // Add any other parts of the context here...
      }),
    },
  };
});
/* eslint-disable */

describe("CreateTransactionForm", () => {
  it("Defaults to displaying the expenses form", () => {
    render(<CreateTransactionForm />);

    const addExpenseButton = screen.getByRole("button", {
      name: /add expense/i,
    });

    expect(addExpenseButton).toBeInTheDocument();
  });

  it("Correctly switches between forms, add expense, add income, add investment", () => {
    render(<CreateTransactionForm />);

    const selectExpenseTransactionTypeButton = screen.getByRole("button", {
      name: /^expense$/i,
    });
    const selectIncomeTransactionTypeButton = screen.getByRole("button", {
      name: /^income$/i,
    });
    const selectInvestTransactionTypeButton = screen.getByRole("button", {
      name: /^invest$/i,
    });

    /* 
     Start with default expense button selected, click on select income button.
     Make sure that the button text changed to Add Income signifying 
     the form changed correctly  
    */
    let addExpenseOrIncomeOrInvestButton = screen.getByRole("button", {
      name: /^add expense$/i,
    });
    fireEvent.click(selectIncomeTransactionTypeButton);
    addExpenseOrIncomeOrInvestButton = screen.getByRole("button", {
      name: /^add income$/i,
    });
    expect(addExpenseOrIncomeOrInvestButton).toBeInTheDocument();

    // Test income button
    fireEvent.click(selectInvestTransactionTypeButton);
    addExpenseOrIncomeOrInvestButton = screen.getByRole("button", {
      name: /^add investment$/i,
    });
    expect(addExpenseOrIncomeOrInvestButton).toBeInTheDocument();

    // Test expense button
    fireEvent.click(selectExpenseTransactionTypeButton);
    addExpenseOrIncomeOrInvestButton = screen.getByRole("button", {
      name: /^add expense$/i,
    });
    expect(addExpenseOrIncomeOrInvestButton).toBeInTheDocument();
  });

  describe("Handles valid inputs", () => {
    it("Does not create transaction when form is invalid", () => {
      render(<CreateTransactionForm />);

      const addExpenseButton = screen.getByRole("button", {
        name: /^add expense$/i,
      });

      fireEvent.click(addExpenseButton);

      // assert useMutation has not been called
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("Displays appropriate error messages when form is invalid", () => {
      render(<CreateTransactionForm />);

      const addExpenseButton = screen.getByRole("button", {
        name: /^add expense$/i,
      });

      fireEvent.click(addExpenseButton);

      const descriptionErrorMessage = screen.getByText(
        "You must provide a valid description"
      );
      const amountErrorMessage = screen.getByText(
        "You must provide a valid amount"
      );

      expect(descriptionErrorMessage).toBeInTheDocument();
      expect(amountErrorMessage).toBeInTheDocument();
    });

    it("Error messages cleared after typing in inputs", () => {
      render(<CreateTransactionForm />);

      const addExpenseButton = screen.getByRole("button", {
        name: /^add expense$/i,
      });

      fireEvent.click(addExpenseButton);

      const descriptionErrorMessage = screen.getByText(
        "You must provide a valid description"
      );
      const amountErrorMessage = screen.getByText(
        "You must provide a valid amount"
      );

      const descriptionInput = screen.getByPlaceholderText("Uber");
      const amountInput = screen.getByPlaceholderText("0.00");

      fireEvent.change(descriptionInput, { target: { value: "Chocolate" } });
      fireEvent.change(amountInput, { target: { value: "10.43" } });

      expect(descriptionErrorMessage).not.toBeInTheDocument();
      expect(amountErrorMessage).not.toBeInTheDocument();
    });
  });
});
