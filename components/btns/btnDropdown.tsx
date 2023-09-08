"use client";

import { EColors } from "../../types/enums/colors";
import React, { StyleHTMLAttributes, useEffect, useRef, useState } from "react";
import { BtnPrimary } from "./btnPrimary";
import Spinner from "@components/spinner";
import IconDropDown from "@components/icons/iconDropDown";

interface IProps {
  text: string;
  btns?: Array<{ text: string; onClick: () => any; color?: EColors | string }>;
  color?: EColors;
  inProgress?: boolean;
  styleDropdown?: Record<string, any>;
  btnClasses?: string;
  btnStyles?: Record<string, any>;
  btnType?: string;
}
export default function BtnDropdown({
  text = "Any",
  btns = [{ text: "Test", onClick: () => console.log("Hello") }],
  color,
  styleDropdown = {},
  inProgress,
  btnClasses,
  btnStyles = {},
  btnType = "btn-gradient"
}: IProps) {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleOutsideClick = (event: MouseEvent) => {
    if (btnRef.current && !btnRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative">
      <button
        className={`btn ${btnType} ${color} ${
          inProgress && "inProgress"
        } sm p-sm flex flex-inline ${btnClasses}`}
        onClick={() => {
            if(!inProgress) setIsOpen((old) => !old);
        }}
        ref={btnRef}
        style={{...btnStyles}}
      >
        {inProgress && <Spinner />} {text}{" "}
        <IconDropDown style={{ marginLeft: "0.25rem" }} />
      </button>
      {/* <!-- Dropdown menu --> */}
      <div
        id="dropdown"
        className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-44 dark:bg-gray-700"
        style={{
          display: isOpen ? "flex" : "none",
          top: "calc(100% + 0.5rem)",
          right: "0",
          maxHeight: "210px",
          overflowY: "auto",
          ...styleDropdown,
        }}
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          style={{ width: "100%" }}
          aria-labelledby="dropdownDefaultButton"
        >
          {btns.map(({ text, onClick, color }, i) => {
            return (
              <li key={i} className="relative">
                <a
                  // href="#"
                  className={`btn-dropdown-before ${color} full-width block pl-8 pr-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white`}
                  onClick={onClick}
                  style={{ fontWeight: "500" }}
                >
                  {text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
