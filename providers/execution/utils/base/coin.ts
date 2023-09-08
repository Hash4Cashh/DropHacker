import { prisma } from "@db";
import { Coin } from "@prisma/client";
import { EChains, EProtocols } from "@types";
import { Signer, providers } from "ethers";
import { getERC20Decimals } from "./erc20";

export async function getCoin(
  symbol: string,
  chain: EChains,
  throwError = true
) {
  const coin = await prisma.coin.findUnique({
    where: { chain_symbol: { symbol, chain } },
  });
  if (!coin && throwError)
    throw new Error(`Don't find coin ${symbol} at ${chain}`);
  return coin;
}

export async function getCoinAddress(
  symbol: string,
  chain: EChains,
  throwError = true
) {
  const coin = await getCoin(symbol, chain, throwError);
  return coin?.address;
}

export async function getLPCoin(
  symbol1: string,
  symbol2: string,
  chain: EChains,
  protocol: EProtocols
) {
  const getLPSymbol = (s1: string, s2: string) => `${protocol}-LP:${s1}-${s2}`;

  let lpCoin: Coin | null;
  lpCoin = await getCoin(getLPSymbol(symbol1, symbol2), chain, false);
  if (lpCoin) return lpCoin;

  lpCoin = await getCoin(getLPSymbol(symbol2, symbol1), chain, false);
  return lpCoin;
}

// * CREATE

export async function createCoin(
  address: string,
  symbol: string,
  chain: EChains,
  decimals: number
): Promise<Coin> {
  return await prisma.coin.create({
    data: {
      address,
      symbol,
      chain,
      decimals,
    },
  });
}

export async function createERC20Coin(
  address: string,
  symbol: string,
  chain: EChains,
  providerOrSigner: Signer | providers.JsonRpcProvider
): Promise<Coin> {
  const decimals = await getERC20Decimals(providerOrSigner, address);
  return await createCoin(address, symbol, chain, decimals);
}

export async function createLpCoin(
  address: string,
  symbol1: string,
  symbol2: string,
  chain: EChains,
  protocol: EProtocols,
  providerOrSigner: Signer | providers.JsonRpcProvider
): Promise<Coin> {
  const getLPSymbol = (s1: string, s2: string) => `${protocol}-LP:${s1}-${s2}`;
  return await createERC20Coin(
    address,
    getLPSymbol(symbol1, symbol2),
    chain,
    providerOrSigner
  );
}
