import { prisma } from "@db";
import { EChains, EProtocols } from "@types";

export async function getPoolAddress(
  chain: EChains,
  protocol: EProtocols,
  token0: string,
  token1: string
) {
  const pool = await prisma.contract.findFirst({
    where: {
      AND: [
        {
          chain,
          protocol,
        },
        {
          // Pool can be store like POOL:token0-token1 or POOL:token1-token0
          OR: [
            {
              AND: [
                { name: { startsWith: `POOL:${token0}` } },
                { name: { endsWith: token1 } },
              ],
            },
            {
              AND: [
                { name: { startsWith: `POOL:${token1}` } },
                { name: { endsWith: token1 } },
              ],
            },
          ],
        },
      ],
    },
  });

  return pool?.address;
}
