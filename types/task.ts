import { TaskStep } from "@prisma/client";
import {EChains, EExchanges, EMethods, EProtocols, EStepType} from "./enum";

type TTypeOptionNumber = "wei" | "plain" | "%";
export interface IStepArgs {
  value: any;
  option?:
    | "%"
    | "eth"
    | "wei"
    | "mn"
    | "sc"
    | "hr";
}

export interface IStep {
  stepName: string;
  stepNumber: number;
  type: EStepType;
  chain?: EChains;
  protocol?: EProtocols;
  exchange?: EExchanges;
  method: EMethods;
  args: {
    [keyof: string]: IStepArgs;
  };
}


export interface ITask {
  id?: string;
  name: string;
  steps: Array<TaskStep>;
}