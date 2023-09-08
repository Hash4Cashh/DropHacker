// /api/v5/asset/currencies
import { EChains, ECoin, IExchange } from "@types";
import { getHeaders } from "./getHeader";
import { getOkexChain, okexUrl } from "./constants";
import { getOkexError, handlerOkexError } from "./okexError";

export async function getCurrency(
  exchange: IExchange,
  symbol: ECoin,
  chain?: EChains
) {
  try {
    const endpoint = `/api/v5/asset/currencies${
      symbol ? `?ccy=${symbol}` : ""
    }`;
    const { apiKey, passphrase, secretKey } = exchange.credentials;

    const headers = getHeaders({
      apiKey: apiKey!,
      secretKey: secretKey!,
      passphrase: passphrase!,
      method: "GET",
      endpoint,
    });

    const res = await fetch(okexUrl + endpoint, { headers });
    const json = await res.json();

    // todo handle Error.

    if(!chain) return json.data.data;

    const okexChain = getOkexChain(chain, symbol);

    const chainData = json.data.find((cur: any) => {
      return cur.chain === okexChain
    })

    if(!chainData)
        throw new Error(`\nDon't Find ${symbol} data by chain:${chain}:${okexChain}\n\nTotal OutPut: ${JSON.stringify(json)} `);
    
    return chainData;

  } catch (e) {
    handlerOkexError(e, "Chain Currency");
  }
}

// $ Example of Response:
// [
//   {
//     canDep: true,
//     canInternal: true,
//     canWd: true,
//     ccy: "ETH",
//     chain: "ETH-ERC20",
//     depQuotaFixed: "",
//     depQuoteDailyLayer2: "",
//     logoLink:
//       "https://static.coinall.ltd/cdn/oksupport/asset/currency/icon/eth20230419112854.png",
//     mainNet: true,
//     maxFee: "0.0025408",
//     maxFeeForCtAddr: "0.0025408",
//     maxWd: "4816",
//     minDep: "0.001",
//     minDepArrivalConfirm: "64",
//     minFee: "0.0012704",
//     minFeeForCtAddr: "0.0012704",
//     minWd: "0.01",
//     minWdUnlockConfirm: "96",
//     name: "Ethereum",
//     needTag: false,
//     usedDepQuotaFixed: "",
//     usedWdQuota: "0",
//     wdQuota: "10000000",
//     wdTickSz: "8",
//   },
//   {
//     canDep: true,
//     canInternal: true,
//     canWd: true,
//     ccy: "ETH",
//     chain: "ETHK-OKTC",
//     depQuotaFixed: "",
//     depQuoteDailyLayer2: "",
//     logoLink:
//       "https://static.coinall.ltd/cdn/oksupport/asset/currency/icon/eth20230419112854.png",
//     mainNet: false,
//     maxFee: "0",
//     maxFeeForCtAddr: "0",
//     maxWd: "1605",
//     minDep: "0.00000001",
//     minDepArrivalConfirm: "2",
//     minFee: "0",
//     minFeeForCtAddr: "0",
//     minWd: "0.001",
//     minWdUnlockConfirm: "4",
//     name: "Ethereum",
//     needTag: false,
//     usedDepQuotaFixed: "",
//     usedWdQuota: "0",
//     wdQuota: "10000000",
//     wdTickSz: "8",
//   },
// ];
