import { EChains, EProtocols } from "@types"
import ZK_BRIDGE from "./zkBridge"
import UNIV2 from "./uni2"
import ONEINCH_ETH from "../MIX/oneinch"
import NONE_ETH from "../MIX/NONE"

const EthProtocolsWithFunction = {
    [EProtocols.ZK_BRIDGE]: ZK_BRIDGE,
    [EProtocols.UNIV2]: UNIV2,
    [EProtocols.ONEINCH]: ONEINCH_ETH(EChains.ETH),
    [EProtocols.NONE]: NONE_ETH(EChains.ETH),
}

export default EthProtocolsWithFunction;