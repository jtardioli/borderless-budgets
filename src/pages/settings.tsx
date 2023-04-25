import { signOut, useSession } from "next-auth/react";
import React from "react";
import Layout from "~/components/Layout";

const Settings = () => {
  const { data: session } = useSession();

  return (
    <Layout>
      <main className="flex h-full w-full flex-col gap-6 bg-slate-200 px-10 py-5">
        {session && (
          <button
            className="h-10 w-28  rounded-md bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-opacity-90 shadow-inner"
            onClick={() => {
              void signOut();
            }}
          >
            sign out
          </button>
        )}
      </main>
    </Layout>
  );
};

export default Settings;
