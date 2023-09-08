"use client";

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
export default function ModalTaskName({
  display,
  setDisplay,
  title = "Change Task Name",
  initialValues,
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
      <div className="flex flex-inline gap-2 mt-2">
        <InputTextDropDown
          value={valuesFns.setKey("name").getValue()}
          setValue={valuesFns.setKey("name").setValue}
          label="Name"
        />
      </div>
    </ModalCustom>
  );
}
