import { EChains, EExchanges, EMethods, EProtocols, EStepType } from "../../types/enum";

export const tasksSeed = [
  {
    name: "ZkSync Cycle",
    steps: [
      {
        stepNumber: 1,
        stepName: "Okex Withdraw",
        type: EStepType.CEX,
        // chain: "ETH",
        exchange: EExchanges.OKEX,
        method: EMethods.WITHDRAW,
        args: {
          symbol: {
            value: "ETH",
          },
          amount: {
            value: 10,
          },
          chain: {
            value: EChains.ETH
          }
        },
      },
      {
        stepNumber: 2,
        stepName: "UniV2 SwapEth USDC",
        type: EStepType.WEB3,
        chain: EChains.ETH,
        protocol: EProtocols.UNIV2,
        method: EMethods.SWAP_ETH_TOKEN,
        args: {
          TokenIn: {
            value: "ETH",
          },
          TokenOut: {
            value: "USDC",
          },
          amountIn: {
            option: "eth",
            value: 10,
          },
          slippage: {
            option: "percent",
            value: 10,
          },
        },
      },
      {
        stepNumber: 3,
        stepName: "Wait 15 mn.",
        type: EStepType.WAIT,
        method: EMethods.DELAY,
        args: {
          Time: {
            type: "string",
            option: "minutes",
            value: "15",
          },
        },
      },
    ],
  },
];
