import { type ChartOptions, type ChartData } from "chart.js";
import React, { type FC } from "react";
import { Pie } from "react-chartjs-2";
import { formatCurrency } from "~/utils/currency";

type Props = {
  title: string;
  graphData: ChartData<"pie">;
  graphOptions: ChartOptions;
  monthlyCategories:
    | {
        category: string;
        amount: number | null;
      }[]
    | undefined;
  monthlyTotal: number | undefined;
};

const MonthlyCategories: FC<Props> = ({
  title,
  monthlyTotal,
  monthlyCategories,
  graphData,
  graphOptions,
}) => {
  return (
    <div className="flex  rounded-md border-[1px] border-gray-300 bg-white px-6 py-6 drop-shadow-sm">
      <div className="flex flex-1 items-center justify-center  overflow-y-auto">
        <div className="flex">
          <div className="h-[230px] w-[230px]">
            <Pie data={graphData} options={graphOptions} />
          </div>
        </div>
      </div>
      <div className="min-h-[250px] flex-1 flex-col  overflow-y-auto  rounded-md border-[1px] border-gray-300 bg-slate-50 px-6 py-4 drop-shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className=" font-semibold">{title}</h3>
          <h3 className=" font-semibold">
            Total: {formatCurrency(monthlyTotal!, "USD")}
          </h3>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {monthlyCategories?.map((c, i) => {
            return (
              <div key={c.category} className="flex justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="mt-1 flex h-3 w-3 rounded-full"
                    style={{
                      background: (
                        graphData.datasets[0]!.backgroundColor as string[]
                      )[i],
                    }}
                  ></div>
                  <p>{c.category}</p>
                </div>

                <div className="flex">
                  <p className="text-right">
                    {monthlyTotal &&
                      c.amount &&
                      ((c.amount / monthlyTotal) * -100).toFixed(2)}
                    %
                  </p>
                  <p className=" min-w-[120px]  text-right">
                    {formatCurrency(c.amount!, "USD")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCategories;
