import { EChains, ECoin, IExchange } from "@types";
import { getHeaders } from "./getHeader";
import { getOkexChain, okexUrl } from "./constants";
import { handlerOkexError } from "./okexError";

export async function getDepositAddress(
  exchange: IExchange,
  symbol: ECoin,
  chain: EChains
) {
  try {
    const endpoint = `/api/v5/asset/deposit-address?ccy=${symbol}`;
    const { apiKey, passphrase, secretKey } = exchange.credentials;

    const headers = getHeaders({
      apiKey: apiKey!,
      secretKey: secretKey!,
      passphrase: passphrase!,
      method: "GET",
      endpoint,
    });

    const res = await fetch(okexUrl + endpoint, {headers});

    const data = await res.json();

    const okexChain = getOkexChain(chain, symbol);

    const depositChain = data.data.find((e: any) => e.chain === okexChain)

    if(!depositChain || !depositChain?.addr) {
        throw new Error(`Don't find deposit address in okex Response. Expected chain: ${okexChain} .Response ${JSON.stringify(data)}`);    
    }

    return depositChain.addr

  } catch (e) {
    handlerOkexError(e, "Get Deposit Address");
  }
}
