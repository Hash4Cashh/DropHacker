import { EStatuses } from "@types"

export function getStatusColor(status: EStatuses) {
    switch(status) {
        case EStatuses.PENDING:
            return "#CCCCCC"
        case EStatuses.IN_PROGRESS:
            return "#2fd5e9"
        case EStatuses.SUCCESS:
        case EStatuses.COMPLETE:
            return "#32CE8D"
        case EStatuses.COMPLETE + EStatuses.FAILED:
            return "#32CE8D"
        case EStatuses.FAILED:
            return "#DF2A6B"
        case EStatuses.STOPED:
            return "#444444"
        default:
            return "grey"
    }
}