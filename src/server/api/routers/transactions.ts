import {
  TransactionCategoryObject,
  TransactionExpenseCategory,
  TransactionIncomeCategory,
  TransactionInvestmentCategory,
  TransactionType,
  TransactionWithoutIdSchema,
} from "~/schemas/transactions";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { format, subYears, startOfYear } from "date-fns";
import { CurrencyCode, convertCurrency } from "~/config/currencyExchange";
import { ALL } from "~/config/constants";
import "react-datepicker/dist/react-datepicker.css";
import { endOfDay } from "date-fns";

type MonthlySummary = Record<string, { expenses: number; income: number }>;

export const transactionsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.transaction.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: [
        {
          date: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }),
  getAllPaginated: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.string().optional(),
        description: z.string().optional(),
        txType: z.enum([
          ALL,
          TransactionType.EXPENSE,
          TransactionType.INCOME,
          TransactionType.INVESTMENT,
        ]),
        category: z.union([
          z.literal(ALL),
          z.nativeEnum(TransactionExpenseCategory),
          z.nativeEnum(TransactionIncomeCategory),
          z.nativeEnum(TransactionInvestmentCategory),
        ]),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const transactions = await ctx.prisma.transaction.findMany({
        take: input.limit + 1, // get an extra item at the end which we'll use as next cursor
        where: {
          userId: ctx.session.user.id,
          description: { contains: input.description },
          type: input.txType === ALL ? undefined : input.txType,
          category: input.category === ALL ? undefined : input.category,
          date: {
            gte: input.startDate ? new Date(input.startDate) : undefined,
            lt: input.endDate ? endOfDay(new Date(input.endDate)) : undefined,
          },
        },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { id: "desc" },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (transactions.length > input.limit) {
        nextCursor = transactions.pop()!.id;
      }

      return {
        transactions,
        nextCursor,
      };
    }),
  getTotalByTransactionType: protectedProcedure
    .input(
      z.object({
        startDate: z.union([z.date(), z.string()]),
        endDate: z.union([z.date(), z.string()]),
        txType: z.enum([
          TransactionType.EXPENSE,
          TransactionType.INCOME,
          TransactionType.INVESTMENT,
        ]),
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.prisma.transaction.aggregate({
        where: {
          userId: ctx.session.user.id,
          type: input.txType,
          date: {
            gte: new Date(input.startDate),
            lt: new Date(input.endDate),
          },
        },
        _sum: {
          amount: true,
        },
      });

      if (input.txType === TransactionType.EXPENSE) {
        return result._sum.amount ? result._sum.amount * -1 : 0;
      } else if (input.txType === TransactionType.INCOME) {
        return result._sum.amount || 0;
      } else if (input.txType === TransactionType.INVESTMENT) {
        return result._sum.amount || 0;
      } else {
        throw new Error("Invalid transaction type provided");
      }
    }),

  getCategories: protectedProcedure
    .input(
      z.object({
        startDate: z.union([z.date(), z.string()]),
        endDate: z.union([z.date(), z.string()]),
        txType: z.enum([
          TransactionType.EXPENSE,
          TransactionType.INCOME,
          TransactionType.INVESTMENT,
        ]),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.prisma.transaction.groupBy({
        by: ["category"],
        where: {
          userId: ctx.session.user.id,
          type: input.txType,
          date: {
            gte: new Date(input.startDate),
            lt: new Date(input.endDate),
          },
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
      });

      return result.map((item) => ({
        category: item.category,
        amount: item._sum.amount,
      }));
    }),
  getYearInReview: protectedProcedure.query(async ({ ctx }) => {
    // Get the start date of the previous year
    const startDate = startOfYear(subYears(new Date(), 1));

    // Group transactions by type and date, and calculate the sum of the "amount" field
    const result = await ctx.prisma.transaction.groupBy({
      by: ["type", "date"],
      where: {
        userId: ctx.session.user.id,
        date: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Reduce the result array into a monthly summary object
    const monthlySummary: MonthlySummary = result.reduce((summary, item) => {
      // Get the type and month of the transaction
      const type = item.type;
      const month = format(new Date(item.date), "MMM yyyy");

      // Initialize the summary object for this month if it doesn't exist yet
      if (!summary[month]) {
        summary[month] = {
          expenses: 0,
          income: 0,
        };
      }

      // Add the transaction amount to the appropriate field of the summary object
      if (type === TransactionType.EXPENSE) {
        summary[month]!.expenses -= item._sum.amount!;
      } else if (type === TransactionType.INCOME) {
        summary[month]!.income += item._sum.amount!;
      }

      // Return the updated summary object
      return summary;
    }, {} as MonthlySummary);

    // Return the monthly summary object
    return monthlySummary;
  }),

  create: protectedProcedure
    .input(TransactionWithoutIdSchema)
    .mutation(async ({ input, ctx }) => {
      const isExpense = input.type === TransactionType.EXPENSE;
      const isIncome = input.type === TransactionType.INCOME;

      // If user selected other currency, convert it to CAD
      const amount =
        input.currency === CurrencyCode.CAD
          ? input.amount
          : await convertCurrency(
              input.currency,
              CurrencyCode.CAD,
              input.amount
            );
      input.amount = amount;

      // Prepare the balance update operation
      const balanceOperation = isExpense
        ? { decrement: input.amount }
        : isIncome
        ? { increment: input.amount }
        : undefined;

      // Create the transaction obj by excluding currency
      console.log(input, amount);
      const { currency, ...newTx } = input;
      const tx = await ctx.prisma.transaction.create({
        data: { ...newTx, userId: ctx.session?.user.id },
      });

      // Conditionally update the user's balance if the transaction is created and a balanceOperation exists
      if (tx && balanceOperation) {
        await ctx.prisma.user.update({
          where: { id: ctx.session?.user.id },
          data: { balance: balanceOperation },
        });
      }

      return tx;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const deleteTx = await ctx.prisma.transaction.delete({
        where: {
          id: input.id,
        },
        select: {
          type: true,
          amount: true,
        },
      });

      const isExpense = deleteTx.type === TransactionType.EXPENSE;
      const isIncome = deleteTx.type === TransactionType.INCOME;

      // Prepare the balance update operation
      const balanceOperation = isExpense
        ? { increment: deleteTx.amount }
        : isIncome
        ? { decrement: deleteTx.amount }
        : undefined;

      // Conditionally update the user's balance if the transaction is created and a balanceOperation exists
      if (deleteTx && balanceOperation) {
        await ctx.prisma.user.update({
          where: { id: ctx.session?.user.id },
          data: { balance: balanceOperation },
        });
      }

      return deleteTx;
    }),
});
