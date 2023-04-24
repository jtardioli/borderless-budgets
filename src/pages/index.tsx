import { type ChangeEvent, type FormEvent, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import {
  endOfMonth as getEndOfMonth,
  format,
  startOfMonth as getStartOfMonth,
} from "date-fns";

import { AiFillHome } from "react-icons/ai";

import { RiDeleteBinFill } from "react-icons/ri";
import { GiExpense, GiReceiveMoney } from "react-icons/gi";

import { type NextPage } from "next";
import { api } from "~/utils/api";
import {
  TransactionCategory,
  type TransactionNew,
  TransactionType,
} from "~/schemas/transactions";
import { formatCurrency } from "~/utils/currency";

const emptyTransaction = {
  description: "",
  category: TransactionCategory.HOUSING,
  amount: 0,
  date: new Date(),
  type: TransactionType.EXPENSE,
};

function getCurrentMonth() {
  const currentDate = new Date();
  const startOfMonth = getStartOfMonth(currentDate);
  const endOfMonth = getEndOfMonth(currentDate);

  return {
    startOfMonth,
    endOfMonth,
  };
}

const Home: NextPage = () => {
  const utils = api.useContext();
  const { data: transactions } = api.transactions.getAll.useQuery();
  const { data: monthlyExpenditure } =
    api.transactions.getMonthlyExpenditure.useQuery(getCurrentMonth());
  const createTx = api.transactions.create.useMutation({
    async onSuccess(input) {
      await utils.transactions.invalidate();
    },
  });

  const deleteTx = api.transactions.delete.useMutation({
    async onSuccess(input) {
      await utils.transactions.invalidate();
    },
  });

  const balance = transactions?.reduce((prev, cur) => {
    if (cur.type === TransactionType.EXPENSE) {
      return prev - cur.amount;
    }

    if (cur.type === TransactionType.INCOME) {
      return prev + cur.amount;
    }

    return 0;
  }, 0); // Don't forget to provide the initial value for the accumulator

  const [formData, setFormData] = useState<TransactionNew>(emptyTransaction);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function addExpense(e: FormEvent) {
    e.preventDefault();
    const { description, category, amount, date, type } = formData;
    createTx.mutate({
      description,
      category,
      amount: Number(amount),
      date,
      type,
    });
    setFormData(emptyTransaction);
  }

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
              <RiDeleteBinFill
                className="text-gray-900 "
                onClick={() => {
                  deleteTx.mutate({ id: tx.id });
                }}
                style={{ cursor: "pointer" }}
                size={23}
              />
            </div>
          </div>
        </div>
      );
    });
  }

  return (
    <div className="flex h-screen w-screen ">
      <div className="flex h-full w-56 flex-col items-center justify-start bg-slate-100 bg-gradient-to-br py-[10%] drop-shadow-md">
        <div className="flex items-center">
          <AiFillHome size={30} className="mr-4 text-indigo-600" />
          <h2 className="text-lg ">Dashboard</h2>
        </div>
      </div>
      <main className="flex h-full w-full flex-col gap-6 bg-slate-200 px-10 py-5">
        <section className="flex h-[200px] items-center gap-10 rounded-md border-[1px] border-gray-300 bg-white px-8">
          <div className="flex  h-[100px] w-[250px] flex-col  items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 text-lg font-medium tracking-wider text-white text-opacity-90 shadow-inner">
            <p>Total Balaaaance:</p>
            <p className="text-ellipsis text-2xl">
              {formatCurrency(balance!, "USD")}
            </p>
          </div>
          <div className="flex h-[100px] w-[250px] flex-col  items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 text-lg font-medium tracking-wider text-white text-opacity-90 shadow-inner">
            <p>Monthly Expenditure:</p>
            <p className="text-2xl">
              {formatCurrency(monthlyExpenditure!, "USD")}
            </p>
          </div>
          <div className="flex h-[100px] w-[250px] flex-col  items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 text-lg font-medium tracking-wider text-white text-opacity-90 shadow-inner">
            <p>Monthly Income:</p>
            <p className="text-2xl">{formatCurrency(balance!, "USD")}</p>
          </div>
        </section>

        <section className=" flex flex-[1] gap-10">
          {/* Transactions */}
          <div className="flex-[2]">
            <h1 className="p-8 py-2 text-gray-700">Recent Transactions</h1>
            <div className="h-[500px]  overflow-y-auto  rounded-md border-[1px] border-gray-300 bg-white py-4 drop-shadow-sm">
              {renderTransactions()}
            </div>
          </div>

          {/* Create Expense*/}
          <div className="mt-10 h-[450px]  flex-[1] flex-col overflow-hidden rounded-md border-[1px] border-gray-300 bg-white drop-shadow-sm">
            <div className=" flex h-12  border-b-[1px] border-gray-300">
              <button className="flex-1 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-opacity-90 shadow-md">
                Add Expense
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 shadow-inner">
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
                  onChange={handleChange}
                >
                  {Object.values(TransactionCategory).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-2 text-sm text-gray-500" htmlFor="amount">
                  Amount:
                </label>
                <input
                  className="h-[40px] rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
                  placeholder="0.00"
                  type="text"
                  id="amount"
                  name="amount"
                  value={formData.amount === 0 ? "" : formData.amount}
                  onChange={handleChange}
                />
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
                    setFormData((prev) => ({ ...prev, date: date as Date }));
                  }}
                />
              </div>

              <button className="h-10 rounded-md bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-opacity-90 shadow-inner">
                Add Expense
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

// const AuthShowcase: React.FC = () => {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = api.example.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-white">
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
//         onClick={sessionData ? () => void signOut() : () => void signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// };
