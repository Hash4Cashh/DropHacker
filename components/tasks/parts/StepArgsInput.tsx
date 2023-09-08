"use client"

import { UseNestedObject } from "@hooks/useNestedObject";
import { IStep } from "@types";
import { InputTextDropDown } from "@components/inputs/inputTextDropDown";
import { getStepArguments } from "@providers/task";
import { isEmpty } from "@utils/arrays";
import { InputDropDown } from "@components/inputs/inputDropDown";

export function StepArgsInput({
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
    const args = getStepArguments(step, options);

    if(!Object.keys(args || {}).length) {
      return <></>
    }

    return (
      <div className="step-row">
          <div className="flex flex-inline gap-4">
          {/* <div className="step-title font-semibold">
          </div> */}
          {Object.entries(step.args).map(([key, v], i) => {
            const setValue = setStep.setKey("args").setKey(key).setKey("value").setValue;
            const setOption = setStep.setKey("args").setKey(key).setKey("option").setValue;
            const arg = args[key];

            if(isEmpty(arg?.options)) {
              return (
                <InputTextDropDown
                  key={i}
                  name={key}
                  type={args?.type === "string" ? "text" : args?.type}
                  label={key}
                  
                  // Value
                  value={v?.value}
                  setValue={setValue}
                  
                  // DropDown
                  dropDownValue={v?.option}
                  dropDownOptions={arg?.typeOptions}
                  setDropDownValue={setOption}

                  width="140px"
                />
              );

            } else {
              return (
                <InputDropDown
                  key={i}
                  name={key}
                  label={key}
                  width="100px"

                  dropDownValue={v?.value}
                  dropDownOptions={arg?.options}
                  setDropDownValue={setValue}
                />
              );

            }
          })}
          </div>
          {/* <div>Icons</div> */}
        </div>
    );
  }