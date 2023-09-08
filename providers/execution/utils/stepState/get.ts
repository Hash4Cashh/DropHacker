import { StepState } from "@prisma/client";

export async function getStepStateArgs<T>(stepState: StepState): Promise<T> {
  return JSON.parse(stepState.args || "{}");

}

export async function getStepStateLogs<T>(stepState: StepState): Promise<T> {
  return JSON.parse(stepState.logs || "{}");
}
