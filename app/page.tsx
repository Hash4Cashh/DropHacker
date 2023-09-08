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
            className="relative font-bold tracking-tight text-gray-900 "
            style={{ fontWeight: "900" }}
          >
            <span className="gradient-text">DropHacker</span>
            <Link
              target="_blank"
              href="https://t.me/hash4cash_links"
              className="inline-flex items-center gap-2 mt-3 text-lg text-indigo-500"
            >
              <svg
                className="w-8"
                xmlns="http://www.w3.org/2000/svg"
                id="Livello_1"
                data-name="Livello 1"
                viewBox="0 0 240 240"
              >
                <defs>
                  <linearGradient
                    id="linear-gradient"
                    x1="120"
                    y1="240"
                    x2="120"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stop-color="#1d93d2" />
                    <stop offset="1" stop-color="#38b0e3" />
                  </linearGradient>
                </defs>
                <circle
                  cx="120"
                  cy="120"
                  r="120"
                  fill="url(#linear-gradient)"
                />
                <path
                  d="M81.229,128.772l14.237,39.406s1.78,3.687,3.686,3.687,30.255-29.492,30.255-29.492l31.525-60.89L81.737,118.6Z"
                  fill="#c8daea"
                />
                <path
                  d="M100.106,138.878l-2.733,29.046s-1.144,8.9,7.754,0,17.415-15.763,17.415-15.763"
                  fill="#a9c6d8"
                />
                <path
                  d="M81.486,130.178,52.2,120.636s-3.5-1.42-2.373-4.64c.232-.664.7-1.229,2.1-2.2,6.489-4.523,120.106-45.36,120.106-45.36s3.208-1.081,5.1-.362a2.766,2.766,0,0,1,1.885,2.055,9.357,9.357,0,0,1,.254,2.585c-.009.752-.1,1.449-.169,2.542-.692,11.165-21.4,94.493-21.4,94.493s-1.239,4.876-5.678,5.043A8.13,8.13,0,0,1,146.1,172.5c-8.711-7.493-38.819-27.727-45.472-32.177a1.27,1.27,0,0,1-.546-.9c-.093-.469.417-1.05.417-1.05s52.426-46.6,53.821-51.492c.108-.379-.3-.566-.848-.4-3.482,1.281-63.844,39.4-70.506,43.607A3.21,3.21,0,0,1,81.486,130.178Z"
                  fill="#fff"
                />
              </svg>
              Hash 4 Cash
            </Link>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our software is a convenient tool that abuses blockchains to run
            wallets between them and potentially profit from any drops of these
            coins. All of our solutions are unique developments code to provide
            best security for web3 community
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
