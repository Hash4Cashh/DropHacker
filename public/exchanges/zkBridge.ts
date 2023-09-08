import { EMethods } from "../../types/enum";
import { args } from "./arguments";

export const zkBridge = {
  [EMethods.WITHDRAW]: {
    descriptions: "Description of the merhod",
    name: EMethods.WITHDRAW,
    args: {
      token: {
        ...args.symbol,
        defaultValue: "ETH",
        description: "Symbol of token, that would be withdrawed to L1",
      },
      amount: {
        ...args.amount,
        defaultValue: "0.1",
        description: "Amount of tokens that would be withdrawed to L1",
      },
    },
  },
  [EMethods.DEPOSIT]: {
    descriptions: "Description of the merhod",
    name: EMethods.DEPOSIT,
    args: {
      token: {
        ...args.symbol,
        defaultValue: "ETH",
        description: "Symbol of token, that would be deposited to L2",
      },
      amount: {
        ...args.amount,
        defaultValue: "0.1",
        description: "Amount of tokens that would be deposited to L2",
      },
    },
  },
};
