import React from "react";
import Layout from "~/components/Layout";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { api } from "~/config/api";
import { getSession, useSession } from "next-auth/react";
import { formatCurrency } from "~/utils/currency";
import { getMonthStartAndEnd } from "~/utils/dates";
import Head from "next/head";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { BsChevronLeft } from "react-icons/bs";

ChartJS.register(ArcElement, Tooltip, Legend);

const MonthlyReport = () => {
  const router = useRouter();
  const { month } = router.query;
  const { data: session } = useSession({ required: true });

  const { data: monthlyCategoryExpenditure } =
    api.transactions.getMonthlyCategoryExpenditure.useQuery(
      getMonthStartAndEnd(new Date(month as string)), // no input,
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

  const categories = monthlyCategoryExpenditure?.map((c) => {
    return c.category;
  });
  const amounts = monthlyCategoryExpenditure?.map((c) => {
    return c.amount;
  });

  const data = {
    labels: categories,

    datasets: [
      {
        label: "Expense by Category",
        data: amounts,
        backgroundColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],

        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <Head>
        <title> Monthly Report - Borderless Budgets</title>
      </Head>
      <Layout>
        <main className="flex h-full w-full flex-col gap-6 bg-slate-200 px-10 py-5">
          <button onClick={() => router.back()}>
            <BsChevronLeft size={25} />
          </button>

          <h1 className="text-xl">
            {typeof month === "string" && format(new Date(month), "MMMM yyyy ")}{" "}
            - Monthly Review
          </h1>
          <div className="flex gap-10">
            <div className="flex h-[400px] flex-1 items-center justify-center  overflow-y-auto  rounded-md border-[1px] border-gray-300 bg-white py-4 drop-shadow-sm">
              <div className="h-[300px] w-[300px] ">
                <Pie data={data} />
              </div>
            </div>
            <div className="h-[400px] flex-1 flex-col  overflow-y-auto  rounded-md border-[1px] border-gray-300 bg-white px-6 py-4 drop-shadow-sm">
              <h3 className=" font-semibold">Monthly Expenses</h3>

              <div className="mt-4 flex flex-col gap-2">
                {monthlyCategoryExpenditure?.map((c) => {
                  return (
                    <div key={c.category} className="flex justify-between">
                      <p>{c.category}</p>
                      <div className="flex">
                        <p className="text-right">
                          {monthlyExpenditure &&
                            c.amount &&
                            ((c.amount / monthlyExpenditure) * -100).toFixed(2)}
                          %
                        </p>
                        <p className=" min-w-[120px]  text-right">
                          {formatCurrency(c.amount!, "USD")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
};

export default MonthlyReport;
