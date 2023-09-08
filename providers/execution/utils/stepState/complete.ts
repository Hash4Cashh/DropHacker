import { prisma } from "@db";
import { StepState } from "@prisma/client";
import { EStatuses } from "@types";

export async function completeStepState(stepState: StepState) {
    console.log(`stepState Completed ${stepState.stepId}`)
  await prisma.stepState.update({
    where: { id: stepState.id },
    data: { status: EStatuses.COMPLETE },
  });
}

export async function setNextStepForAccount(stepState: StepState) {
  const account = await prisma.executionAccount.findUnique({
    where: { id: stepState.accountExecutionId },
    select: { currentStep: true },
  });

  if (!account)
    throw new Error(`Invalid relation between stepState and Account`);

  await prisma.executionAccount.update({
    where: { id: stepState.accountExecutionId },
    data: { status: EStatuses.PENDING, currentStep: account?.currentStep + 1 },
  });
}

export async function setAccountToPending(stepState: StepState) {
  await prisma.executionAccount.update({
    where: { id: stepState.accountExecutionId },
    data: { status: EStatuses.PENDING },
  });
}
