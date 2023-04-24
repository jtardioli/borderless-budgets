import {
  TransactionType,
  TransactionWithoutIdSchema,
} from "~/schemas/transactions";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";

export const transactionsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.transaction.findMany({
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
  getMonthlyExpenditure: publicProcedure
    .input(
      z.object({
        startOfMonth: z.union([z.date(), z.string()]),
        endOfMonth: z.union([z.date(), z.string()]),
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.prisma.transaction.aggregate({
        where: {
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

      console.log(result, typeof input.endOfMonth);

      return result._sum.amount;
    }),
  create: protectedProcedure
    .input(TransactionWithoutIdSchema)
    .mutation(async ({ input, ctx }) => {
      const tx = await ctx.prisma.transaction.create({
        data: { ...input, userId: ctx.session?.user.id },
      });

      return tx;
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const deleteTx = await ctx.prisma.transaction.deleteMany({
        where: {
          id: {
            equals: input.id,
          },
        },
      });
      return deleteTx;
    }),
});
