"use client";

import { UseNestedObject } from "@hooks/useNestedObject";
import { IStep } from "@types";
import { InputDropDown } from "@components/inputs/inputDropDown";
import { getStepOptions } from "@providers/task";
import { isEmpty } from "@utils/arrays";

export function StepMainInput({
  step,
  setStep,
  index,
  options,
}: {
  step: IStep;
  setStep: UseNestedObject;
  index?: number;
  options: any;
}) {
  const {
    typesOptions,
    chainOptions,
    protolOptions,
    //   web3MethodOptions,
    exchangeOptions,
    //   cexMethodsOptions,
    methodOptions,
  } = getStepOptions(step, options);

  return (
    <div className="step-row">
      <div className="flex flex-inline gap-4">
        {/* <div className="step-title font-semibold" >
          {step.stepName}
        </div> */}

        {/* TYPE */}
        <InputDropDown
          name="type"
          label={"Type"}
          dropDownOptions={typesOptions}
          dropDownValue={step.type}
          setDropDownValue={setStep.setKey("type").setValue}
          width="100px"
          // setValue={emptyFunction}
        />
        {!isEmpty(chainOptions) && (
          <InputDropDown
            name="chain"
            label={"Chain"}
            dropDownOptions={chainOptions}
            dropDownValue={step.chain}
            setDropDownValue={setStep.setKey("chain").setValue}
            width="100px"
            // setValue={emptyFunction}
          />
        )}
        {!isEmpty(protolOptions) && (
          <InputDropDown
            name="protocol"
            label={"Protocol"}
            dropDownOptions={protolOptions}
            dropDownValue={step.protocol}
            setDropDownValue={setStep.setKey("protocol").setValue}
            width="150px"
            // setValue={emptyFunction}
          />
        )}

        {/* CEX */}
        {!isEmpty(exchangeOptions) && (
          <InputDropDown
            name="exchange"
            label={"Exchange"}
            dropDownOptions={exchangeOptions}
            dropDownValue={step.exchange}
            setDropDownValue={setStep.setKey("exchange").setValue}
            width="140px"
            // setValue={emptyFunction}
          />
        )}

        {/* METHODS */}
        {!isEmpty(methodOptions) && (
          <InputDropDown
            name="methods"
            label={"Methods"}
            dropDownOptions={methodOptions}
            dropDownValue={step.method}
            setDropDownValue={setStep.setKey("method").setValue}
            width="200px"
          />
        )}
      </div>
    </div>
  );
}
