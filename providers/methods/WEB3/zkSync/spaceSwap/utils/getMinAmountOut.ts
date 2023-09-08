import { BigNumber, BigNumberish, Contract } from "ethers";

export async function getMinAmountOut(
  contractInstance: Contract,
  amountIn: string,
  path: Array<{ address: string }>,
  slippage: BigNumberish = 5,
  toString = true,
) {
  if (path.length < 2)
    throw new Error("Path can not contain less than 2 token");

  const pathAddr = path.map((coin) => coin.address);
  // const stables = new Array(pathAddr.length - 1).fill(false);

  const amountsOut = await contractInstance.getAmountsOut(amountIn, pathAddr); // prettier-ignore

  const differance = BigNumber.from(100).sub(slippage); // 100 represents 100%
  const res = BigNumber.from(amountsOut[pathAddr.length - 1])
    .mul(differance)
    .div(100)

  return res;
}
