import { getErrorMessage } from "@utils/getErrorMessage";

export function getOkexError(e: any) {
  console.log(e);
  if (e?.msg) {
    return { msg: e.msg, code: e?.code };
  }
  return e;
}

export function handlerOkexError(e: any, name: string, response?: any) {
    const errorMessage = getOkexError(e);
    const c = errorMessage?.code;
    const m = errorMessage?.msg;

    if (!c) throw new Error(`Unknown Error Okex [${name}]: ${getErrorMessage(e)} : ${JSON.stringify(response || "{}")}`);

    if(c === '50040') {
        // Too frequent operations, please try again later
        return;
    }

    throw new Error(`Okex [${name}]: ${c} : ${m}`);
}