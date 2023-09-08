"use client"

import { BtnRegular } from "@components/btns/BtnRegular";
import { BtnPrimary } from "@components/btns/btnPrimary";
import { InputTextDropDown } from "@components/inputs/inputTextDropDown";
import { IModalProps, ModalCustom } from "@components/modals/customModal";
import { useNestedObject } from "@hooks/useNestedObject";
import React from "react";

interface IProps extends IModalProps {
  onClick: (values: any) => any;
  initialValues: any;
}
export default function ModalStepName({
  display,
  setDisplay,
  initialValues,
  title = "Create Step",
  onClick,
}: IProps) {
  const valuesFns = useNestedObject(initialValues);
  return (
    <ModalCustom
      display={display}
      setDisplay={setDisplay}
      title={title}
      minWidth="300px"
      btns={[
        <BtnPrimary
          key={0}
          text="Create"
          btnClass="sm"
          onClick={() => {
            setDisplay(false);
            onClick(valuesFns.getValue());
          }}
        />,
        <BtnRegular key={1} btnClass="sm" text="Cancel" onClick={() => setDisplay(false)} />,
      ]}
    >
        <div className="mt-2">
      <InputTextDropDown
        value={valuesFns.setKey("stepName").getValue()}
        setValue={valuesFns.setKey("stepName").setValue}
        label="Step Name"
      />
      </div>
    </ModalCustom>
  );
}
