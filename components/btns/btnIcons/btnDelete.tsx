"use client"

import React from "react";
import { IBtnBaseProps, IBtnProps } from "../btnTemplate";
import IconDelete from "@components/icons/iconDelete";

interface IProps {
  color?: string;
  size?: string;
  onClick: () => any;
  btnStyles?: Record<string, any>
}

export default function BtnDelete({ color, size = "18px", onClick, btnStyles }: IProps) {
  return (
    <div
      className="btn btn-delete"
      style={{ height: "36px", padding: "0 8px", alignItems: "center", ...btnStyles }}
      onClick={onClick}
    >
      <IconDelete color={color} size={size} />
    </div>
  );
}
