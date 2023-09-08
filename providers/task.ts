import { IStep } from "@types";
import { getNonEmptyArray } from "@utils/arrays";

export function getStepOptions(step: IStep, options: any) {
  const typesOptions = Object.keys(options || {});
  const chainOptions = Object.keys(options?.[step.type]?.chains || {});
  const protolOptions = Object.keys(options?.[step.type]?.chains?.[step.chain || ""]?.protocols || {}); // prettier-ignore
  const web3MethodOptions = Object.keys(options?.[step.type]?.chains?.[step.chain || ""]?.protocols?.[step.protocol || ""]?.methods || {}); // prettier-ignore

  const exchangeOptions = Object.keys(options?.[step.type]?.exchanges || {});
  const cexMethodsOptions = Object.keys(
    options?.[step.type]?.exchanges?.[step.exchange || ""]?.methods || {}
  );

  const methodOptions = Object.keys(options?.[step.type]?.methods || {});

  return {
    typesOptions,

    chainOptions,
    protolOptions,

    exchangeOptions,

    methodOptions: getNonEmptyArray(
      [],
      web3MethodOptions,
      cexMethodsOptions,
      methodOptions
    ),
  };
}

export function getStepArguments(step: IStep, options: any) {
  const web3MethodOptions = options?.[step.type]?.chains?.[step.chain || ""]?.protocols?.[step.protocol || ""]?.methods?.[step.method]?.args; // prettier-ignore
  const cexMethodsOptions =
    options?.[step.type]?.exchanges?.[step.exchange || ""]?.methods?.[
      step.method
    ]?.args;
  const methodOptions = options?.[step.type]?.methods?.[step.method]?.args;

  return web3MethodOptions || cexMethodsOptions || methodOptions || {};
}
