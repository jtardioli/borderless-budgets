import { type TypeOf, z } from "zod";

export enum TransactionCategory {
  HOUSING = "Housing and Utilities",
  TRANSPORTATION = "Transportation",
  GROCERIES = "Groceries",
  EATING_OUT = "Eating out",
  ENTERTAINMENT = "Entertainment",
  SUBSCRIPTIONS = "Subscriptions",
  HEALTH = "Health",
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
});

// Create the TypeScript types from Zod schemas
export type Transaction = TypeOf<typeof TransactionSchema>;
export type TransactionNew = TypeOf<typeof TransactionWithoutIdSchema>;
