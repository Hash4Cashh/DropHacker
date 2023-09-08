import { EMethods } from "../../types/enum";
import { args } from "./arguments";

export const syncSwap = {
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
        options: ["USDC", "USDT"],
        defaultValue: "USDC",
        description: "Symbol of token, that address would receive",
      },
      slippage: {
        type: "number",
        // ...args.amount,
        defaultValue: "5",
        description:
          "The difference between the expected price of a trade and the price at which the trade is executed",
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
        options: ["USDC", "USDT", "WETH"],
        defaultValue: "USDC",
        description: "Symbol of token, that address would spent",
      },
      slippage: {
        type: "number",
        // ...args.amount,
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
        options: ["USDC", "USDT", "WETH"],
        defaultValue: "USDC",
        description: "Symbol of token, that address would spent",
      },
      tokenOut: {
        ...args.symbol,
        options: ["WETH", "USDC", "USDT"],
        defaultValue: "WETH",
        description: "Symbol of token, that address would receive",
      },
      slippage: {
        type: "number",
        // ...args.amount,
        // typeOptions: [],
        defaultValue: "5",
        description:
          "The difference between the expected price of a trade and the price at which the trade is executed",
      },
    },
  },
//   [EMethods.ADD_LIQUIDITY_ETH]: {
//     descriptions: "Description of the merhod",
//     name: EMethods.SWAP_ETH_TOKEN,
//     args: {
//       amountETH: {
//         ...args.amount,
//         defaultValue: 0.003,
//         description: "Amount of ETH for Luuidity",
//       },
//       tokenIn: {
//         ...args.symbol,
//         options: ["USDC", "USDT", "WETH"],
//         defaultValue: "USDC",
//         description: "Symbol of token, that address would spent",
//       },
//       amountIn: {
//         ...args.symbol,
//         defaultValue: 10,
//         description: "Amount of Token for Luuidity",
//       },
//     },
//   },
};
