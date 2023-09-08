import SpinnerCenter from "@components/spinnerCenter";
import Link from "next/link";
import React from "react";

async function Home() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        {/* <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
            Announcing our next round of funding.{" "}
            <a href="#" className="font-semibold text-indigo-600">
              <span className="absolute inset-0" aria-hidden="true"></span>
              Read more <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div> */}
        <div className="text-center">
          <h1
            className=" relative font-bold tracking-tight text-gray-900"
            style={{ fontWeight: "900" }}
          >
            <span className="gradient-text">DropHacker</span>
            <span style={{marginTop: "-0.5rem"}}> <span className="text-gray-400">by</span> Hash 4 Cash</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our software is a convenient tool that abuses blockchains to run
            wallets between them and potentially profit from any drops of these
            coins. All of our solutions are unique developments code to provide best security for web3 community
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/hello"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get started
            </Link>
            <a
              href="#"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
