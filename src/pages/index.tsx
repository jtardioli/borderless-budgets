import { useRef } from "react";

import { RiDeleteBinFill } from "react-icons/ri";
import { GiExpense, GiReceiveMoney } from "react-icons/gi";

import { type NextPage } from "next";
import { api } from "~/config/api";
import { TransactionType } from "~/schemas/transactions";
import { formatCurrency } from "~/utils/currency";
import { useSession } from "next-auth/react";
import Layout from "~/components/Layout";
import { Oval } from "react-loading-icons";
import Skeleton from "~/components/Skeleton";
import { getMonthStartAndEnd } from "~/utils/dates";
import { format } from "date-fns";
import Head from "next/head";

import {
  AiFillCloseCircle,
  AiOutlinePlus,
  AiOutlineStock,
} from "react-icons/ai";
import CreateTransactionForm from "~/components/CreateTransactionForm";

const Home: NextPage = () => {
  const { data: session } = useSession({ required: true });

  const utils = api.useContext();

  const { data: transactions } = api.transactions.getAll.useQuery(
    undefined, // no input
    { enabled: session?.user !== undefined }
  );
  const { data: balance } = api.transactions.getBalance.useQuery(
    undefined, // no input,
    {
      enabled: session?.user !== undefined,
    }
  );
  const { data: monthlyExpenditure } =
    api.transactions.getMonthlyExpenditure.useQuery(getMonthStartAndEnd(), {
      enabled: session?.user !== undefined,
    });

  const { data: monthlyIncome } = api.transactions.getMonthlyIncome.useQuery(
    getMonthStartAndEnd(),
    {
      enabled: session?.user !== undefined,
    }
  );

  const { data: monthlyInvestments } =
    api.transactions.getMonthlyInvestments.useQuery(getMonthStartAndEnd(), {
      enabled: session?.user !== undefined,
    });

  const deleteTx = api.transactions.delete.useMutation({
    async onSuccess(input) {
      await utils.transactions.invalidate();
    },
  });

  const modalRef = useRef<HTMLDialogElement>(null);

  function renderTransactions() {
    return transactions?.map((tx) => {
      return (
        <div
          key={tx.id}
          className="flex w-full items-center justify-between px-4  text-gray-700 md:px-8"
        >
          <div className="flex w-full items-center justify-between border-b-[1px] border-slate-200 py-4 ">
            <div className="hidden flex-1 items-center sm:flex">
              {tx.type === TransactionType.EXPENSE && (
                <GiExpense size={40} className="text-gray-900 text-red-900" />
              )}
              {tx.type === TransactionType.INCOME && (
                <GiReceiveMoney
                  size={40}
                  className="text-gray-900 text-green-900"
                />
              )}
              {tx.type === TransactionType.INVESTMENT && (
                <AiOutlineStock
                  size={40}
                  className="text-blue-900 text-gray-900"
                />
              )}
            </div>

            <div className="flex flex-[1.5] flex-col sm:flex-1  md:flex-[2]">
              <p className="text-sm font-medium capitalize sm:text-base">
                {tx.description}
              </p>
              <p className="text-xs text-gray-600 sm:text-sm">{tx.category}</p>
            </div>
            <p className="flex-[1.3] text-sm sm:text-base ">
              {`${
                tx.type === TransactionType.EXPENSE ? "-" : ""
              }${formatCurrency(tx.amount, "USD")}`}
            </p>
            <p className="flex-1 text-sm sm:text-base">
              {format(new Date(tx.date), "dd/MM/yyyy ")}
            </p>
            <div className="flex flex-[0.6] items-center justify-end sm:flex-[1]">
              {deleteTx.isLoading && deleteTx?.variables?.id === tx.id ? (
                <Oval stroke="#C53030" width="20px" />
              ) : (
                <RiDeleteBinFill
                  className="text-gray-900 hover:text-red-800"
                  onClick={() => {
                    deleteTx.mutate({ id: tx.id });
                  }}
                  style={{ cursor: "pointer" }}
                  size={23}
                />
              )}
            </div>
          </div>
        </div>
      );
    });
  }

  return (
    <>
      <Head>
        <title>Dashboard - Borderless Budgets</title>
      </Head>
      <Layout>
        <main className="flex min-h-screen w-full flex-col gap-6 bg-slate-200 px-2 py-10 sm:px-6 lg:px-14">
          <section className="grid grid-cols-2 items-center justify-between gap-4 rounded-md border-[1px] border-gray-300 bg-white p-4 md:grid-cols-4 lg:gap-10 lg:px-8">
            <div className="flex h-[10vh] flex-col items-start justify-center overflow-hidden  rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 px-4 font-medium tracking-wider text-white text-opacity-90 shadow-inner ">
              {balance != null ? (
                <>
                  <p className="text-xs leading-[10px] sm:leading-[6px]">
                    Total
                  </p>
                  <p className="text-xs ">Balance</p>
                  <p className="text-ellipsis text-xl sm:text-2xl">
                    {formatCurrency(balance, "USD")}
                  </p>
                </>
              ) : (
                <Skeleton bg="bg-indigo-400" />
              )}
            </div>

            <div className="flex h-[10vh] flex-col items-start justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 px-4 font-medium tracking-wider text-white text-opacity-90 shadow-inner ">
              {monthlyExpenditure != null ? (
                <>
                  <p className="text-xs leading-[10px] sm:leading-[6px]">
                    Monthly
                  </p>
                  <p className="text-xs">Expenses</p>
                  <p className="text-ellipsis text-xl sm:text-2xl">
                    {formatCurrency(monthlyExpenditure, "USD")}
                  </p>
                </>
              ) : (
                <Skeleton bg="bg-indigo-400" />
              )}
            </div>
            <div className="flex h-[10vh] flex-col items-start justify-center overflow-hidden   rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 px-4 font-medium tracking-wider text-white text-opacity-90 shadow-inner ">
              {monthlyIncome != null ? (
                <>
                  <p className="text-xs leading-[10px] sm:leading-[6px]">
                    Monthly
                  </p>
                  <p className="text-xs">Income</p>
                  <p className="text-ellipsis text-xl sm:text-2xl">
                    {formatCurrency(monthlyIncome, "USD")}
                  </p>
                </>
              ) : (
                <Skeleton bg="bg-indigo-400" />
              )}
            </div>
            <div className="flex h-[10vh] flex-col items-start justify-center overflow-hidden   rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 px-4 font-medium tracking-wider text-white text-opacity-90 shadow-inner ">
              {monthlyInvestments != null ? (
                <>
                  <p className="text-xs leading-[10px] sm:leading-[6px]">
                    Monthly
                  </p>
                  <p className="text-xs">Investments</p>
                  <p className="text-ellipsis text-xl sm:text-2xl">
                    {formatCurrency(monthlyInvestments, "USD")}
                  </p>
                </>
              ) : (
                <Skeleton bg="bg-indigo-400" />
              )}
            </div>
          </section>

          <section className=" flex flex-[1] gap-10">
            {/* Transactions */}
            <div className="flex-[2]">
              <h1 className="px-2 py-2 text-gray-700 sm:px-8">
                Recent Transactions
              </h1>

              <div className="max-h-[60vh] min-h-[475px]  overflow-y-auto  rounded-md border-[1px] border-gray-300 bg-white py-4 drop-shadow-sm">
                {!transactions &&
                  [...(Array(5) as number[])].map((_, i) => {
                    return (
                      <div
                        key={i}
                        className="mx-8 my-4 h-20 overflow-hidden rounded-md"
                      >
                        <Skeleton bg="bg-slate-200" />
                      </div>
                    );
                  })}

                {transactions && transactions.length === 0 && (
                  <div className="mt-8 flex w-full flex-col justify-center  text-gray-700">
                    <p className="text-center">
                      Oops! No transactions to display yet.
                    </p>
                    <p className="text-center">
                      Add an expense, income, or investment to begin tracking
                      your finances.
                    </p>
                    {[...(Array(3) as number[])].map((_, i) => {
                      return (
                        <div
                          key={i}
                          className="mx-8 my-4 h-20 overflow-hidden rounded-md"
                        >
                          <Skeleton bg="bg-slate-200" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {renderTransactions()}
              </div>
            </div>

            {/* Create Expense*/}
            <div className="mt-10 hidden lg:block">
              <CreateTransactionForm />
            </div>
          </section>
        </main>
        <button
          className="fixed bottom-20  right-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 text-white drop-shadow-xl sm:bottom-6 sm:right-6 lg:hidden"
          onClick={() => {
            modalRef.current!.showModal();
          }}
        >
          <AiOutlinePlus size={27} />
        </button>
        <dialog
          className=" rounded-lg bg-slate-100 drop-shadow-xl backdrop:bg-[rgba(0,0,0,0.3)]"
          ref={modalRef}
        >
          <div className="flex w-full items-center justify-end">
            <button
              onClick={() => {
                modalRef.current!.close();
              }}
            >
              <AiFillCloseCircle
                size={30}
                className="hover:pointer mb-3 text-slate-800"
              />
            </button>
          </div>
          <CreateTransactionForm />
        </dialog>
      </Layout>
    </>
  );
};

export default Home;
