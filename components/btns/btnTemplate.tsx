"use client"

import { EColors } from "../../types/enums/colors";
import React from "react";

export interface IBtnBaseProps {
  onClick: () => any;
  btnClass?: string;
  btnStyle?: Record<string, any>;
  color?: EColors;
  inProgress?: boolean;
  ref?: any
}
export interface IBtnProps extends IBtnBaseProps {
  text: string;
  prefix?: any;
  postFix?: any;
}

interface IProps extends IBtnBaseProps {
  btnClasses?: string; // btn-gradient / btn-regular / ...
  children?: any;
}

export function BtnTemplate({
  onClick,
  btnStyle,
  color,
  inProgress,
  btnClass,
  btnClasses,
  children,
  ref,
}: IProps) {
  return (
    <button
      ref={ref}
      className={`btn ${btnClass} ${color} ${
        inProgress && "inProgress"
      } ${btnClasses}`}
      onClick={onClick}
      style={{ ...btnStyle }}
    >
      {children}
    </button>
  );
}
