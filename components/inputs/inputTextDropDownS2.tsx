import React from "react";

export function InputTextDropDownS2({
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
  inputSyltes = {},
}) {
  const haveOptions = dropDownOptions.length !== 0;
  return (
    <div className="input-wrapper relative mt-2 rounded-md">
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
        className={`block w-full rounded-md border-0 py-1.5 
            ${haveOptions ? "pr-16" : "pr-3"}
            text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-400 outline-none sm:text-sm sm:leading-6 
          `}
        style={{
          width,
          minWidth: haveOptions ? "128px" : undefined,
          background: "#fDfDfD",
          paddingLeft: prefix ? "2rem" : "0.75rem",
          ...inputSyltes,
        }}
        placeholder={placeHolder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
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
            // id="currency"
            name="currency"
            className="h-full rounded-md border-0 bg-transparent py-0 pl-2 mr-2 text-gray-500 outline-none sm:text-sm"
            onChange={(e) => {
              setDropDownValue(e.target.value);
              console.log("DropDown Event", e);
            }}
            // style={{background:"#FDFDFD", }}
          >
            {dropDownOptions.map((v, i) => {
              return <option key={i}>{v}</option>;
            })}
            {/* <option>USD</option>
            <option>CAD</option>
            <option>EUR</option> */}
          </select>
        </div>
      )}
    </div>
  );
}
