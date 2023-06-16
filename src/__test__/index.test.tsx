import { render, screen } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import Home from "../pages/index";
import "@testing-library/jest-dom";

/* eslint-disable */ jest.mock("~/config/api", () => {
  const originalModule = jest.requireActual("~/config/api");

  return {
    ...originalModule,
    api: {
      ...originalModule.api,
      transactions: {
        getAllPaginated: {
          useInfiniteQuery: () => ({
            data: { pages: [] },
          }),
        },
        getTotalByTransactionType: {
          useQuery: () => ({
            data: 1000,
          }),
        },
        create: {
          useMutation: jest.fn().mockReturnValue([
            // You may want to adjust these placeholders to fit what your actual mutation function might return.
            // Placeholder for the mutate function.
            // async (data) => {
            //   // Add any logic here to handle the input data and return a mock response.
            // },
            // Placeholder for the mutation result object.
            {
              data: null, // Replace with your mock result data.
              isLoading: false,
              isError: false,
              // ...any other properties of the result object you may need to mock.
            },
          ]),
        },
      },
      users: {
        getBalance: {
          useQuery: () => ({
            data: 1000,
          }),
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

describe("Home", () => {
  it("renders a heading", () => {
    const mockSession = {
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      user: {
        name: "George Harrison",
        email: "test@test.com",
        image:
          "https://i.pinimg.com/736x/8a/96/a6/8a96a66f28c23d47edcb375913114d66.jpg",
        id: "clikwonjw0006avaldxvcy43m",
      },
    }; // update this to match your session structure

    render(
      <SessionProvider session={mockSession}>
        <Home />
      </SessionProvider>
    );

    const pTagElement = screen.getByText(/balance/i);

    expect(pTagElement).toBeInTheDocument();
  });
});
