import Link from "next/link";
import React, { type FC, type ReactNode } from "react";
import { AiFillHome } from "react-icons/ai";

interface Props {
  children: ReactNode;
}

const NavItem: FC<Props> = ({ children }) => {
  return (
    <Link href="/">
      <div className="flex justify-center ">
        {children}

        <h2 className="mt-[2px] hidden text-lg lg:block">Dashboard</h2>
      </div>
    </Link>
  );
};

export default NavItem;
