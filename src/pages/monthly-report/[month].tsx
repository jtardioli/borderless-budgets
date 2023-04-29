import React from "react";
import Layout from "~/components/Layout";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js";

import { api } from "~/config/api";
import { useSession } from "next-auth/react";

import { getMonthStartAndEnd } from "~/utils/dates";
import Head from "next/head";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { BsChevronLeft } from "react-icons/bs";
import { TransactionType } from "~/schemas/transactions";
import MonthlyCategories from "~/components/MonthlyCategories";

ChartJS.register(ArcElement, Tooltip, Legend);

const MonthlyReport = () => {
  const router = useRouter();
  const { month } = router.query;
  const { data: session } = useSession({ required: true });

  const { data: monthlyExpenseCategories } =
    api.transactions.getMonthlyCategories.useQuery(
      {
        ...getMonthStartAndEnd(new Date(month as string)),
        txType: TransactionType.EXPENSE,
      },
      {
        enabled: session?.user !== undefined && !!month,
      }
    );
  const { data: monthlyIncomeCategories } =
    api.transactions.getMonthlyCategories.useQuery(
      {
        ...getMonthStartAndEnd(new Date(month as string)),
        txType: TransactionType.INCOME,
      },
      {
        enabled: session?.user !== undefined && !!month,
      }
    );

  const { data: monthlyExpenditure } =
    api.transactions.getMonthlyExpenditure.useQuery(
      getMonthStartAndEnd(new Date(month as string)),
      {
        enabled: session?.user !== undefined && !!month,
      }
    );
  const { data: monthlyIncome } = api.transactions.getMonthlyIncome.useQuery(
    getMonthStartAndEnd(new Date(month as string)),
    {
      enabled: session?.user !== undefined && !!month,
    }
  );

  const expenseCategories = monthlyExpenseCategories?.map((c) => {
    return c.category;
  });
  const expenseAmounts = monthlyExpenseCategories?.map((c) => {
    return c.amount;
  });

  const incomeCategories = monthlyIncomeCategories?.map((c) => {
    return c.category;
  });
  const incomeAmounts = monthlyIncomeCategories?.map((c) => {
    return c.amount;
  });

  console.log(incomeAmounts);

  const expenseData: ChartData<"pie"> = {
    labels: expenseCategories,
    datasets: [
      {
        label: "Expense by Category",
        data: expenseAmounts as number[],
        backgroundColor: [
          "rgba(165, 18, 96, 1)", // Blended with dark red
          "rgba(255, 170, 105, 1)", // Blended with light orange
          "rgba(191, 106, 154, 1)", // Blended with medium violet
          "rgba(226, 27, 121, 1)", // Blended with medium dark red
          "rgba(253, 187, 130, 1)", // Blended with medium light orange
          "rgba(75, 0, 130, 1)", // Indigo
          "rgba(255, 93, 175, 1)", // Blended with lighter red
          "rgba(255, 207, 237, 1)", // Blended with lightest pink
          "rgba(128, 44, 127, 1)", // Blended with indigo and red
        ],
      },
    ],
  };

  const incomeData: ChartData<"pie"> = {
    labels: incomeCategories,

    datasets: [
      {
        label: "Expense by Category",
        data: incomeAmounts as number[],
        backgroundColor: [
          "rgba(60, 128, 70, 1)", // Blended with dark green
          "rgba(98, 137, 204, 1)", // Blended with light blue
          "rgba(94, 168, 134, 1)", // Blended with medium teal
          "rgba(135, 111, 193, 1)", // Blended with light purple
          "rgba(122, 193, 106, 1)", // Blended with medium green
          "rgba(165, 140, 216, 1)", // Blended with medium light purple
          "rgba(49, 96, 161, 1)", // Blended with dark blue
          "rgba(156, 217, 128, 1)", // Blended with lighter green
          "rgba(191, 201, 239, 1)", // Blended with lightest blue
          "rgba(75, 127, 130, 1)", // Blended with green and blue
        ],
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <>
      <Head>
        <title> Monthly Report - Borderless Budgets</title>
      </Head>
      <Layout>
        <main className="flex h-full min-h-screen w-full flex-col gap-6 bg-slate-200 px-20 py-5">
          <button onClick={() => router.back()}>
            <BsChevronLeft size={25} />
          </button>

          <h1 className="text-xl">
            {typeof month === "string" && format(new Date(month), "MMMM yyyy ")}{" "}
            - Monthly Review
          </h1>

          <MonthlyCategories
            title={"Monthly Expenses"}
            graphData={expenseData}
            graphOptions={options}
            monthlyCategories={monthlyExpenseCategories}
            monthlyTotal={monthlyExpenditure}
          />
          <MonthlyCategories
            title={"Monthly Income"}
            graphData={incomeData}
            graphOptions={options}
            monthlyCategories={monthlyIncomeCategories}
            monthlyTotal={monthlyIncome}
          />
        </main>
      </Layout>
    </>
  );
};

export default MonthlyReport;
