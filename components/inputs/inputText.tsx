"use client";

import React from "react";

interface IProps {
  type?: string;
  value: string;
  setValue: (newValue: string) => void;
  disabled?: boolean;
  width?: string;
  label?: string
}
export function InputText({
  type="text",
  value,
  setValue,
  disabled = false,
  width="",
  label=""
}: IProps) {
  return (
    <div className="relative input-wrapper" style={{width}}>
      <div className="">
        <input
          type={type}
          className=""
          // placeholder="Form control sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
        />
        <label>{label}</label>
      </div>
    </div>
  );
}
