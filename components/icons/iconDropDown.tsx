import React from "react";

interface IProps {
    style?: Record<string, any>
}
export default function IconDropDown({style}: IProps) {
  return (
    <svg
      className="w-4 h-4"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{...style}}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      ></path>
    </svg>
  );
}
