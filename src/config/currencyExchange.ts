import axios from "axios";
import { env } from "~/env.mjs";

type ExchangeRateResponse = {
  date: string;
  info: {
    rate: number;
    timestamp: number;
  };
  query: {
    amount: number;
    from: string;
    to: string;
  };
  result: number;
  success: boolean;
};

export enum CurrencyCode {
  BRL = "BRL",
  CAD = "CAD",
}

export async function convertCurrency(
  from: CurrencyCode,
  to: CurrencyCode,
  amount: number
) {
  try {
    const { data } = await axios.get<ExchangeRateResponse>(
      `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amount}`,
      { headers: { apikey: env.CURRENCY_CONVERSION_SECRET } }
    );

    console.log("data currency", data);
    return parseFloat(data.result.toFixed(2));
  } catch (error) {
    console.error("Failed to fetch currency:", error);
    throw Error("Failed to fetch currency");
  }
}
