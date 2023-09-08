import { Account, Execution, ExecutionAccount, ExecutionStep, Prisma, StepActionState, StepState } from "@prisma/client";
import { EStatuses } from "./enum";
import { IStep, ITask } from "./task";
import { IAccount } from "./base";

export interface IStepActionState {
    id?: string;
    createdAt?: string;
    updatedAt?: string;

    name: string;// checkAllowance
    status: string;
    actionNumber: number;

    stepState?: IStepState;
    stepStateId: string;

    errorMessage?: string; // Error message
    logs?: string; // gasPrice, txHash, ...

    previosActionId: string;
    previosAction?:   IStepActionState;
    nextAction?: IStepActionState;
}

export interface IStepState {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    status: EStatuses;

    args: string; // step.args but converted to format that would be used in scripts.
    logs?: string // same as args, but instead of addresses, here would be shown USDC, Account Name, ...

    // Account ->
    accountExecution?: IExecutionAccount;
    accountExecutionId: string;

    // Step ->
    step?: IExecutionStep;
    stepId: string;

    // StepState -> (to Previos/Next)
    previosStepId?: string;
    previosStep:   IStepState;
    nextStep: IStepState;

    // StepStateAction ->
    currentAction?: number;
    actions?: Array<IStepActionState>;
}

export interface IExecutionStep extends IStep {
    id?: string;
    execution?: Execution;
    executionId?: string; 

    states?: Array<IStepState>;
}


export interface IExecutionAccount {
    id?: string;
    status: EStatuses,
    currentStep?: number,
    errorMessage?: string,

    // Account ->
    account?: IAccount,
    address?: string, // id of the Account model
    
    // Execution ->
    execution?: IExecution,
    executionId?: string,

    // StepState ->
    stepsState?: Array<IStepState>

}

export interface IExecution extends Omit<ITask, 'steps'> { // Omit<ITask, 'steps'> - override steps
    status: EStatuses,
    
    steps?: Array<IExecutionStep>,
    accounts?: Array<IExecutionAccount>,
}