import { ExecutionStep, StepState } from "@prisma/client";
import { executionMethods } from "@providers/methods";
import {
  completeStepState,
  setAccountToPending,
  setNextStepForAccount,
} from "@providers/execution/utils/stepState/complete";
import { setActionFailByState, setStepStateFail } from "@providers/execution/utils/stepState/fail";
import { EStepType } from "@types";
import { getErrorMessage } from "@utils/getErrorMessage";
import { setAccountFail } from "./utils/fail";

export async function executeStep(step: ExecutionStep, stepState: StepState) {
  try {
    const method = await findMethod(step);
    if (!method) throw new Error(methodNotSupportedMessage(step));
    console.log("\nMETHOD :::", method,`\n[${step.type}], (${step.chain}, ${step.protocol}) | (${step.exchange}) | [${step.method}]`);

    // `Execute method
    const isCompleted = await method(stepState, JSON.parse(step?.args || ""));

    if (isCompleted === true) {
      // `Set StepState to 'Complete'
      await completeStepState(stepState);
      // `Set ExecutionAccount status to 'Pending' and 'currentStep + 1'
      await setNextStepForAccount(stepState);
    } else {
      // `Set ExecutionAccount status to 'Pending'
      // `Otherwise This Step would never Execute
      setAccountToPending(stepState);
    }
  } catch (e) {
    // console.log("execute Step/Action ERROR", e);
    const errorMessage = getErrorMessage(e);
    console.log("execute Step/Action ERROR", errorMessage);
    await setAccountFail(stepState.accountExecutionId, errorMessage);
    await setStepStateFail(stepState);
    await setActionFailByState(stepState, errorMessage);
  }
}

export type TExecutionMethodProps = (
  stepState: StepState,
  args: Record<string, any>
) => Promise<boolean>;

async function findMethod(step: ExecutionStep): Promise<TExecutionMethodProps> {
  const exchange: any = step?.exchange;
  const chain: any = step?.chain;
  const protocol: any = step?.protocol;
  const method: any = step?.method;

  switch (step?.type) {
    case EStepType.WAIT:
      return executionMethods.WAIT?.[step?.method];
    case EStepType.CEX:
      return executionMethods.CEX?.[exchange]?.[method];
    case EStepType.WEB3:
      return executionMethods.WEB3?.[chain]?.[protocol]?.[method];
    default:
      throw `Unsupported Step Type ${step?.type}`;
  }
}

function methodNotSupportedMessage(step: ExecutionStep) {
  switch (step.type) {
    case EStepType.WAIT:
      return `Method not supported ${step.type}-${step.method}`;
    case EStepType.CEX:
      return `Method not supported ${step.type}-${step.exchange}-${step.method}`;
    case EStepType.WEB3:
      return `Method not supported ${step.type}-${step.chain}-${step.protocol}-${step.method}`;
    default:
      return `Method not supported ${step.type}-${step.chain}-${step.protocol}-${step.exchange}-${step.method}`;
  }
}
