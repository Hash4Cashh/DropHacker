import { prisma } from "@db";
import {
  Execution,
  ExecutionAccount,
  ExecutionStep,
  StepState,
} from "@prisma/client";
import { EStatuses } from "@types";
import { executeStep } from "./executeStep";
import { getErrorMessage } from "@utils/getErrorMessage";
import { setAccountFail } from "./utils/fail";

export async function executeAccount(
  execution: Execution,
  account: ExecutionAccount
) {
  try {
    // `Get Step, that have to be executed
    const step = await prisma.executionStep.findFirst({
      where: {
        executionId: execution.id,
        stepNumber: account.currentStep,
      },
    });

    // `If Step was not found, it means that account complete
    if (!step) {
      return await prisma.executionAccount.update({
        where: { id: account.id },
        data: { status: EStatuses.COMPLETE },
      });
    }

    // `Try to Find stepState
    let stepState = await prisma.stepState.findFirst({
      where: { stepId: step.id, accountExecutionId: account.id },
    });

    // `Initialise stepState, if it is empty
    if (!stepState) {
      stepState = await initialiseStepState(execution, account, step);
    }

    // Update Step Status to 'inPrigress' if it have another status
    if (stepState.status !== EStatuses.IN_PROGRESS) {
      stepState = await prisma.stepState.update({
        where: { id: stepState.id },
        data: { status: EStatuses.IN_PROGRESS },
      });
    }

    // * Execute Step by Account.
    await executeStep(step, stepState!);
  } catch (e) {
    console.log(e);
    const errorMessage = getErrorMessage(e);
    console.error(e);
    await setAccountFail(account.id, errorMessage);
  }
}

async function initialiseStepState(
  execution: Execution,
  account: ExecutionAccount,
  step: ExecutionStep
): Promise<StepState> {
  // ``Find PrevStepState
  // `Find prevStep
  const { id: stepId = "" } =
    (await prisma.executionStep.findFirst({
      where: {
        executionId: execution.id,
        stepNumber: account.currentStep - 1,
      },
      select: { id: true },
    })) || {};
  // `Find prevStepState
  const prevStepState = await prisma.stepState.findFirst({
    where: { stepId, accountExecutionId: account.id },
    select: { id: true },
  });

  // `Create new stepState
  const newStepState = await prisma.stepState.create({
    data: {
      stepId: step.id,
      accountExecutionId: account.id,
      previosStepId: prevStepState?.id,

      currentAction: 0,
      status: EStatuses.IN_PROGRESS,
      args: "{}",
    },
  });

  return newStepState;
}
