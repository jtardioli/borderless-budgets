import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { type ReactNode, type FC } from "react";
import { AiFillHome } from "react-icons/ai";
import { IoMdSettings } from "react-icons/io";
import { MdCalendarMonth } from "react-icons/md";
import { BsFillPieChartFill } from "react-icons/bs";

type Props = {
  children: ReactNode;
};

const Layout: FC<Props> = ({ children }) => {
  const { data: session } = useSession();
  return (
    <div className="flex h-screen w-screen ">
      <div className="flex h-full w-72 flex-col items-center justify-start bg-slate-100 bg-gradient-to-br py-[5%] drop-shadow-md">
        <div className="items-flex-start flex flex-col">
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

              <p className="text-lg">{session.user.name}</p>
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
          <div className="flex flex-col gap-6">
            <Link href="/">
              <div className="flex py-2">
                <AiFillHome size={30} className="mr-4 text-indigo-600" />
                <h2 className="mt-[2px] text-lg">Dashboard</h2>
              </div>
            </Link>
            <Link href={`/monthly-report/${String(new Date())}`}>
              <div className="flex py-2">
                <BsFillPieChartFill
                  size={30}
                  className="mr-4 text-indigo-600"
                />
                <h2 className="mt-[2px] text-lg">Monthly Report</h2>
              </div>
            </Link>
            <Link href="/year-in-review">
              <div className="flex py-2">
                <MdCalendarMonth size={30} className="mr-4 text-indigo-600" />
                <h2 className="mt-[2px] text-lg">Year In Review</h2>
              </div>
            </Link>
            <Link href="/settings">
              <div className="flex py-2">
                <IoMdSettings size={30} className="mr-4 text-indigo-600" />
                <h2 className="mt-[2px] text-lg">Settings</h2>
              </div>
            </Link>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default Layout;
