import { Contract, constants, providers } from "ethers";
import FactoryABI from "@abi/UniV2/UniswapV2Factory.json";

export async function getPair(
  tokenA: string,
  tokenB: string,
  factoryAddr: string,
  provider: providers.JsonRpcProvider
): Promise<string | undefined> {
  const routerInstance = new Contract(factoryAddr, FactoryABI, provider);
  console.log("getPair",tokenA, tokenB);
  const pairAddr = await routerInstance.getPair(tokenA, tokenB);
  console.log("pairAddr", pairAddr);

  if(pairAddr === constants.AddressZero) {
    return;
  }
  return pairAddr;
}