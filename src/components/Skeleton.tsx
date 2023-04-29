import React, { type FC } from "react";

type Props = {
  bg: string;
};

const Skeleton: FC<Props> = ({ bg }) => {
  return (
    <div className={`h-full w-full  animate-pulse duration-75 ${bg}`}></div>
  );
};

export default Skeleton;
