"use client"

import React from "react";
import { BtnTemplate, IBtnProps } from "./btnTemplate";

export function BtnPrimary({
  text,
  onClick,
  btnStyle,
  color,
  inProgress,
  btnClass,
  prefix,
  postFix,
  ref,
}: IBtnProps) {
  return (
    <BtnTemplate
      btnClass="btn-gradient"
      color={color}
      onClick={onClick}
      btnStyle={btnStyle}
      btnClasses={btnClass}
      inProgress={inProgress}
      ref={ref}
    >
      <span style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
      {prefix}{text}{postFix}
      </span>
    </BtnTemplate>
  );
}
