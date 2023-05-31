import React, { type FC } from "react";
import { AiOutlineStock } from "react-icons/ai";
import { GiExpense, GiReceiveMoney } from "react-icons/gi";
import { RiDeleteBinFill } from "react-icons/ri";
import { Oval } from "react-loading-icons";
import { TransactionType } from "~/schemas/transactions";
import { formatCurrency } from "~/utils/currency";
import { format } from "date-fns";
import { api } from "~/config/api";
import { type Transaction } from "@prisma/client";

interface Props {
  tx: Transaction;
}

const TransactionCard: FC<Props> = ({ tx }) => {
  const utils = api.useContext();

  const deleteTx = api.transactions.delete.useMutation({
    async onSuccess(input) {
      await utils.transactions.invalidate();
    },
  });
  return (
    <div className="flex w-full items-center justify-between px-4  text-gray-700 md:px-8 ">
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
            <AiOutlineStock size={40} className="text-blue-900 text-gray-900" />
          )}
        </div>

        <div className="flex flex-[1.5] flex-col sm:flex-1  md:flex-[2]">
          <p className="text-sm font-medium capitalize sm:text-base">
            {tx.description}
          </p>
          <p className="text-xs text-gray-600 sm:text-sm">{tx.category}</p>
        </div>
        <p className="flex-[1.3] text-sm sm:text-base ">
          {`${tx.type === TransactionType.EXPENSE ? "-" : ""}${formatCurrency(
            tx.amount,
            "USD"
          )}`}
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
};

export default TransactionCard;
