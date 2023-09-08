import { EMethods } from "@types"
import deposit from "./deposit"

const syncSwapFunctions = {
    [EMethods.DEPOSIT]: deposit,
}

export default syncSwapFunctions;
