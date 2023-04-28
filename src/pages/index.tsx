import {
  type ChangeEvent,
  type FormEvent,
  useState,
  type ReactNode,
} from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

import { RiDeleteBinFill } from "react-icons/ri";
import { GiExpense, GiReceiveMoney } from "react-icons/gi";

import { type NextPage } from "next";
import { api } from "~/config/api";
import {
  type TransactionCategory,
  type TransactionNew,
  TransactionType,
  TransactionCategoryObject,
  TransactionExpenseCategory,
  TransactionIncomeCategory,
} from "~/schemas/transactions";
import { formatCurrency } from "~/utils/currency";
import { useSession } from "next-auth/react";
import Layout from "~/components/Layout";
import { Oval } from "react-loading-icons";
import { CurrencyCode } from "~/config/currencyExchange";
import Skeleton from "~/components/Skeleton";
import { getMonthStartAndEnd } from "~/utils/dates";
import { format } from "date-fns";
import Head from "next/head";

function getEmptyTransaction(
  type: TransactionType,
  defaultCategory: TransactionCategory
) {
  return {
    description: "",
    category: defaultCategory,
    amount: 0,
    date: new Date(),
    type,
    currency: CurrencyCode.CAD,
  };
}

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

  const [formType, setFormType] = useState<TransactionType>(
    TransactionType.EXPENSE
  );

  const createTx = api.transactions.create.useMutation({
    async onSuccess(input) {
      await utils.transactions.invalidate();
      setFormData(
        formType === TransactionType.EXPENSE
          ? getEmptyTransaction(
              TransactionType.EXPENSE,
              TransactionExpenseCategory.HOUSING
            )
          : getEmptyTransaction(
              TransactionType.INCOME,
              TransactionIncomeCategory.SALARY
            )
      );
    },
  });

  const deleteTx = api.transactions.delete.useMutation({
    async onSuccess(input) {
      await utils.transactions.invalidate();
    },
  });

  const [formData, setFormData] = useState<TransactionNew>(
    getEmptyTransaction(
      TransactionType.EXPENSE,
      TransactionExpenseCategory.HOUSING
    )
  );

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function addExpense(e: FormEvent) {
    e.preventDefault();
    const { description, category, amount, date, type, currency } = formData;
    createTx.mutate({
      description,
      category,
      amount: Number(amount),
      date,
      type,
      currency,
    });
  }

  const formCategoryType:
    | typeof TransactionExpenseCategory
    | typeof TransactionIncomeCategory =
    formType === TransactionType.EXPENSE
      ? TransactionExpenseCategory
      : TransactionIncomeCategory;

  function renderTransactions() {
    return transactions?.map((tx) => {
      return (
        <div
          key={tx.id}
          className="flex w-full items-center justify-between px-8 text-gray-700"
        >
          <div className="flex w-full items-center justify-between border-b-[1px] border-slate-200 py-4 ">
            <div className="flex flex-1 items-center">
              {tx.type === TransactionType.EXPENSE && (
                <GiExpense size={40} className="text-gray-900 text-red-800" />
              )}
              {tx.type === TransactionType.INCOME && (
                <GiReceiveMoney
                  size={40}
                  className="text-gray-900 text-green-800"
                />
              )}
            </div>

            <div className="flex flex-[2]  flex-col">
              <p className="text-base font-medium capitalize">
                {tx.description}
              </p>
              <p className="text-sm text-gray-600">{tx.category}</p>
            </div>
            <p className="flex-[1.3] ">-{formatCurrency(tx.amount, "USD")}</p>
            <p className="flex-1 ">
              {format(new Date(tx.date), "dd/MM/yyyy ")}
            </p>
            <div className="flex flex-[1] items-center justify-end">
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

  console.log(monthlyExpenditure, "gg");

  return (
    <>
      <Head>
        <title>Dashboard - Borderless Budgets</title>
      </Head>
      <Layout>
        <main className="flex h-full w-full flex-col gap-6 bg-slate-200 px-10 py-5">
          <section className="flex h-[200px] items-center gap-10 rounded-md border-[1px] border-gray-300 bg-white px-8">
            <div className=" flex h-[100px] w-[220px] flex-col items-center justify-center  overflow-hidden overflow-hidden rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 text-lg font-medium tracking-wider text-white text-opacity-90 shadow-inner">
              {balance != null ? (
                <>
                  <p>Total Balance</p>
                  <p className="text-ellipsis text-2xl">
                    {formatCurrency(balance, "USD")}
                  </p>
                </>
              ) : (
                <Skeleton bg="bg-indigo-400" />
              )}
            </div>

            <div className="flex h-[100px] w-[220px] flex-col items-center  justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 text-lg font-medium tracking-wider text-white text-opacity-90 shadow-inner">
              {monthlyExpenditure != null ? (
                <>
                  <p>Monthly Expenditure</p>
                  <p className="text-2xl">
                    {formatCurrency(monthlyExpenditure, "USD")}
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
              <h1 className="p-8 py-2 text-gray-700">Recent Transactions</h1>

              <div className="h-[500px]  overflow-y-auto  rounded-md border-[1px] border-gray-300 bg-white py-4 drop-shadow-sm">
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

                {renderTransactions()}
              </div>
            </div>

            {/* Create Expense*/}
            <div className="mt-10 h-[450px]  flex-[1] flex-col overflow-hidden rounded-md border-[1px] border-gray-300 bg-white drop-shadow-sm">
              <div className=" flex h-12  border-b-[1px] border-gray-300">
                <button
                  className={`flex-1 ${
                    formType === TransactionType.EXPENSE
                      ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-opacity-90 shadow-md"
                      : "bg-gray-100 text-gray-700 shadow-inner"
                  } `}
                  onClick={() => {
                    setFormType(TransactionType.EXPENSE);
                    setFormData(
                      getEmptyTransaction(
                        TransactionType.EXPENSE,
                        TransactionExpenseCategory.HOUSING
                      )
                    );
                  }}
                >
                  Add Expense
                </button>
                <button
                  className={`flex-1 ${
                    formType === TransactionType.INCOME
                      ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-opacity-90 shadow-md"
                      : "bg-gray-100 text-gray-700 shadow-inner"
                  } `}
                  onClick={() => {
                    setFormType(TransactionType.INCOME);
                    setFormData(
                      getEmptyTransaction(
                        TransactionType.INCOME,
                        TransactionIncomeCategory.SALARY
                      )
                    );
                  }}
                >
                  Add Income
                </button>
              </div>
              <form
                className="flex flex-col gap-4 px-4 py-2 text-gray-600"
                onSubmit={addExpense}
              >
                <div className="flex flex-col">
                  <label
                    className="mb-2 text-sm text-gray-500"
                    htmlFor="description"
                  >
                    Description:
                  </label>
                  <input
                    className="h-[40px] rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                    placeholder="Uber"
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    className="mb-2 text-sm text-gray-500"
                    htmlFor="category"
                  >
                    Category:
                  </label>
                  <select
                    className="h-[40px] cursor-pointer rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {Object.values(formCategoryType).map(
                      (category: keyof typeof formCategoryType) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label
                    className="mb-2 text-sm text-gray-500"
                    htmlFor="amount"
                  >
                    Amount:
                  </label>
                  <div className="flex overflow-hidden rounded-md border-[1px] border-gray-500 bg-red-300">
                    <input
                      className="h-[40px] w-full   border-none  px-2 shadow-inner outline-none"
                      placeholder="0.00"
                      type="text"
                      id="amount"
                      name="amount"
                      value={formData.amount === 0 ? "" : formData.amount}
                      onChange={handleChange}
                    />
                    <select
                      className="w-24 cursor-pointer border-none bg-gradient-to-br from-indigo-600 to-indigo-500 text-center text-white shadow-inner outline-none"
                      defaultValue={CurrencyCode.CAD}
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                    >
                      {Object.values(CurrencyCode).map((currency) => {
                        return (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 text-sm text-gray-500" htmlFor="date">
                    Date:
                  </label>
                  <DatePicker
                    className="h-[40px] w-full rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                    placeholderText="04/03/2023"
                    selected={formData.date as Date}
                    onChange={(date) => {
                      setFormData((prev) => ({
                        ...prev,
                        date: date as Date,
                      }));
                    }}
                  />
                </div>

                <button
                  className="flex h-10 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-opacity-90 shadow-inner"
                  disabled={createTx.isLoading}
                >
                  {createTx.isLoading ? <Oval width="28px" /> : "Add Expense "}
                </button>
              </form>
            </div>
          </section>
        </main>
      </Layout>
    </>
  );
};

export default Home;
