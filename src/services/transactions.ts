import { CurrencyCode } from "~/config/currencyExchange";
import {
  TransactionExpenseCategory,
  TransactionIncomeCategory,
  TransactionInvestmentCategory,
  TransactionType,
} from "~/schemas/transactions";
import { assertNever } from "~/utils/types";
import { ALL } from "~/config/constants";

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

export function getTransactionTypeCategoryValues(
  formType: "all" | TransactionType
): string[] {
  switch (formType) {
    case ALL:
      return [
        ...Object.values(TransactionExpenseCategory),
        ...Object.values(TransactionIncomeCategory),
        ...Object.values(TransactionInvestmentCategory),
      ];
    case TransactionType.EXPENSE:
      return Object.values(TransactionExpenseCategory);
    case TransactionType.INCOME:
      return Object.values(TransactionIncomeCategory);
    case TransactionType.INVESTMENT:
      return Object.values(TransactionInvestmentCategory);
    default:
      // Throw an error if none of the cases match
      return assertNever(formType);
  }
}
