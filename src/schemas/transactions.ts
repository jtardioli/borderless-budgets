import { type TypeOf, z } from "zod";
import { CurrencyCode } from "~/config/currencyExchange";

export enum TransactionCategory {
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

export enum TransactionType {
  EXPENSE = "Expense",
  INCOME = "Income",
}

export const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  description: z.string(),
  category: z.nativeEnum(TransactionCategory),
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
