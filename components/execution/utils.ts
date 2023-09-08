import { EStatuses, IExecutionAccount, IExecutionStep } from "@types";

export function getStepStatus(step: IExecutionStep, status: EStatuses): number {
  return step.states?.reduce((prev, nextStep) => {
    if (nextStep.status === status) {
      return prev + 1;
    }
    return prev;
  }, 0) || 0;
}

export function getAccountsStatus(
  accounts: Array<IExecutionAccount>,
  status: EStatuses
) {
  return accounts?.reduce((prev, nextStep) => {
    if (nextStep.status === status) {
      return prev + 1;
    }
    return prev;
  }, 0);
}