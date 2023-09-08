import React from "react";

interface IProps {
  name?: string;
  label?: string;
  type?: string;
  placeHolder?: string;
  prefix?: any;
  value: string | number;
  setValue: (value: any) => any ;
  dropDownValue?: string;
  setDropDownValue?: (newValue: any) => any ;
  dropDownOptions?: Array<string>;
  width?: string;
  inputStyles?: Record<string, any>;
  disabled?: boolean;
}
export function InputTextDropDown({
  name = "test",
  label = "",
  type = "text",
  placeHolder = "type...",
  prefix = "" && <></>,
  value = "",
  setValue = (newValue: any) => {},
  dropDownValue = "",
  setDropDownValue = (newValue: any) => {},
  dropDownOptions = [],
  width = "",
  inputStyles = {},
  disabled=false,
}: IProps) {
  const haveOptions = dropDownOptions.length !== 0;
  return (
    <div className="input-wrapper relative mt-2 rounded-md" style={{width}}>

      <label
        htmlFor={name}
        className="input-label absolute left-2 text-xs font-medium leading-6 text-gray-600"
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        // id={name}
        disabled={disabled}
        className={`block w-full rounded-md border-0 py-1.5 
            ${haveOptions ? "pr-16" : "pr-3"}
            text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-400 outline-none sm:text-sm sm:leading-6 
          `}
        style={{
          width: "100%",
          height: "36px",
          // minWidth: haveOptions ? "128px" : undefined,
          paddingLeft: prefix ? "2rem" : "0.75rem",
          ...inputStyles,
        }}
        placeholder={placeHolder}
        value={value}
        onChange={(e) => {
          // console.log("InputTextDropDown", e.target.value)
          setValue(e.target.value)
        }}
      />


      {prefix && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">{prefix}</span>
        </div>
      )}


      {haveOptions && (
        <div className="absolute inset-y-0 right-0 flex items-center">
          <label htmlFor="currency" className="sr-only">
            Currency
          </label>
          <select
            disabled={disabled}
            name="currency"
            value={dropDownValue}
            className="h-full rounded-md border-0 bg-transparent py-0 pl-2 mr-2 text-gray-500 outline-none sm:text-sm"
            onChange={(e) => {
              setDropDownValue(e.target.value);
              console.log("DropDown Event", e);
            }}
          >
            {["", ...dropDownOptions].map((v, i) => {
              return <option key={i}>{v}</option>;
            })}
          </select>
        </div>
      )}
    </div>
  );
}
