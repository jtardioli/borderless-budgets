import {
  endOfMonth as getEndOfMonth,
  startOfMonth as getStartOfMonth,
} from "date-fns";

export function getMonthStartAndEnd(date: Date = new Date()) {
  const startOfMonth = getStartOfMonth(date);
  const endOfMonth = getEndOfMonth(date);

  return {
    startOfMonth,
    endOfMonth,
  };
}
