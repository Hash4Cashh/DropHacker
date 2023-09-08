"use client"

import React from "react";
import { BtnTemplate, IBtnProps } from "./btnTemplate";
import Spinner from "@components/spinner";

export function BtnRegular({
  text,
  onClick,
  btnStyle,
  color,
  inProgress,
  btnClass,
}: IBtnProps) {
  return (
    <BtnTemplate
      btnClass="btn-regular"
      color={color}
      onClick={onClick}
      btnStyle={btnStyle}
      btnClasses={btnClass}
      inProgress={inProgress}
    >
      <div className="flex items-center">

      {inProgress && <Spinner />} {text}
      </div>
    </BtnTemplate>
  );
}
