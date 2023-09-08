import { BigNumber, Contract, constants, providers } from "ethers";
import RouterABI from "@abi/Mute/MuteRouter.json";

export async function getPairInfo(
  tokenA: string,
  tokenB: string,
  router: string,
  provider: providers.JsonRpcProvider,
  stable: boolean = false
): Promise<{
  tokenA: string;
  tokenB: string;
  pair: string;
  reserveA: BigNumber;
  reserveB: BigNumber;
  fee: BigNumber;
}> {
  const routerInstance = new Contract(router, RouterABI, provider);
  return routerInstance.getPairInfo([tokenA, tokenB], stable);
}

export async function pairFor(
  tokenA: string,
  tokenB: string,
  router: string,
  provider: providers.JsonRpcProvider,
  stable: boolean = false
): Promise<string | undefined> {
  const routerInstance = new Contract(router, RouterABI, provider);
  console.log("pairFor",tokenA, tokenB);
  const pairAddr = await routerInstance.pairFor(tokenA, tokenB, stable);
  console.log("pairAddr", pairAddr);

  if(pairAddr === constants.AddressZero) {
    return;
  }
  return pairAddr;
}