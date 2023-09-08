import { EMethods } from "@types"
import swapEthForTokens from "./swapEthForTokens"
import swapTokensForEth from "./swapTokensForEth"
import swapTokensForTokens from "./swapTokensForTokens"
import addLiquidityETH from "./addLiquidityETH"
import removeLiquidityETH from "./removeLiquidityETH"

const muteFunctions = {
    [EMethods.SWAP_ETH_TOKEN]: swapEthForTokens,
    [EMethods.SWAP_TOKEN_ETH]: swapTokensForEth,
    [EMethods.SWAP_TOKEN_TOKEN]: swapTokensForTokens,
    [EMethods.ADD_LIQUIDITY_ETH]: addLiquidityETH,
    [EMethods.REMOVE_LIQUIDITY_ETH]: removeLiquidityETH,
}
export default muteFunctions;
