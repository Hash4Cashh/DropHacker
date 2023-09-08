import { EMethods } from "../../types/enum";
import { args } from "./arguments";

export const okex = {
  methods: {
    [EMethods.WITHDRAW]: {
      descriptions: "Description of the merhod",
      name: EMethods.WITHDRAW,
      args: {
        token: {
          ...args.symbol,
          defaultValue: "ETH",
          description: "Symbol of token, that would be withdrawn to address",
        },
        amount: {
          // ...args.amount,
          type: "string",
          defaultValue: "0.03",
          description: "Amount of ETH for withdraw. Min Amount for withdraw is 0.01 ETH + Fee (0.00127 - 0.0026 ETH)",
        },
        chain: {
          ...args.chain,
          description: "In what chain have to be made deposit"
        }
      },
    },
    [EMethods.DEPOSIT]: {
      descriptions: "Description of the merhod",
      name: EMethods.DEPOSIT,
      args: {
        token: {
          ...args.symbol,
          defaultValue: "ETH",
          description: "Symbol of token, that would be deposited to CEX",
        },
        amount: {
          ...args.amount,
          defaultValue: "0.1",
          description: "Amount of tokens that would be deposited to CEX",
        },
        chain: {
          ...args.chain,
          description: "In what chain have to be made deposit"
        }
      },
    },
  }
};
