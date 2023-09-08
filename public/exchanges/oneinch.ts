import { ECoin, EMethods, EPriceType } from "../../types/enum";
import { args } from "./arguments";

export const oneInchCoins = [ECoin.ETH, ECoin.USDC, ECoin.WETH]

export const oneinch = (availableCoins = oneInchCoins) => {
  return {
    [EMethods.SWAP]: {
      descriptions: "Description of the merhod",
      name: EMethods.SWAP_ETH_TOKEN,
      args: {
        amountIn: {
          ...args.amount,
          defaultValue: "0.01",
          description: "Amount of ETH for SWAP",
        },
        tokenIn: {
          ...args.symbol,
          options: availableCoins,
          defaultValue: ECoin.ETH,
          description: "Symbol of token, that address would be sent",
        },
        tokenOut: {
          ...args.symbol,
          options: availableCoins,
          defaultValue: ECoin.USDC,
          description: "Symbol of token, that address would be received",
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
  }
};
