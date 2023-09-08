import { EMethods } from "@types"
import withdrawETH from "./withdraw"

const syncSwapFunctions = {
    [EMethods.WITHDRAW]: withdrawETH(),
}

export default syncSwapFunctions;
