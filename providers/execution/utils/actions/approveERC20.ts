import { StepActionState, StepState } from "@prisma/client";
import { initialiseArgs, initialiseProvider } from "../base/initialiseInAction";
import { BigNumberish, providers } from "ethers";
import { getERC20Allowance } from "../base/erc20";
import { completeActionAndNext } from "../action/completeAction";
import { EActions } from "@types";

export async function actionCheckAllowanceERC20(
  token: string,
  owner: string,
  approver: string,
  amount: BigNumberish,
  {
    action,
    nextAction,
    provider,
  }: {
    action: StepActionState;
    nextAction: string;
    provider: providers.JsonRpcProvider;
  }
) {
  // # Check Allowance
  const allowance = await getERC20Allowance(provider, token, owner, approver); // prettier-ignore
  console.log("ALLOWANCE", allowance.toString());
  if (allowance.lt(amount)) {
    action = await completeActionAndNext(action, EActions.APPROVE_ERC20);
  } else action = await completeActionAndNext(action, nextAction);

  return action;
}

export async function actionWaitApproveERC20() {}
