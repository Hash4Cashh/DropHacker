import { prisma } from "@db";
import { EChains, EProtocols } from "@types";

export async function savePoolAddress(
  chain: EChains,
  protocol: EProtocols,
  address: string,
  token0: string,
  token1: string
) {
  return await prisma.contract.create({
    data: {
        chain,
        protocol,
        name: `POOL:${token0}-${token1}`,
        address
    }
  });
}
