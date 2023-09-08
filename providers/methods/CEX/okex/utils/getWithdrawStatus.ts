import { IExchange } from "@types";
import { getHeaders } from "./getHeader";
import { EWithdrawStatuses, okexUrl } from "./constants";
import { handlerOkexError } from "./okexError";

export async function getWithdrawStatus(
  exchange: IExchange,
  withdrawId: string
) {
  let jsonData: any;
  try {
    const endpoint = `/api/v5/asset/deposit-withdraw-status?wdId=${withdrawId}`;
    const { apiKey, passphrase, secretKey } = exchange.credentials;

    const headers = getHeaders({
      apiKey: apiKey!,
      secretKey: secretKey!,
      passphrase: passphrase!,
      method: "GET",
      endpoint,
    });

    const res = await fetch(okexUrl + endpoint, {
      headers,
    });
    jsonData = await res.json();

    const wd = jsonData.data?.[0];

    let status: EWithdrawStatuses | undefined;

    for (const okexStatus of Object.values(EWithdrawStatuses)) {
      if (wd.state.includes(okexStatus)) {
        status = okexStatus;
        break;
      }
    }

    if (!status) {
      throw new Error(
        `Can't recognise withdraw status: ${
          wd.state
        }. Have to be one of ${Object.values(EWithdrawStatuses)}`
      );
    }
    if(!wd) {
      return {}
    }


    return { status, state: wd.state, txHash: wd.txId };

  } catch (e) {
    handlerOkexError(e, "checkWithdrawStatus", jsonData);
    return {}
  }
}

// {
//   code: '0',
//   data: [
//     {
//       estCompleteTime: '',
//       state: 'Withdrawal complete',
//       txId: '0x38c264e3ecd7e0d63d252a60df8303532dc04b778565a098f54a3d8dac23989c',
//       wdId: '94075211'
//     },
/// OR
// {
//     wdId: "200045249",
//     txId: "16f3638329xxxxxx42d988f97", // If txId is generated when returning data, it will be returned together
//     state: "Pending withdrawal: Wallet is under maintenance, please wait.",
//     estCompleteTime: "01/09/2023, 8:10:48 PM"
// }
//   ],
//   msg: ''
// }
