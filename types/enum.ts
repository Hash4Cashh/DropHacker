export * from "./enums"

// ALL
export enum EStepType {
    CEX = "CEX",
    WEB3 = "WEB3",
    WAIT = "WAIT"
}

// WEB3
export enum EChains {
    ETH = "ETH",
    ZKSYNC = "zkSync",
}

// WEB3
export enum EProtocols {
    SYNC_SWAP = "SyncSwap",
    MUTE = "Mute",
    SPACE_SWAP = "Space",
    ONEINCH = "Oneinch",
    IZUMI = "Izumi",
    ZK_BRIDGE = "ZkBridge",
    UNIV2 = "UniV2",
    UNIV3 = "UniV3",
    SUSHI = "Sushi",
    NONE = "None",
}

// WEB3
export enum EProtocolNames {
    VAULT = "VAULT",
    ROUTER = "ROUTER",
    POOL_FACTORY = "POOL_FACTORY",
    MASTER_POOL = "MASTER_POOL",
    STABLE_POOL_FACTORY = "STABLE_POOL_FACTORY",
    CLASSIC_POOL_FACTORY = "CLASSIC_POOL_FACTORY",
    POOL = "POOL:", // need to add TOKEN0-TOKEN1
    MULTICALL = "MULTICALL",
}

// CEX
export enum EExchanges {
    OKEX = "okex"
}

// CEX
export enum EMethods {
    SWAP = "Swap",
    SWAP_ETH_TOKEN = "Swap ETH for Tokens",
    SWAP_TOKEN_ETH = "Swap Tokens for ETH",
    SWAP_TOKEN_TOKEN = "Swap Tokens for Tokens",
    WITHDRAW = "Withdraw",
    WITHDRAW_ETH = "Withdraw ETH",
    DEPOSIT = "Deposit",
    DEPOSIT_ETH = "Deposit ETH",
    ADD_LIQUIDITY = "Add Liquidity",
    ADD_LIQUIDITY_ETH = "Add Liquidity ETH",
    REMOVE_LIQUIDITY = "Remove Liquidity",
    REMOVE_LIQUIDITY_ETH = "Remove Liquidity ETH",
    DELAY = "Delay",
    DELAY_INTERVAL = "delay in interval",
    APPROVE = "Approve",
    TRANSFER_ETH = "Transfer ETH",
    TRANSFER_ERC20 = "Transfer ERC20",
}

export enum EActions {
    PREPARE_ARGS = "Prepare args",
    CHECK_ALLOWANCE = "Check allowance",
    APPROVE_ERC20 = "Approve",
    WAIT_APPROVE = "Wait approve",
    SWAP = "Swap",
    TRANSFER = "Transfer",
    WAIT_TRANSFER = "Wait Transfer",
    ADD_LIQUIDITY = "Add Liquidity",
    REMOVE_LIQUIDITY = "Remove Liquidity",
    WAIT_REMOVE_LIQUIDITY = "Wait Remove Liquidity",
    WAIT_ADD_LIQUIDITY = "Wait Add Liquidity",
    WAIT_SWAP = "Wait swap",
    WITHDRAW = "Withdraw",
    WAIT_WITHDRAW = "Wait Withdraw",
    FINILISE = "Finilise",
    WAIT_FINILISE = "Wait Finilise",
    DEPOSIT = "Deposit",
    WAIT_DEPOSIT = "Wait Deposit",
    WAIT_FUNDS = "Wait replenishment"
}

export enum EStatuses {
    PENDING = "Pending",
    IN_PROGRESS = "inProgress",
    COMPLETE = "Complete",
    SUCCESS = "Success",
    STOPED = "Stoped",
    PAUSED = "Paused",
    FAILED = "Failed",
    SKIPED = "Skiped",
}

export enum ECoin {
    ETH = "ETH",
    WETH = "WETH",
    USDC = "USDC",
    USDT = "USDT",
}
