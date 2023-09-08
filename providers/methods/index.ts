import { EStepType } from "@types"
import WAIT_Methods from "./WAIT/delay"
import WEB3 from "./WEB3"
import CEX from "./CEX"

export const executionMethods: Record<EStepType, any> = {
    [EStepType.WAIT]: WAIT_Methods,
    [EStepType.CEX]: CEX,
    [EStepType.WEB3]: WEB3,
}

export const executionConvertion = {

}