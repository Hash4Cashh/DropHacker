import { EChains } from "@types"
import ZK_SYNC from "./zkSync"
import ETH from "./ETH"

const chainWithProtocols = {
    [EChains.ZKSYNC]: ZK_SYNC,
    [EChains.ETH]: ETH,
}

export default chainWithProtocols;