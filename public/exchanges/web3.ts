import { ECoin, EMethods } from "@types";
import { args } from "./arguments";

export const web3 = (defaultCoins: Array<ECoin>) => {
  return {
    [EMethods.TRANSFER_ETH]: {
      descriptions: "",
      args: {
        amount: {
          ...args.amount,
          defaultValue: "10",
          description: "Amount of ETH for transfer",
        },
        transferTo: {
          type: "string",
          defaultValue: "0x",
          description: "Amount of ETH for transfer",
        },
      },
    },
    [EMethods.TRANSFER_ERC20]: {
      description: "",
      args: {
        token: {
          ...args.symbol,
          defaultValue: "USDC",
          options: defaultCoins,
          description:
            "Symbol of token, that this address would sent to another address",
        },
        amount: {
          ...args.amount,
          defaultValue: "10",
          description: "Amount of ETH for SWAP",
        },
        transferTo: {
          type: "string",
          defaultValue: "0x",
          description: "Amount of ETH for transfer",
        },
      },
    },
  };
};
