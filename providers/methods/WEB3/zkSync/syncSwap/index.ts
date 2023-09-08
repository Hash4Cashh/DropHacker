import { EMethods } from "@types"
import swapEthForTokens from "./swapEthForTokens"
import swapTokensForETH from "./swapTokensForETH"
// import swapTokensForTokens from "./swapTokensForTokens"
// import addLiquidityETH from "./addLiquidityETH"
// import removeLiquidityETH from "./removeLiquidityETH"

const syncSwapFunctions = {
    [EMethods.SWAP_ETH_TOKEN]: swapEthForTokens,
    [EMethods.SWAP_TOKEN_ETH]: swapTokensForETH,
    // [EMethods.SWAP_TOKEN_TOKEN]: swapTokensForTokens,
    // [EMethods.ADD_LIQUIDITY_ETH]: addLiquidityETH,
    // [EMethods.REMOVE_LIQUIDITY_ETH]: removeLiquidityETH,
}

export default syncSwapFunctions;
