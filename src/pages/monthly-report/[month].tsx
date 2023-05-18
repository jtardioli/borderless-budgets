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
import { Grid } from "react-loading-icons";
import Link from "next/link";

ChartJS.register(ArcElement, Tooltip, Legend);

const MonthlyReport = () => {
  const router = useRouter();
  const { month } = router.query;
  const { data: session } = useSession({ required: true });

  const monthlyExpenseCategories =
    api.transactions.getMonthlyCategories.useQuery(
      {
        ...getMonthStartAndEnd(new Date(month as string)),
        txType: TransactionType.EXPENSE,
      },
      {
        enabled: session?.user !== undefined && !!month,
        refetchOnWindowFocus: false,
      }
    );
  const monthlyIncomeCategories =
    api.transactions.getMonthlyCategories.useQuery(
      {
        ...getMonthStartAndEnd(new Date(month as string)),
        txType: TransactionType.INCOME,
      },
      {
        enabled: session?.user !== undefined && !!month,
        refetchOnWindowFocus: false,
      }
    );

  const monthlyExpenditure = api.transactions.getMonthlyExpenditure.useQuery(
    getMonthStartAndEnd(new Date(month as string)),
    {
      enabled: session?.user !== undefined && !!month,
      refetchOnWindowFocus: false,
    }
  );
  const monthlyIncome = api.transactions.getMonthlyIncome.useQuery(
    getMonthStartAndEnd(new Date(month as string)),
    {
      enabled: session?.user !== undefined && !!month,
      refetchOnWindowFocus: false,
    }
  );

  const expenseCategories = monthlyExpenseCategories.data?.map((c) => {
    return c.category;
  });
  const expenseAmounts = monthlyExpenseCategories.data?.map((c) => {
    return c.amount;
  });

  const incomeCategories = monthlyIncomeCategories.data?.map((c) => {
    return c.category;
  });
  const incomeAmounts = monthlyIncomeCategories.data?.map((c) => {
    return c.amount;
  });

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

  const isFetching =
    monthlyExpenditure.isFetching ||
    monthlyIncome.isFetching ||
    monthlyExpenseCategories.isFetching ||
    monthlyIncomeCategories.isFetching;

  const displayEmptyState =
    !isFetching && monthlyExpenditure.data === 0 && monthlyIncome.data === 0;

  const displayExpenses =
    !isFetching && !!monthlyExpenditure.data && monthlyExpenditure.data !== 0;

  const displayIncome =
    !isFetching && !!monthlyIncome.data && monthlyIncome.data !== 0;

  return (
    <>
      <Head>
        <title> Monthly Report - Borderless Budgets</title>
      </Head>
      <Layout>
        <main className="flex h-full min-h-screen w-full flex-col gap-6 bg-slate-200 px-2 pb-20 pt-14 sm:px-4 sm:py-5 sm:pb-5 lg:px-20">
          {/* Mobile Back Btn */}
          <button
            className="fixed  left-0 top-0 z-10 block h-12 w-full border-b-[1px] border-slate-300 bg-slate-100  bg-gradient-to-br drop-shadow-sm sm:hidden"
            onClick={() => router.back()}
          >
            <BsChevronLeft size={25} />
          </button>

          {/* Normal Back Btn */}
          <button className="hidden sm:block" onClick={() => router.back()}>
            <BsChevronLeft size={25} />
          </button>

          <h1 className="text-xl">
            {typeof month === "string" && format(new Date(month), "MMMM yyyy ")}{" "}
            - Monthly Review
          </h1>

          {isFetching && (
            <div className="mt-32 flex justify-center">
              <Grid fill="#4f46e5" width="50px" />
            </div>
          )}
          <div className="flex max-w-[1000px] flex-col gap-6">
            {displayExpenses && (
              <MonthlyCategories
                title={"Monthly Expenses"}
                graphData={expenseData}
                graphOptions={options}
                monthlyCategories={monthlyExpenseCategories.data}
                monthlyTotal={monthlyExpenditure.data}
              />
            )}

            {displayIncome && (
              <MonthlyCategories
                title={"Monthly Income"}
                graphData={incomeData}
                graphOptions={options}
                monthlyCategories={monthlyIncomeCategories.data}
                monthlyTotal={monthlyIncome.data}
              />
            )}

            {displayEmptyState && (
              <div className="mt-6 flex  w-full flex-col items-center gap-6  rounded-md border-[1px] border-gray-300 bg-white px-6 py-12 drop-shadow-sm">
                <div className="flex flex-col text-center">
                  <p>
                    Looks like there are no transactions for the selected month.
                  </p>
                  <p>
                    Choose a different month or start adding new transactions to
                    keep track of your finances.
                  </p>
                </div>

                <Link href="/">
                  <button className="flex h-10 w-56 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-opacity-90 drop-shadow-md">
                    Go to Dashboard
                  </button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </Layout>
    </>
  );
};

export default MonthlyReport;
