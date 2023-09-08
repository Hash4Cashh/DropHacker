import { EChains, ECoin } from "@types";

export const okexUrl = "https://www.okx.com";

const okexChains: any = {
  [EChains.ETH]: (symbol: string) => `${symbol}-ERC20`,
};

export enum EWithdrawStatuses {
    PENDING = "Pending withdrawal",
    IN_PROGRESS = "Withdrawal in progress",
    COMPLETE = "Withdrawal complete",
}

export function getOkexChain(chain: EChains, symbol: ECoin) {
  if (!okexChains[chain])
    throw new Error(`Need to add relations to okexChains for ${chain}`);
  return okexChains[chain](symbol);
}

// EXAMPLE ERROR Responce from Okex:
// const res = {
//   code: "58207",
//   data: [],
//   msg: "Withdrawal address is not allowlisted for verification exemption",
// };
