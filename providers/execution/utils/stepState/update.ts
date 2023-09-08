import { prisma } from "@db";
import { StepState } from "@prisma/client";
import { getStepStateLogs } from "./get";
import { providers } from "ethers";

export async function updateStepState(
  stepStateid: string,
  data: Partial<StepState>
) {
  if (data.args) {
    data.args = JSON.stringify(data.args);
  }
  if (data.logs) {
    data.logs = JSON.stringify(data.logs);
  }

  return await prisma.stepState.update({
    where: { id: stepStateid },
    data,
  });
}

export async function updateStepStateArgs(
  stepStateid: string,
  args: Record<string, any>
) {
  return await prisma.stepState.update({
    where: { id: stepStateid },
    data: { args: JSON.stringify(args) },
  });
}

export async function updateStepStateLogs(
  stepState: StepState,
  logs: Record<string, any>
) {
  const stepLogs = getStepStateLogs(stepState);

  return await prisma.stepState.update({
    where: { id: stepState.id },
    data: { logs: JSON.stringify({ ...stepLogs, ...logs }) },
  });
}

interface IParseLogProps {
  log: providers.Log;
  stepLogs: Record<string, any>;
  updateStepLog: (newLog: Record<string, any>) => any;
  updateStepNameLog: (newNameLog: Record<string, any>) => any;
}
interface IParseReceiptProps {
  receipt: providers.TransactionReceipt;
  stepLogs: Record<string, any>;
  updateStepLog: (newLog: Record<string, any>) => any;
  updateStepNameLog: (newNameLog: Record<string, any>) => any;
}

export type TParseLogFn = (parseLog: IParseLogProps) => Promise<any>;
export type TParseReceiptFn = (
  parseReceipt: IParseReceiptProps
) => Promise<any>;

export async function saveTxResponseInStepStateLog(
  stepState: StepState,
  tx: providers.TransactionResponse,
  name: string
) {
  const stepLogs = await getStepStateLogs<Record<string, any>>(stepState);
  const txName = stepLogs?.[name] || {};

  return await prisma.stepState.update({
    where: { id: stepState.id },
    data: {
      logs: JSON.stringify({
        ...stepLogs,
        [name]: {
          ...txName,
          hash: tx.hash,
          gasPrice: tx.gasPrice?.toString(),
          gasLimit: tx.gasLimit.toString(),
          nonce: tx.nonce,
        },
      }),
    },
  });
}

export async function saveTxReceiptInStepStateLog(
  stepState: StepState,
  receipt: providers.TransactionReceipt,
  name: string,
  {
    parseReceipt,
    parseLog,
  }: { parseReceipt?: TParseReceiptFn; parseLog?: TParseLogFn }
) {
  const stepLogs = await getStepStateLogs<Record<string, any>>(stepState);
  const txName = stepLogs?.[name] || {};

  Object.assign(stepLogs, {
    [name]: {
      ...txName,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice.toString(),
      blockNumber: receipt.blockNumber,
    },
  });

  const updateStepLog = (newLog: Record<string, any>) => {
    Object.assign(stepLogs, newLog);
  };

  const updateStepNameLog = (newNameLog: Record<string, any>) => {
    const _txNameLog = stepLogs?.[name] || {};
      const updatedTxNameLog = {
        ..._txNameLog,
        ...newNameLog,
      };
      Object.assign(stepLogs, { [name]: updatedTxNameLog });
  };

  if (typeof parseReceipt === "function") {
    await parseReceipt({ stepLogs, receipt, updateStepLog, updateStepNameLog });
  }

  if (typeof parseLog === "function") {
    for (const log of receipt.logs) {
      await parseLog({ stepLogs, log, updateStepLog, updateStepNameLog });
    }
  }

  return await prisma.stepState.update({
    where: { id: stepState.id },
    data: {
      logs: JSON.stringify(stepLogs),
    },
  });
}

export async function parseLogsAndSaveReceiptInStepStateLog(
  stepState: StepState,
  receipt: providers.TransactionReceipt,
  name: string,
  parseLog: TParseLogFn | undefined
) {
  const stepLogs = await getStepStateLogs<Record<string, any>>(stepState);
  const txName = stepLogs?.[name] || {};

  Object.assign(stepLogs, {
    [name]: {
      ...txName,
      gasUsed: receipt.gasUsed,
      effectiveGasPrice: receipt.effectiveGasPrice,
      blockNumber: receipt.blockNumber.toString(),
    },
  });

  if (typeof parseLog === "function") {
    const updateStepLog = (newLog: Record<string, any>) => {
      Object.assign(stepLogs, newLog);
    };

    const updateStepNameLog = (newNameLog: Record<string, any>) => {
      const _txNameLog = stepLogs?.[name] || {};
      const updatedTxNameLog = {
        ..._txNameLog,
        ...newNameLog,
      };
      Object.assign(stepLogs, { [name]: updatedTxNameLog });
    };

    for (const log of receipt.logs) {
      await parseLog({ stepLogs, log, updateStepLog, updateStepNameLog });
    }
  }

  return await prisma.stepState.update({
    where: { id: stepState.id },
    data: {
      logs: JSON.stringify(stepLogs),
    },
  });
}
