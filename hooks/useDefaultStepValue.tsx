"use client";

import { NestedObjectMethods } from "@hooks/useNestedObject";
import { IStep } from "@types";
import { useEffect } from "react";
import { EStepType } from "../types/enum";
import { useObjectBool } from "@hooks/useObjectBool";
import { isEmpty } from "@utils/arrays";
import { getStepArguments, getStepOptions } from "@providers/task";

function changeIfNotEmptyAndNotEqual(
  name: string,
  value: any,
  options: Array<any>,
  setStep: (key: string) => { setValue: (newValue: any) => void },
  toggle: (key: string) => void,
  defaultEmptyValue = undefined
) {
  if (!isEmpty(options)) {
    if (!options.includes(value?.[name])) {
      // If value is not in option list, set first value in option
      setStep(name).setValue(options[0]);
      return options[0];
    } else {
      // Value is in options, so just need to be trigerred
      toggle(name); // this we need for trigerring next useEffect that would change another values.
      return value?.[name];
    }
  }
  setStep(name).setValue(defaultEmptyValue);
  return defaultEmptyValue;
}

export function useDefaultStepValue(
  step: IStep,
  setStep: NestedObjectMethods,
  options: any
) {

  const [updated, _, toggle] = useObjectBool([
    ["chain", false],
    ["protocol", false],
    ["exchange", false],
    ["method", false],
  ]);

  // * TYPE
  useEffect(() => {
    // console.log("CHANGE TYPE");
    const { methodOptions, chainOptions, exchangeOptions } = getStepOptions(
      step,
      options
    );

    if (step.type === EStepType.WAIT) {
      changeIfNotEmptyAndNotEqual("method", step, methodOptions, setStep.setKey, toggle); // prettier-ignore
    } else if (step.type === EStepType.WEB3) {
      changeIfNotEmptyAndNotEqual("chain", step, chainOptions, setStep.setKey, toggle); // prettier-ignore
    } else if (step.type === EStepType.CEX) {
      changeIfNotEmptyAndNotEqual("exchange", step, exchangeOptions, setStep.setKey, toggle); // prettier-ignore
    } else {
      // Should never come here
    }

    // console.log(step, options)
  }, [step.type]);

  // * CHAIN
  useEffect(() => {
    // console.log("CHAIN CHANGES", step.chain);
    const { protolOptions } = getStepOptions(step, options);
    changeIfNotEmptyAndNotEqual("protocol", step, protolOptions, setStep.setKey, toggle); // prettier-ignore
  }, [step.chain, updated.chain]);

  // * PROTOCOL
  useEffect(() => {
    // console.log("PROTOCOL CHANGES", step.protocol);
    const { methodOptions } = getStepOptions(step, options);
    changeIfNotEmptyAndNotEqual("method", step, methodOptions, setStep.setKey, toggle); // prettier-ignore
  }, [step.protocol, updated.protocol]);

  // * EXCHANGE
  useEffect(() => {
    // console.log("EXCHANGE CHANGES", step.exchange);
    const { methodOptions } = getStepOptions(step, options);

    changeIfNotEmptyAndNotEqual("method", step, methodOptions, setStep.setKey, toggle); // prettier-ignore
  }, [step.exchange, updated.exchange]);

  // * METHOD
  useEffect(() => {
    //   console.log("Method WAS CHANGES", step.method);
    const argOptions = getStepArguments(step, options);

    const preparedArgs: Record<string, any> = {};
    for (const key in argOptions) {
      preparedArgs[key] = {};

      const argOptT = argOptions?.[key]?.typeOptions?.[0];
      const argOptV = argOptions?.[key]?.defaultValue;
      const stepV = step.args?.[key]?.value;
      const stepT = step.args?.[key]?.option;

      // Set arg.option if have typeOptions in 
      if (argOptions?.[key]?.typeOptions?.length > 0) {
        preparedArgs[key].option = stepT ? stepT : argOptT;
      }

      preparedArgs[key].value = stepV ? stepV: argOptV;
    }

    setStep.setKey("args").setValue(preparedArgs);
  }, [step.method, updated.method]);
}
