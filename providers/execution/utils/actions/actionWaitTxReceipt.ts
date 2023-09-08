import { EActions } from "@types";
import { waitTxReceiptFromLog } from "../base/waitTx";
import {
  TParseLogFn,
  TParseReceiptFn,
  saveTxReceiptInStepStateLog,
} from "../stepState/update";
import { completeActionAndNext } from "../action/completeAction";
import { getStepStateLogs } from "../stepState/get";
import { StepActionState, StepState } from "@prisma/client";
import { providers } from "ethers";

export async function actionWaitTxReceipt(
  stepState: StepState,
  action: StepActionState,
  provider: providers.JsonRpcProvider,
  actionName: EActions,
  {
    parseReceipt,
    parseLog,
    timeLimit,
  }: {
    parseReceipt?: TParseReceiptFn;
    parseLog?: TParseLogFn;
    timeLimit?: number;
  } = {}
) {
  const logs = await getStepStateLogs<Record<string, any>>(stepState);
  // `Wait for tx to be confirmed
  const txReceipt = await waitTxReceiptFromLog(
    provider,
    logs,
    actionName,
    timeLimit
  );

  if (!txReceipt) {
    console.log("txReceipt not Finish for", [actionName]);
    return;
  } // need to wait, transaction still not finish

  // `Save txReceipt in logs.
  return await saveTxReceiptInStepStateLog(
    stepState,
    txReceipt,
    actionName,
    {parseLog, parseReceipt}
  );
}
