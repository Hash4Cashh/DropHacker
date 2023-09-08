import { ICoin } from "../../types";
import { EChains } from "../../types/enum";
import { constants } from "ethers";

export const coinsSeed: Array<ICoin> = [
    // Mainnet - ETH
    {
        chain: EChains.ETH,
        symbol: "ETH",
        decimals: 18,
        address: constants.AddressZero,
    },
    {
        chain: EChains.ETH,
        symbol: "WETH",
        decimals: 18,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    },
    {
        chain: EChains.ETH,
        symbol: "USDT",
        decimals: 6,
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    },
    {
        chain: EChains.ETH,
        symbol: "USDC",
        decimals: 6,
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    },
    // zkSync
    {
        chain: EChains.ZKSYNC,
        symbol: "ETH",
        decimals: 18,
        address: constants.AddressZero
    },
    {
        chain: EChains.ZKSYNC,
        symbol: "WETH",
        decimals: 18,
        address: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91"
    },
    {
        chain: EChains.ZKSYNC,
        symbol: "USDC",
        decimals: 6,
        address: "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4"
    },
    {
        chain: EChains.ZKSYNC,
        symbol: "USDT",
        decimals: 6,
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7"
    },
]