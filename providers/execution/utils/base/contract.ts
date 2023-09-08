import { prisma } from "@db";
import { EChains, EProtocolNames, EProtocols } from "@types";

export async function getContractAddress(
  chain: EChains,
  protocol: EProtocols,
  name: EProtocolNames,
  throwError = true
) {
  const contract = await prisma.contract.findUnique({
    where: {
      chain_protocol_name: {
        chain,
        protocol,
        name,
      },
    },
    select: { address: true },
  });
  if (!contract) throw new Error(`Don't have contract ${name} at ${chain} - ${protocol}`);
  return contract.address;
}

