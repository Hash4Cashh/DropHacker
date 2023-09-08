import { Contract, providers, constants } from "ethers";
import ClassicPoolFactoryABI from "@abi/SyncSwap/ClassicPoolFactory.json";
import { getContractAddress } from "@providers/execution/utils/base/contract";
import { EChains, EProtocolNames, EProtocols } from "@types";

export async function getPoolAddress(
  token0: string,
  token1: string,
  provider: providers.JsonRpcProvider
): Promise<string> {
  const chain = EChains.ZKSYNC;

  // `Get classicPoolFactoryAddr from DB.
  const classicPoolFactoryAddr = await getContractAddress(
    chain,
    EProtocols.SYNC_SWAP,
    EProtocolNames.CLASSIC_POOL_FACTORY
  );

  // `Initialise poolFactory contract
  const poolFactoryInstance = new Contract(
    classicPoolFactoryAddr,
    ClassicPoolFactoryABI,
    provider
  );

  // * Find Pool Address
  const poolAddress = await poolFactoryInstance.getPool(token0, token1);
  if (poolAddress === constants.AddressZero)
    throw new Error(
      `Don't find pool: Zero Address | Network : ${chain} | Token0: ${token0} | Token1: ${token1} | ClassicPoolFactoryAddress: ${classicPoolFactoryAddr}`
    );

  return poolAddress;
}
