import {
  TransactionType,
  TransactionWithoutIdSchema,
} from "~/schemas/transactions";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { format, subYears, startOfYear } from "date-fns";

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
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        balance: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Return the user's balance
    return user.balance;
  }),
  getMonthlyExpenditure: protectedProcedure
    .input(
      z.object({
        startOfMonth: z.union([z.date(), z.string()]),
        endOfMonth: z.union([z.date(), z.string()]),
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.prisma.transaction.aggregate({
        where: {
          userId: ctx.session.user.id,
          type: TransactionType.EXPENSE,
          date: {
            gte: new Date(input.startOfMonth),
            lt: new Date(input.endOfMonth),
          },
        },
        _sum: {
          amount: true,
        },
      });

      return result._sum.amount ? result._sum.amount * -1 : null;
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

      // Prepare the balance update operation
      const balanceOperation = isExpense
        ? { decrement: input.amount }
        : isIncome
        ? { increment: input.amount }
        : undefined;

      // Create the transaction
      const tx = await ctx.prisma.transaction.create({
        data: { ...input, userId: ctx.session?.user.id },
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
