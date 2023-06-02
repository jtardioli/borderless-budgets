import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { type ReactNode, type FC } from "react";
import { AiFillHome } from "react-icons/ai";
import { IoMdSettings } from "react-icons/io";
import { MdCalendarMonth, MdOutlineCurrencyExchange } from "react-icons/md";
import { BsFillPieChartFill } from "react-icons/bs";
import NavItem from "./NavItem";
import { format } from "date-fns";

type Props = {
  children: ReactNode;
};

const Layout: FC<Props> = ({ children }) => {
  const { data: session } = useSession();
  return (
    <div className="flex w-full">
      <div className="hidden w-20  sm:block lg:min-w-[270px]"></div>
      <div className="fixed  hidden h-screen w-20  flex-col items-center justify-start bg-slate-100 bg-gradient-to-br py-[5vh] drop-shadow-md sm:flex lg:min-w-[270px]">
        <div className="flex flex-col">
          {session && (
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <Image
                  src={session.user?.image}
                  alt="Profile Picture"
                  width={50}
                  height={50}
                  className="overflow-hidden rounded-full border-[2px] border-indigo-500"
                />
              )}

              <p className="hidden text-lg lg:block">{session.user.name}</p>
            </div>
          )}
          {!session && (
            <button
              className="h-10 w-28  rounded-md bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-opacity-90 shadow-inner"
              onClick={() => {
                void signIn();
              }}
            >
              sign in
            </button>
          )}
          <div className="my-4"></div>
          <div className="flex flex-col items-center gap-6 lg:items-start">
            <Link href="/">
              <div className="flex justify-center ">
                <AiFillHome size={30} className="text-indigo-600 lg:mr-4" />
                <h2 className="mt-[2px] hidden text-lg lg:block">Dashboard</h2>
              </div>
            </Link>
            <Link href={`/monthly-report/${format(new Date(), "yyyy-MM-dd")}`}>
              <div className="flex justify-center  py-2">
                <BsFillPieChartFill
                  size={30}
                  className="text-indigo-600 lg:mr-4"
                />
                <h2 className="mt-[2px] hidden text-lg lg:block">
                  Monthly Report
                </h2>
              </div>
            </Link>
            <Link href="/year-in-review">
              <div className="flex justify-center  py-2">
                <MdCalendarMonth
                  size={30}
                  className="text-indigo-600 lg:mr-4"
                />
                <h2 className="mt-[2px] hidden text-lg lg:block">
                  Year In Review
                </h2>
              </div>
            </Link>
            <Link href="/transactions">
              <div className="flex justify-center  py-2">
                <MdOutlineCurrencyExchange
                  size={30}
                  className="text-indigo-600 lg:mr-4"
                />
                <h2 className="mt-[2px] hidden text-lg lg:block">
                  Transactions
                </h2>
              </div>
            </Link>
            <Link href="/settings">
              <div className="flex justify-center  py-2">
                <IoMdSettings size={30} className="text-indigo-600 lg:mr-4" />
                <h2 className="mt-[2px] hidden text-lg lg:block">Settings</h2>
              </div>
            </Link>
          </div>
        </div>
      </div>
      {children}
      <div className="fixed bottom-0 flex h-16 w-full items-center justify-between border-t-[1px]  border-slate-300 bg-slate-100 bg-gradient-to-br px-8 drop-shadow-md sm:hidden">
        <NavItem>
          <AiFillHome size={30} className="text-indigo-600 lg:mr-4" />
        </NavItem>

        <Link href={`/monthly-report/${format(new Date(), "yyyy-MM-dd")}`}>
          <div className="flex justify-center  py-2">
            <BsFillPieChartFill size={30} className="text-indigo-600 lg:mr-4" />
            <h2 className="mt-[2px] hidden text-lg lg:block">Monthly Report</h2>
          </div>
        </Link>
        <Link href="/year-in-review">
          <div className="flex justify-center  py-2">
            <MdCalendarMonth size={30} className="text-indigo-600 lg:mr-4" />
            <h2 className="mt-[2px] hidden text-lg lg:block">Year In Review</h2>
          </div>
        </Link>
        <Link href="/settings">
          <div className="flex justify-center  py-2">
            <IoMdSettings size={30} className="text-indigo-600 lg:mr-4" />
            <h2 className="mt-[2px] hidden text-lg lg:block">Settings</h2>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Layout;
