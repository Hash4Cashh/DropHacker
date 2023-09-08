import { ECoin } from "@types";

const oneinchUrl = `https://api.1inch.io`;
const endpoint = (chainId: string | number = "324") => `/v5.0/${chainId}/swap`;
export const ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export const isETH = (symbolOrAddress: string, isWrapped = false) => {
  if (symbolOrAddress === ECoin.ETH) {
    return true;
  } else if (isWrapped && symbolOrAddress === ECoin.WETH) {
    return true;
  } else return false;
};

interface IProps {
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string | number,
    fromAddress: string,
    slippage: string | number,
    chainId: string | number,  
}
export async function getOneInchSwapData({
  fromTokenAddress,
  toTokenAddress,
  amount,
  fromAddress,
  slippage,
  chainId,
}: IProps) {
  const params = `?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}&fromAddress=${fromAddress}&slippage=${slippage}`;
  let oneInchResponse = await fetch(oneinchUrl + endpoint(chainId) + params); // prettier-ignore
  let data = await oneInchResponse.json();

  if (data.error) {
    throw new Error(
      `OneInch Error: ${data.statusCode} - ${data.error}. \t\nDescription: ${data.description}. \t\nMetadata: ${JSON.stringify(data.meta || {})}`
    );
  }

  return data
}
