import React from "react";

interface IProps {
  name: string;
  label: string;
  dropDownValue: any,
  setDropDownValue: (newValue: any) => void,
  dropDownOptions?: Array<any>,
  width?: string,
  isNullable?: boolean,
}
export function InputDropDown({
  name,
  label,
  dropDownValue,
  setDropDownValue,
  dropDownOptions,
  width = "200px",
  isNullable = true
}: IProps) {
  if(isNullable) {
    dropDownOptions = ["", ...dropDownOptions || []]
  }
  return (
    <div>
      <div className="select-wrapper relative mt-2 rounded-md border border-gray-300 px-2" style={{width, background: "#FDFDFD"}}>
        <label
          htmlFor={name}
        className="absolute -top-6 left-2 text-xs font-medium leading-6 text-gray-600"
          
        >
          {label}
        </label>
        {/* <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">$</span>
        </div> */}
        <select
          name={name}
          value={dropDownValue}
          onChange={(e) => {setDropDownValue(e.target.value)}}
          className="h-full rounded-md border-0 bg-transparent py-2 text-gray-900 sm:text-sm"
          style={{width: "100%", outline: "none"}}
        >
          {dropDownOptions?.map((v, i) => {
            return <option key={i}>{v}</option>;
          })}

        </select>
      </div>
    </div>
  );
}
