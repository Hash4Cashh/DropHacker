import { IExchange, IProvider } from "@types";
import { EChains, EExchanges } from "../../types/enum";

export const providersSeed: Array<IProvider> = [
    {
        chain: EChains.ETH,
        url: "https://mainnet.infura.io/v3/API_KEY",
        gasPrice: "",
        // gasPercent: 0
    },
    {
        chain: EChains.ZKSYNC,
        url: "https://mainnet.era.zksync.io",
        gasPrice: "",
        // gasPercent: 0
    }
]

export const exchangesSeed: Array<IExchange> = [
    {
        name: EExchanges.OKEX,
        url: "https://www.okx.com",
        credentials: {
            passphrase: "passphrase",
            apiKey: "apiKey",
            secretKey: "secretKey"
        }
    }
]