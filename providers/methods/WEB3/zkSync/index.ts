import { EChains, EProtocols } from "@types"
import MUTE from "./mute"
import SPACE_SWAP from "./spaceSwap"
import SYNC_SWAP from "./syncSwap"
import ZK_BRIDGE from "./zkBridge"
import ONEINCH_ZKSYNC from "../MIX/oneinch"
import NONE_ZKSYNC from "../MIX/NONE"

const zkSyncProtocolsWithFunction = {
    [EProtocols.MUTE]: MUTE,
    [EProtocols.SYNC_SWAP]: SYNC_SWAP,
    [EProtocols.ZK_BRIDGE]: ZK_BRIDGE,
    [EProtocols.SPACE_SWAP]: SPACE_SWAP,
    [EProtocols.ONEINCH]: ONEINCH_ZKSYNC(EChains.ZKSYNC),
    [EProtocols.NONE]: NONE_ZKSYNC(EChains.ZKSYNC),
}

export default zkSyncProtocolsWithFunction;