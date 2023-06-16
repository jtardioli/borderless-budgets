import React, {
  useState,
  type ChangeEvent,
  type FormEvent,
  useEffect,
} from "react";
import { CurrencyCode } from "~/config/currencyExchange";
import { type TransactionNew, TransactionType } from "~/schemas/transactions";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getEmptyTransaction,
  getTransactionTypeCategoryValues,
} from "~/services/transactions";
import { Oval } from "react-loading-icons";
import { api } from "~/config/api";
import { type ZodError, z } from "zod";

const CreateTransactionFormSchema = z
  .object({
    description: z.string().min(1),
    amount: z.string().refine((str) => !isNaN(Number(str)), {
      message: "Amount must be a valid number",
    }),
  })
  .nonstrict();

const CreateTransactionForm = () => {
  const [formData, setFormData] = useState<TransactionNew>(
    getEmptyTransaction(TransactionType.EXPENSE)
  );
  const [invalidFormFields, setInvalidFromFields] = useState<string[]>([]);

  const [formType, setFormType] = useState<TransactionType>(
    TransactionType.EXPENSE
  );

  const formCategoryType = getTransactionTypeCategoryValues(formType);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (invalidFormFields.includes(name)) {
      setInvalidFromFields((prev) => {
        return [
          ...prev.filter((currentInvalidField) => {
            return currentInvalidField !== name;
          }),
        ];
      });
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  const utils = api.useContext();

  const createTx = api.transactions.create.useMutation({
    async onSuccess(input) {
      await utils.transactions.invalidate();
      setFormData(getEmptyTransaction(formType));
    },
  });

  function addExpense(e: FormEvent) {
    e.preventDefault();
    const parsedSchema = CreateTransactionFormSchema.safeParse(formData);

    if (!parsedSchema.success) {
      setInvalidFromFields(
        Object.keys(parsedSchema.error.flatten().fieldErrors)
      );
      return;
    }
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
  return (
    <div className=" flex-[1] flex-col overflow-hidden rounded-md border-[1px] border-gray-300 bg-white pb-2 drop-shadow-sm">
      <div className=" flex h-12  border-b-[1px] border-gray-300">
        <button
          className={`flex-1 ${
            formType === TransactionType.EXPENSE
              ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-opacity-90 shadow-md"
              : "bg-gray-100 text-gray-700 shadow-inner"
          } `}
          onClick={() => {
            setFormType(TransactionType.EXPENSE);
            setFormData(getEmptyTransaction(TransactionType.EXPENSE));
          }}
        >
          Expense
        </button>
        <button
          className={`flex-1 ${
            formType === TransactionType.INCOME
              ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-opacity-90 shadow-md"
              : "border-l-[1px] border-r-[1px] border-slate-300 bg-gray-100 text-gray-700 shadow-inner"
          } `}
          onClick={() => {
            setFormType(TransactionType.INCOME);
            setFormData(getEmptyTransaction(TransactionType.INCOME));
          }}
        >
          Income
        </button>
        <button
          className={`flex-1 ${
            formType === TransactionType.INVESTMENT
              ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-opacity-90 shadow-md"
              : "bg-gray-100 text-gray-700 shadow-inner"
          } `}
          onClick={() => {
            setFormType(TransactionType.INVESTMENT);
            setFormData(getEmptyTransaction(TransactionType.INVESTMENT));
          }}
        >
          Invest
        </button>
      </div>

      <form
        className="mt-2 flex flex-col gap-2 px-4 py-2 text-gray-600"
        onSubmit={addExpense}
      >
        <div className="flex flex-col">
          <label className="mb-2 text-sm text-gray-500" htmlFor="description">
            Description:
          </label>
          <input
            className={`h-[40px] rounded-md border-[1px]   px-2 shadow-inner outline-none ${
              invalidFormFields.includes("description")
                ? "border-red-700"
                : "border-gray-500"
            }`}
            placeholder="Uber"
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          {invalidFormFields.includes("description") && (
            <p className="ml-1 mt-1 text-xs text-red-700">
              You must provide a valid description
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="mb-2 text-sm text-gray-500" htmlFor="category">
            Category:
          </label>
          <select
            className="h-[40px] cursor-pointer rounded-md border-[1px] border-gray-500 px-2 shadow-inner outline-none"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {Object.values(formCategoryType).map((category) => (
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
          <div
            className={`flex overflow-hidden rounded-md border-[1px] ${
              invalidFormFields.includes("description")
                ? "border-red-700"
                : "border-gray-500"
            }`}
          >
            <input
              className="h-[40px] w-full   border-none  px-2 shadow-inner outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="0.00"
              type="number"
              id="amount"
              name="amount"
              value={formData.amount === 0 ? "" : formData.amount}
              onChange={handleChange}
            />
            <select
              className="w-24 cursor-pointer border-none bg-gradient-to-br from-indigo-600 to-indigo-500 text-center text-white shadow-inner outline-none"
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
          {invalidFormFields.includes("amount") && (
            <p className="ml-1 mt-1 text-xs text-red-700">
              You must provide a valid amount
            </p>
          )}
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
          title={
            formType === TransactionType.INVESTMENT
              ? "Adding investments do not affect your balance, they are simply a means of tracking your cost basis"
              : ""
          }
          className="mt-4 flex h-10 items-center justify-center  rounded-md bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-opacity-90 shadow-inner"
          disabled={createTx.isLoading}
        >
          {createTx.isLoading ? <Oval width="28px" /> : `Add ${formType}`}
        </button>
      </form>
    </div>
  );
};

export default CreateTransactionForm;
