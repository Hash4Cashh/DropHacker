import CryptoJS from "crypto-js";

export const okxUrl = "https://www.okx.com";

function getSign(
  secretKey: string,
  method = "GET",
  endpoint: string,
  { timestamp, body }: { timestamp: string; body?: Record<string, any> }
) {
  const bodyJson = body ? JSON.stringify(body) : "";
  const prehashString = timestamp + method + endpoint + bodyJson;

  //   const signature = CryptoJS.HmacSHA256(prehashString, SecretKey).toString(
  //     CryptoJS.enc.Base64
  //   );
  const signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(prehashString, secretKey)
  );
  return signature;
}

export function getHeaders({
  apiKey,
  passphrase,
  secretKey,
  body,
  endpoint,
  method,
}: {
  apiKey: string;
  passphrase: string;
  secretKey: string;
  body?: Record<string, any>;
  endpoint: string;
  method: string;
}) {
  const timestamp = new Date().toISOString();
  const signature = getSign(secretKey, method, endpoint, { timestamp, body });
  return {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": apiKey,
    "OK-ACCESS-SIGN": signature,
    "OK-ACCESS-PASSPHRASE": passphrase,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "x-simulated-trading": "0", // Optional if using simulated trading
  };
}
