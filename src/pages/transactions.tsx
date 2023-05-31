import { type NextPage } from "next";
import { api } from "~/config/api";

import { useSession } from "next-auth/react";
import Layout from "~/components/Layout";

import Head from "next/head";
import TransactionCard from "~/components/TransactionCard";
import DatePicker from "react-datepicker";
import { useState } from "react";
import { TransactionType } from "~/schemas/transactions";
import { getTransactionTypeCategoryValues } from "~/services/transactions";

const Transactions: NextPage = () => {
  const { data: session } = useSession({ required: true });

  const [filters, setFilters] = useState({ description: "" });

  const { data: transactions } = api.transactions.getAll.useQuery(
    undefined, // no input
    { enabled: session?.user !== undefined }
  );

  const [formType, setFormType] = useState<TransactionType>(
    TransactionType.EXPENSE
  );
  const formCategoryType = getTransactionTypeCategoryValues(formType);

  return (
    <>
      <Head>
        <title>Transactions - Borderless Budgets</title>
      </Head>
      <Layout>
        <main className="flex min-h-screen w-full bg-slate-200 py-5">
          <section className="flex w-full justify-center">
            <div className="flex w-[60%] flex-col">
              <h1 className="mb-2 pl-8 text-xl">Your Transactions</h1>
              {transactions?.map((tx) => {
                return <TransactionCard key={tx.id} tx={tx} />;
              })}
            </div>
          </section>
          <div className="w-[330px]"></div>
          <section className="fixed right-0 top-0 h-screen w-[330px] flex-col  bg-slate-100 py-[5vh] drop-shadow-md">
            <form className="flex flex-col gap-6 px-4 py-2 text-gray-600">
              <div className="flex flex-col">
                <label className="mb-2  text-gray-500" htmlFor="description">
                  Search Description:
                </label>
                <input
                  className="h-[40px] rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                  placeholder="Uber"
                  type="text"
                  id="description"
                  name="description"
                />
              </div>
              <hr className="border-slate-400"></hr>
              <div className="flex flex-col">
                <label className="mb-2 text-gray-500" htmlFor="category">
                  Transaction Type:
                </label>
                <select
                  className="h-[40px] cursor-pointer rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                  id="category"
                  name="category"
                >
                  {Object.values(formCategoryType).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <hr className="border-slate-400"></hr>
              <div className="flex flex-col">
                <label className="mb-2 text-gray-500" htmlFor="category">
                  Category:
                </label>
                <select
                  className="h-[40px] cursor-pointer rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                  id="category"
                  name="category"
                >
                  {Object.values(formCategoryType).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <hr className="border-slate-400"></hr>
              <div className="flex flex-col ">
                <p className="mb-2 text-gray-500">Date</p>
                <div className="flex gap-6">
                  <div className="flex flex-col">
                    <label className="mb-2 text-sm " htmlFor="date">
                      From:
                    </label>
                    <DatePicker
                      className="h-[40px] w-full rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                      placeholderText="04/03/2023"
                      selected={new Date()}
                      onChange={(date) => {
                        console.log(date);
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 text-sm" htmlFor="date">
                      To:
                    </label>
                    <DatePicker
                      className="h-[40px] w-full rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                      placeholderText="04/03/2023"
                      selected={new Date()}
                      onChange={(date) => {
                        console.log(date);
                      }}
                    />
                  </div>
                </div>
              </div>
              <hr className="border-slate-400"></hr>
            </form>
          </section>
        </main>
      </Layout>
    </>
  );
};

export default Transactions;
