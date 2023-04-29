import { type TypeOf, z } from "zod";
import { CurrencyCode } from "~/config/currencyExchange";

export enum TransactionExpenseCategory {
  HOUSING = "Housing and Utilities",
  TRANSPORTATION = "Transportation",
  TRAVEL = "Travel",
  GROCERIES = "Groceries",
  RESTAURANT = "Restaurant",
  ENTERTAINMENT = "Entertainment",
  SUBSCRIPTIONS = "Subscriptions",
  HEALTH = "Health",
  PERSONAL_CARE = "Personal Care",
  CLOTHING = "Clothing",
  GIFTS_AND_DONATIONS = "Gifts and Donations",
  EDUCATION = "Education",
  TAXES = "Taxes",
  MISC = "Misc",
}
export enum TransactionIncomeCategory {
  SALARY = "Salary",
  FREELANCE = "Freelance",
  GIFTS = "Gifts",
  MISC = "Misc",
}
export enum TransactionInvestmentCategory {
  TFSA = "TFSA",
  RRSP = "RRSP",
  CRYPTO = "Crypto",
  STOCKS = "Stocks",
}

export const TransactionCategoryObject = {
  ...TransactionExpenseCategory,
  ...TransactionIncomeCategory,
  ...TransactionInvestmentCategory,
};

export type TransactionCategory =
  (typeof TransactionCategoryObject)[keyof typeof TransactionCategoryObject];

export enum TransactionType {
  EXPENSE = "Expense",
  INCOME = "Income",
  INVESTMENT = "Investment",
}

export const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  description: z.string(),
  category: z.union([
    z.nativeEnum(TransactionExpenseCategory),
    z.nativeEnum(TransactionIncomeCategory),
    z.nativeEnum(TransactionInvestmentCategory),
  ]),
  createdAt: z.union([z.date(), z.string()]),
  date: z.union([z.date(), z.string()]),
  type: z.nativeEnum(TransactionType),
});

export const TransactionWithoutIdSchema = TransactionSchema.omit({
  id: true,
  createdAt: true,
}).merge(z.object({ currency: z.nativeEnum(CurrencyCode) }));

// Create the TypeScript types from Zod schemas
export type Transaction = TypeOf<typeof TransactionSchema>;
export type TransactionNew = TypeOf<typeof TransactionWithoutIdSchema>;
