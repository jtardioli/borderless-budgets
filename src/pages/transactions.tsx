import { type NextPage } from "next";
import { api } from "~/config/api";

import { useSession } from "next-auth/react";
import Layout from "~/components/Layout";

import Head from "next/head";
import TransactionCard from "~/components/TransactionCard";

import {
  type ChangeEvent,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";

import { type Transaction } from "@prisma/client";
import { Oval } from "react-loading-icons";
import {
  type TransactionExpenseCategory,
  type TransactionIncomeCategory,
  type TransactionInvestmentCategory,
  TransactionType,
} from "~/schemas/transactions";
import { ALL } from "~/config/constants";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { getTransactionTypeCategoryValues } from "~/services/transactions";
import {
  BsChevronBarLeft,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
import { AiFillCloseCircle } from "react-icons/ai";

const Transactions: NextPage = () => {
  const { data: session } = useSession({ required: true });

  const [searchParams, setSearchParams] = useState({
    description: "",
    txType: ALL as "all" | TransactionType,
    category: ALL as
      | "all"
      | TransactionExpenseCategory
      | TransactionIncomeCategory
      | TransactionInvestmentCategory,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const formCategoryType = getTransactionTypeCategoryValues(
    searchParams.txType
  );

  const { data, fetchNextPage, isFetching, hasNextPage } =
    api.transactions.getAllPaginated.useInfiniteQuery(
      {
        limit: 30,
        ...searchParams,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: session?.user !== undefined,
      }
    );

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetching) return;
      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]!.isIntersecting && hasNextPage) {
          fetchNextPage().catch((err) => {
            console.log(err);
          });
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetching, hasNextPage]
  );
  // Convert pages into a single array
  const transactions = data
    ? data.pages.reduce<Transaction[]>(
        (acc, curr) => [...acc, ...curr.transactions],
        []
      )
    : [];

  const [isSearchFormVisible, setIsSearchFormVisible] = useState(false);

  const fixedSectionRef = useRef(null);

  return (
    <>
      <Head>
        <title>Transactions - Borderless Budgets</title>
      </Head>
      <Layout>
        <main className="flex min-h-screen w-full bg-slate-200 py-5">
          <section className="flex w-full justify-center">
            <div className="flex w-full flex-col items-center pr-8 sm:pr-4 xl:w-[80%] 2xl:w-[70%]">
              <div className="w-full">
                <h1 className="mb-8 ml-8 text-2xl">Your Transactions</h1>
              </div>

              {transactions?.map((tx, index) => {
                const isLastItem = index === transactions.length - 1;
                if (isLastItem) {
                  return (
                    <div className="w-full" key={tx.id} ref={lastElementRef}>
                      <TransactionCard tx={tx} />
                    </div>
                  );
                }
                return <TransactionCard key={tx.id} tx={tx} />;
              })}
              {isFetching && <Oval stroke="black" />}
            </div>
          </section>

          <button
            className={`fixed right-0 top-20 z-10 h-[70px] rounded-s-md bg-gradient-to-br from-indigo-600 to-indigo-500 drop-shadow-xl transition-transform duration-300 xl:hidden  ${
              !isSearchFormVisible
                ? "translate-x-0 transform"
                : "-translate-x-[329px] transform"
            }`}
            onClick={() => {
              setIsSearchFormVisible((prevVisible) => !prevVisible);
            }}
          >
            <BsChevronRight
              size={30}
              color="white"
              className={`transition-transform duration-200  ${
                !isSearchFormVisible
                  ? "rotate-180 transform"
                  : "rotate-0 transform"
              }`}
            />
          </button>
          <div className="hidden h-screen w-[350px] xl:block"></div>
          <section
            className={`fixed right-0 top-0 h-screen w-[330px] flex-col gap-6 bg-slate-100 px-4 py-[5vh] drop-shadow-md transition-transform duration-300 ${
              isSearchFormVisible
                ? "translate-x-0 transform"
                : "translate-x-full transform"
            } xl:translate-x-0`}
            ref={fixedSectionRef}
          >
            <div className="flex flex-col ">
              <label className="text mb-2 text-gray-500" htmlFor="description">
                Search Description:
              </label>
              <input
                className="h-[40px] rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                placeholder="Uber"
                type="text"
                id="description"
                name="description"
                value={searchParams.description}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setSearchParams((prev) => {
                    return { ...prev, description: e.target.value };
                  });
                }}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2  text-gray-500" htmlFor="tx-type">
                Transaction Type:
              </label>
              <select
                className="h-[40px] cursor-pointer rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                id="tx-type"
                name="tx-type"
                value={searchParams.txType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setSearchParams((prev) => {
                    return {
                      ...prev,
                      txType: e.target.value as "all" | TransactionType,
                    };
                  });
                }}
              >
                <option value={ALL}>All Types</option>
                {Object.values(TransactionType).map((txType) => (
                  <option key={txType} value={txType}>
                    {txType}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-gray-500" htmlFor="category">
                Category:
              </label>
              <select
                className="h-[40px] cursor-pointer rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                id="category"
                name="category"
                value={searchParams.category}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setSearchParams((prev) => {
                    return {
                      ...prev,
                      category: e.target.value as
                        | "all"
                        | TransactionExpenseCategory
                        | TransactionIncomeCategory
                        | TransactionInvestmentCategory,
                    };
                  });
                }}
              >
                <option value={ALL}>All Categories</option>
                {Object.values(formCategoryType).map((category, i) => (
                  <option key={i} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-gray-500" htmlFor="date">
                Date:
              </label>
              <div className="flex items-end gap-4">
                <div>
                  <p className="mb-2 text-xs text-gray-700">From</p>
                  <DatePicker
                    className="h-[40px] w-full rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                    placeholderText="04/03/2023"
                    selected={searchParams.startDate as Date}
                    onChange={(date) => {
                      setSearchParams((prev) => ({
                        ...prev,
                        startDate: date || undefined,
                      }));
                    }}
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs text-gray-700">To</p>
                  <DatePicker
                    className="h-[40px] w-full rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                    placeholderText="04/03/2023"
                    selected={searchParams.endDate as Date}
                    onChange={(date) => {
                      setSearchParams((prev) => ({
                        ...prev,
                        endDate: date || undefined,
                      }));
                    }}
                  />
                </div>

                <button
                  className="h-[40px] w-[60px] rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                  onClick={() => {
                    setSearchParams((prev) => ({
                      ...prev,
                      endDate: undefined,
                      startDate: undefined,
                    }));
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    </>
  );
};

export default Transactions;
