"use client";

import { BtnPrimary } from "@components/btns/btnPrimary";
import React, { JSX, FC, useState, useRef } from "react";
import { BtnRegular } from "@components/btns/BtnRegular";
// import { CloseBtn } from "../btns/closeBtn";
// import { EColors } from "../../types/enums";

type Props = {
  children?: React.ReactNode;
  display: boolean;
  setDisplay: (newValue: boolean) => void;
  title?: string;
  content?: React.ReactNode;
  onConfirm: () => Promise<any> | any;
  minWidth?: string | undefined;
  maxWidth?: string | undefined;
};

export function ModalConfirm({
  display,
  setDisplay,
  title = "Are you sure",
  content = "Hello World",
  children = <></>,
  onConfirm,
  minWidth = "300px",
  maxWidth,

}: Props) {
  const display_type = display == true ? "flex" : "none";

  return (
    <div
      id="defaultModal"
      tabIndex={-1}
      aria-hidden="false"
      className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
      style={{
        display: display_type,
        justifyContent: "center",
        background: "#0003",
        backdropFilter: "blur(24px)",
        zIndex: 100000
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-full"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth, maxWidth }}
      >
        {/* <!-- Modal content --> */}
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700" style={{minWidth, maxWidth}}>
          {/* <!-- Modal header --> */}
          <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600 items-center">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-hide="defaultModal"
              onClick={() => setDisplay(false)}
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {/* <!-- Modal body --> */}
          <div className="modal-body p-4 gap-4 flex" style={{flexDirection: "column"}}>
            {content}
          </div>
          {/* <!-- Modal footer --> */}
          <div className="flex items-center p-4 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
            <BtnPrimary text="Confirm" btnClass="sm p-sm" onClick={async () => {
              await onConfirm()
              setDisplay(false)
              }}/>
            <BtnRegular text="Cancel" btnClass="sm p-sm" onClick={() => setDisplay(false)}/>
          </div>
        </div>
      </div>
    </div>
  );
}
