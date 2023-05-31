import { createTRPCRouter, protectedProcedure } from "../trpc";

export const usersRouter = createTRPCRouter({
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
});
