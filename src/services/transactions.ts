import { CurrencyCode } from "~/config/currencyExchange";
import {
  TransactionExpenseCategory,
  TransactionIncomeCategory,
  TransactionInvestmentCategory,
  TransactionType,
} from "~/schemas/transactions";
import { assertNever } from "~/utils/types";

export function getEmptyTransaction(type: TransactionType) {
  if (type === TransactionType.EXPENSE) {
    return {
      description: "",
      category: TransactionExpenseCategory.HOUSING,
      amount: 0,
      date: new Date(),
      type,
      currency: CurrencyCode.CAD,
    };
  }

  if (type === TransactionType.INCOME) {
    return {
      description: "",
      category: TransactionIncomeCategory.SALARY,
      amount: 0,
      date: new Date(),
      type,
      currency: CurrencyCode.CAD,
    };
  }

  if (type === TransactionType.INVESTMENT) {
    return {
      description: "",
      category: TransactionInvestmentCategory.TFSA,
      amount: 0,
      date: new Date(),
      type,
      currency: CurrencyCode.CAD,
    };
  }

  // Throw an error if none of the cases match
  return assertNever(type);
}
