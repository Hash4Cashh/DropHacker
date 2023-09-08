import {
  ExecutionAccount,
  ExecutionStep,
  Prisma,
  StepState,
} from "@prisma/client";

export const includeAllExecutionStep: Record<keyof ExecutionStep, boolean> = {
  id: true,
  // execution: true,
  executionId: true,

  stepName: true,
  stepNumber: true,

  type: true,
  method: true,
  // WEB3
  chain: true,
  protocol: true,
  // CEX
  exchange: true,

  args: true,

  // states: true,
};

export const includeAllStepState: Record<keyof StepState, boolean> = {
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  args: true,
  logs: true,

  // accountExecution: true,
  accountExecutionId: true,

  // step: true,
  stepId: true,

  previosStepId: true,
  // previosStep: true,
  // nextStep: true,

  currentAction: true,
  // actions: true,
};

export const includeAllExecutionAccount: Record<
  keyof ExecutionAccount,
  boolean
> = {
  id: true,
  status: true,
  currentStep: true,
  errorMessage: true,

  //   account: true,
  address: true,

  //   execution: true,
  executionId: true,

  //   stepsState: true,
};

type IncludeMap<T> = {
  [K in keyof T]?: boolean | IncludeMap<T[K]>;
};

// export type Execution_Step 
export type ExecutionStep_StepState = Prisma.ExecutionStepGetPayload<{
  include: IncludeMap<ExecutionStep> & { states: true };
}>;

Prisma.validator<Prisma.ExecutionStepInclude>()({
    states: true
  });


// export type ExecutionStep_StepState = Prisma.ExecutionStepGetPayload<{
//     include: {
//         ...includeAllStep,
//       states: true,
//     }
//   }>
