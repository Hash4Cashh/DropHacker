"use client"

import React from "react";
import { IBtnBaseProps, IBtnProps } from "../btnTemplate";
import IconDelete from "@components/icons/iconDelete";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate, faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons'

interface IProps {
  color?: string;
  size?: string;
  onClick: () => any;
  btnStyles?: Record<string, any>
}

export default function BtnMove({ color, size = "18px", onClick, btnStyles }: IProps) {
  return (
    <div
      className="btn btn-delete"
      style={{ height: "36px", padding: "0 8px", alignItems: "center", ...btnStyles, cursor: "grab" }}
      onClick={onClick}
    > 
      <FontAwesomeIcon icon={faUpDownLeftRight} />
    </div>
  );
}
