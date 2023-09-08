import { TIME_LIMIT_MES, timeLimitPromise } from "@utils/promises";
import { providers } from "ethers";

export async function waitTxReceipt(
  provider: providers.JsonRpcProvider,
  hash: string | undefined,
  name: string,
  timeLimit?: number
) {
  const tsStart = Date.now();
  if (!hash)
    throw new Error(`Something went wrong, don't have hash for ${name}`);
  console.log(`Waiting [${name}] tx by hash ${hash}`);
  // const rec = await provider.getTransactionReceipt(hash);
  // console.log(`REC ${rec}. ${(Date.now() - tsStart) / 1000} sec.`)
  const receipt = (await timeLimitPromise(
    provider.getTransactionReceipt(hash),
    timeLimit
  )) as providers.TransactionReceipt | typeof TIME_LIMIT_MES;

  const isReceipt = receipt !== TIME_LIMIT_MES;

  // 'LOGGING
  console.log(
    `\nwaitTxReceipt [${name}] ${isReceipt ? ["<> FINISH <>"] : TIME_LIMIT_MES}\nTime spent: ${
      (Date.now() - tsStart) / 1000
    } sec.\n`
  );

  // If return TIME_LIMIT_MES, we need to wait more.
  if (!isReceipt) return;

  // console.log(`RECEIPT ::: ${name}`, receipt);
  if (receipt?.status === 0)
    throw new Error(`Transaction for ${name} was reverted. Hash: ${hash}`);

  return receipt;
}

export async function waitTxReceiptFromLog(
  provider: providers.JsonRpcProvider,
  log: Record<string, { hash: string }> | undefined,
  name: string,
  timeLimit?: number
) {
  const hash = log?.[name]?.hash;
  if (!hash) {
    console.log("LOG", log);
    console.log("LOG NAME:", log?.[name]);
    throw new Error(`Something went wrong, don't have hash for ${name}`);
  }
  return waitTxReceipt(provider, hash, name, timeLimit);
}
