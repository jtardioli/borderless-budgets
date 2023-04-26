import { type NextPage } from "next";
import React from "react";
import Layout from "~/components/Layout";
import { api } from "~/config/api";
import { formatCurrency } from "~/utils/currency";

const YearInReview: NextPage = () => {
  const { data } = api.transactions.getYearInReview.useQuery();

  return (
    <Layout>
      <main className="flex h-full w-full flex-col gap-6 bg-slate-200 px-10 py-8">
        <h1 className="text-xl">Year In Review</h1>
        <div className="grid grid-cols-4 gap-4">
          {data &&
            Object.entries(data).map(([date, vals]) => {
              console.log(date, vals);
              return (
                <div
                  key={date}
                  className="flex h-[100px]  w-[250px] flex-col items-start  justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 px-4 text-lg font-medium tracking-wider text-white text-opacity-90 shadow-inner"
                >
                  <h4 className=" opacity-85 text-sm ">{date}</h4>
                  <p>Expenses: {formatCurrency(vals.expenses, "USD")}</p>
                  <p>Income: {formatCurrency(vals.income, "USD")}</p>
                </div>
              );
            })}
        </div>
      </main>
    </Layout>
  );
};

export default YearInReview;
