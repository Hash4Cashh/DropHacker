import { prisma } from "@db";
import { EChains } from "@types";

export async function getProviderUrl(chain: EChains) {
  const provider = await prisma.provider.findUnique({
    where: { chain },
    select: { url: true },
  });
  if (!provider || !provider?.url) throw new Error(`Don't find provider for ${chain}`);
  return provider.url;
}

export async function getProvider(chain: EChains) {
  const provider = await prisma.provider.findUnique({
    where: { chain },
  });
  if (!provider) throw new Error(`Don't find provider for ${chain}`);
  if (!provider?.url) throw new Error(`Provider URL is empty for ${chain}`);
  return provider;
}