import { prisma } from "@db";
import { EExchanges, IExchange } from "@types";

export async function getExchange(
    name: EExchanges
  ) {
    const exchange = await prisma.exchange.findUnique({
      where: { name },
    });
    if (!exchange?.credentials)
      throw new Error(`Don't find Exchange ${exchange}`);
    return {...exchange, credentials: JSON.parse(exchange?.credentials || "{}")} as IExchange;
  }