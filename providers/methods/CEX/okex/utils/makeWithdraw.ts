// /api/v5/asset/currencies
import { EChains, ECoin, IExchange } from "@types";
import { getHeaders } from "./getHeader";
import { getOkexChain, okexUrl } from "./constants";
import { handlerOkexError } from "./okexError";

export async function makeWithdraw(
  exchange: IExchange,
  symbol: ECoin,
  chain: EChains,
  address: string,
  amount: string,
  fee: number,
  precision: number
) {
  try {
    const endpoint = `/api/v5/asset/withdrawal`;
    const { apiKey, passphrase, secretKey } = exchange.credentials;

    const okexChain = getOkexChain(chain, symbol);
    const body = {
      amt: (Number(amount) - Number(fee)).toFixed(precision), // todo aplieble only for eth
      fee,
      dest: "4", // 3 - internal, 4 - on chain
      ccy: symbol,
      chain: okexChain,
      toAddr: address,
    };

    const headers = getHeaders({
      apiKey: apiKey!,
      secretKey: secretKey!,
      passphrase: passphrase!,
      method: "POST",
      endpoint,
      body,
    });

    const res = await fetch(okexUrl + endpoint, {
      headers,
      method: "POST",
      body: JSON.stringify(body),
    });
    const json = await res.json();

    if(json.code !== "0") throw json;

    console.log(console.log("OKEX WITHDRAW RESPONSE :::\n", json))
    return json?.data?.[0];
  } catch (e) {
    handlerOkexError(e, "Withdraw");
  }
}

// `RESPONSE - SUCCESS
// {
//   code: '0',
//   data: [
//     {
//       amt: '0.025',
//       ccy: 'ETH',
//       chain: 'ETH-ERC20',
//       clientId: '',
//       wdId: '94073630'
//     }
//   ],
//   msg: ''
// }
