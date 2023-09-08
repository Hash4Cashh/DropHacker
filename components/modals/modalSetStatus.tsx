import React, { useState } from "react";
import { ModalCustom } from "./customModal";
import { BtnPrimary } from "@components/btns/btnPrimary";
import { EColors, EStatuses } from "@types";
import { BtnRegular } from "@components/btns/BtnRegular";
import { InputTextDropDown } from "@components/inputs/inputTextDropDown";
import { InputDropDown } from "@components/inputs/inputDropDown";
import Spinner from "@components/spinner";

export default function ModalSetStatus({
  title = "Set Status",
  initialValue,
  display,
  setDisplay,
  onConfirm,
  inProgress,
}: {
    title?: string,
    initialValue: EStatuses,
    display: boolean,
    setDisplay: (newValue: boolean) => any,
    onConfirm: (newStatus: EStatuses) => any,
    inProgress: boolean
}) {
    const [value, setValue] = useState(initialValue);
  return (
    <ModalCustom
      title={title}
      display={display}
      setDisplay={setDisplay}
    //   maxWidth="300px"
      minWidth="300px"
      btns={[
        <BtnPrimary
          key={0}
          onClick={() => onConfirm(value)}
          text="Save"
          btnClass="sm"
          prefix={inProgress && <Spinner fill="black"/>}
          inProgress={inProgress}
          color={EColors.GREEN}
        />,
        <BtnRegular
          key={1}
          btnClass="sm"
          onClick={() => setDisplay(false)}
          text="Cancel"
        />,
      ]}
    >
        <InputDropDown width="100%" label="Status" name="status" dropDownValue={value} setDropDownValue={setValue} dropDownOptions={Object.values(EStatuses)} />
        {/* <InputTextDropDown label="Status" dropDownOptions={Object.values(EStatuses)} value={value} setValue={setValue} /> */}
    </ModalCustom>
  );
}
