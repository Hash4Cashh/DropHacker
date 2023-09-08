import { EChains, EMethods } from "@types"
import WITHDRAW from "./withdraw"
import DEPOSIT from "./deposit"

const exchangeMethods = {
    [EMethods.WITHDRAW]: WITHDRAW,
    [EMethods.DEPOSIT]: DEPOSIT,
}

export default exchangeMethods;