// import { EMethods } from "../types/enum";
import { EChains, ECoin, EMethods, EProtocols } from "../types/enum";
import { args } from "./exchanges/arguments";
import { mute } from "./exchanges/mute";
import { oneinch } from "./exchanges/oneinch";
import { spaceSwap } from "./exchanges/spaceSwap";
import { univ2 } from "./exchanges/univ2";
import { okex } from "./exchanges/okex";
import { syncSwap } from "./exchanges/syncSwap";
import { web3 } from "./exchanges/web3";
import { zkBridge } from "./exchanges/zkBridge";

export const taskOptions = {
  WEB3: {
    // CHAINS
      chains: {
        [EChains.ETH]: {
          protocols: {
            [EProtocols.ZK_BRIDGE]: { // zkBridge
              descriptions: "Some descriptions about this protocol",
              methods: { Deposit: zkBridge.Deposit }
            },
            [EProtocols.UNIV2]: { // zkBridge
              descriptions: "Some descriptions about this protocol",
              methods: univ2
            },
            [EProtocols.NONE]: { // NONE - Transfers
              descriptions: "Some descriptions about this protocol",
              methods: web3([ECoin.USDC, ECoin.USDT, ECoin.WETH]),
            },
            [EProtocols.ONEINCH]: {
              descriptions: "Some descriptions about this protocol",
              methods: oneinch([ECoin.ETH, ECoin.USDC, ECoin.USDT, ECoin.WETH]),
            }
          },
        },
        // ZKSYNC
        [EChains.ZKSYNC]: {
          protocols: {
            [EProtocols.SYNC_SWAP]: { // SyncSwap
              descriptions: "Some descriptions about this protocol",
              methods: syncSwap
            },
            [EProtocols.MUTE]: { // Mute
              descriptions: "Some descriptions about this protocol",
              methods: mute
            },
            [EProtocols.SPACE_SWAP]: { // Mute
              descriptions: "Some descriptions about this protocol",
              methods: spaceSwap
            },
            [EProtocols.ZK_BRIDGE]: { // zkBridge
              descriptions: "Some descriptions about this protocol",
              methods: { Withdraw: zkBridge.Withdraw }
            },
            [EProtocols.ONEINCH]: {
              descriptions: "Some descriptions about this protocol",
              methods: oneinch(),
            },
            [EProtocols.NONE]: { // NONE - Transfers
              descriptions: "Some descriptions about this protocol",
              methods: web3([ECoin.USDC, ECoin.WETH]),
            },
          }
        }
      }
  },
  CEX: {
    // Exchanges
    description: "",
    exchanges: {
      okex
    }
  },
  WAIT: {
    description: "",
    methods: {
      [EMethods.DELAY]: {
        description: "How much time address have to wait before next execution",
        args: {
          time: args.time
        }
      },
      [EMethods.DELAY_INTERVAL]: {
        description: "How much time address have to wait before next execution. Would peak random time in the range",
        args: {
          measuremnts: {
            type: "string",
            options: ["mn", "sc", "hr"],
            defaultValue: "mn",
            description: "desc", // special field for user
          },
          minValue: {
            type: "number",
            defaultValue: 5,
            description: "",
          },
          maxValue: {
            type: "number",
            defaultValue: 15,
            description: "",
          },
        }
      }
    } 
  }
}
