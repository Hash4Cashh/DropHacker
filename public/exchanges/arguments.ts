import { EChains, ECoin, EPriceType, ETimeType } from "@types";

export const args = {
    symbol: {
        type: "string",
        options: [ECoin.ETH, ECoin.USDC],
        defaultValue: ECoin.ETH,
        description: "_desc", // special field for user
    },
    chain: {
        type: "string",
        options: [EChains.ETH],
        defaultValue: EChains.ETH,
        description: "_desc", // special field for user
    },
    amount: {
        type: "number",
        typeOptions: [EPriceType.Eth, EPriceType.Wei, EPriceType.Percent],
        defaultValue: "1",
        description: "_desc", // special field for user
    },
    time: {
        type: "time",
        typeOptions: [ETimeType.Minutes, ETimeType.Seconds, ETimeType.Hour],
        defaultValue: "5",
        description: "The time an account has to wait before the next execution"
    }
}