import { type NextPage } from "next";
import { api } from "~/config/api";

import { useSession } from "next-auth/react";
import Layout from "~/components/Layout";

import Head from "next/head";
import TransactionCard from "~/components/TransactionCard";

import { useEffect, useMemo, useRef, useState } from "react";

import { type Transaction } from "@prisma/client";

const Transactions: NextPage = () => {
  const { data: session } = useSession({ required: true });

  const { data, fetchNextPage } =
    api.transactions.getAllPaginated.useInfiniteQuery(
      {
        limit: 20,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: session?.user !== undefined,
      }
    );

  const lastItemRef = useRef(null);
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) => {
        if (entry) {
          setIntersecting(entry.isIntersecting);
        }
      }),
    [lastItemRef]
  );

  useEffect(() => {
    if (lastItemRef.current) {
      observer.observe(lastItemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Convert pages into a single array
  const transactions = data
    ? data.pages.reduce<Transaction[]>(
        (acc, curr) => [...acc, ...curr.transactions],
        []
      )
    : [];

  return (
    <>
      <Head>
        <title>Transactions - Borderless Budgets</title>
      </Head>
      <Layout>
        <main className="flex min-h-screen w-full bg-slate-200 py-5">
          <section className="flex w-full justify-center">
            <div className="flex w-[60%] flex-col">
              <h1 className="mb-2 pl-8 text-xl">Your Transactions</h1>
              {transactions?.map((tx, index) => {
                const isLastItem = index === transactions.length - 1;
                if (isLastItem) {
                  return (
                    <div key={tx.id} ref={lastItemRef}>
                      <TransactionCard tx={tx} />
                    </div>
                  );
                }
                return <TransactionCard key={tx.id} tx={tx} />;
              })}
            </div>
          </section>
          <div className="w-[330px]"></div>
          <section className="fixed right-0 top-0 h-screen w-[330px] flex-col  bg-slate-100 py-[5vh] drop-shadow-md"></section>
        </main>
      </Layout>
    </>
  );
};

export default Transactions;
