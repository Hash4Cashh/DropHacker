import { ECoin, EMethods, EPriceType } from "../../types/enum";
import { args } from "./arguments";

const availableCoins = [ECoin.USDC, ECoin.USDT, ECoin.WETH]

export const univ2 = {
  [EMethods.SWAP_ETH_TOKEN]: {
    descriptions: "Description of the merhod",
    name: EMethods.SWAP_ETH_TOKEN,
    args: {
      amountIn: {
        ...args.amount,
        defaultValue: "0.01",
        description: "Amount of ETH for SWAP",
      },
      tokenOut: {
        ...args.symbol,
        options: availableCoins,
        defaultValue: ECoin.USDC,
        description: "Symbol of token, that address would receive",
      },
      slippage: {
        // ...args.amount,
        type: "string",
        defaultValue: "5",
        description:
          "The difference between the expected price of a trade and the price at which the trade is executed\nmin 0.5 max 100",
      },
    },
  },
  [EMethods.SWAP_TOKEN_ETH]: {
    descriptions: "Description of the merhod",
    name: EMethods.SWAP_ETH_TOKEN,
    args: {
      amountIn: {
        ...args.amount,
        defaultValue: "10",
        description: "Amount of ETH for SWAP",
      },
      tokenIn: {
        ...args.symbol,
        options: availableCoins,
        defaultValue: ECoin.USDC,
        description: "Symbol of token, that address would spent",
      },
      slippage: {
        // ...args.amount,
        type: "string",
        defaultValue: "5",
        description:
          "The difference between the expected price of a trade and the price at which the trade is executed",
      },
    },
  },
  [EMethods.SWAP_TOKEN_TOKEN]: {
    descriptions: "Description of the merhod",
    name: EMethods.SWAP_ETH_TOKEN,
    args: {
      amountIn: {
        ...args.amount,
        defaultValue: "10",
        description: "Amount of ETH for SWAP",
      },
      tokenIn: {
        ...args.symbol,
        options: availableCoins,
        defaultValue: ECoin.USDC,
        description: "Symbol of token, that address would spent",
      },
      tokenOut: {
        ...args.symbol,
        options: availableCoins,
        defaultValue: ECoin.USDT,
        description: "Symbol of token, that address would receive",
      },
      slippage: {
        // ...args.amount,
        type: "string",
        defaultValue: "5",
        description:
          "The difference between the expected price of a trade and the price at which the trade is executed",
      },
    },
  },
  [EMethods.ADD_LIQUIDITY_ETH]: {
    descriptions: "Description of the merhod",
    name: EMethods.SWAP_ETH_TOKEN,
    args: {
      // amountETH: {
      //   ...args.amount,
      //   defaultValue: "0.003",
      //   description: "Amount of ETH for Luuidity",
      // },
      token: {
        ...args.symbol,
        options: availableCoins,
        defaultValue: ECoin.USDC,
        description: "Symbol of token, that address would spent",
      },
      amountOfToken: {
        ...args.amount,
        defaultValue: "10",
        description: "Amount of Token for Luuidity",
      },

    },
  },
  [EMethods.REMOVE_LIQUIDITY_ETH]: {
    descriptions: "Description of the merhod",
    name: EMethods.SWAP_ETH_TOKEN,
    args: {
      token: {
        ...args.symbol,
        options: availableCoins,
        defaultValue: ECoin.USDC,
        description: "Symbol of token, that address would spent",
      },
      amountOfPoolToken: {
        ...args.amount,
        defaultValue: "100",
        typeOptions: [EPriceType.Percent, EPriceType.Eth, EPriceType.Wei],

        description: "Amount of Token for Luuidity",
      },

    },
  },
};
