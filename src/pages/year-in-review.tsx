import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import { Grid, Oval } from "react-loading-icons";

import Layout from "~/components/Layout";
import { api } from "~/config/api";
import { formatCurrency } from "~/utils/currency";

const YearInReview: NextPage = () => {
  const { data, isFetching } = api.transactions.getYearInReview.useQuery();

  const displayEmptyState =
    !isFetching && data && Object.keys(data).length === 0;

  return (
    <>
      <Head>
        <title>Year In Review - Borderless Budgets</title>
      </Head>
      <Layout>
        <main className="flex min-h-screen w-full flex-col gap-6 bg-slate-200 px-10 py-8">
          <h1 className="text-xl">Year In Review</h1>
          {isFetching && (
            <div className="mt-32 flex justify-center">
              <Grid fill="#4f46e5" width="50px" />
            </div>
          )}
          <div className="grid grid-cols-4 gap-4">
            {!isFetching &&
              data &&
              Object.entries(data).map(([date, vals]) => {
                console.log(date, vals);
                return (
                  <Link
                    key={date}
                    href={`/monthly-report/${String(new Date(date))}`}
                  >
                    <div className="flex h-[130px]  w-[250px] flex-col items-start  justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 px-4 text-lg font-medium tracking-wider text-white text-opacity-90 shadow-inner">
                      <h4 className=" opacity-85 text-sm ">{date}</h4>
                      <p>
                        Balance:{" "}
                        {formatCurrency(vals.income + vals.expenses, "USD")}
                      </p>
                      <p>Expenses: {formatCurrency(vals.expenses, "USD")}</p>
                      <p>Income: {formatCurrency(vals.income, "USD")}</p>
                    </div>
                  </Link>
                );
              })}
          </div>

          {displayEmptyState && (
            <div className="mt-6 flex  w-full flex-col items-center gap-6  rounded-md border-[1px] border-gray-300 bg-white px-6 py-12 drop-shadow-sm">
              <div className="flex flex-col text-center">
                <p>
                  Looks like there are no transactions for the selected year.
                </p>
                <p>
                  Choose a different year or start adding new transactions to
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
        </main>
      </Layout>
    </>
  );
};

export default YearInReview;
