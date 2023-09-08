import { IContract } from "../../types";
import { EChains, EProtocols, EProtocolNames } from "../../types/enum";

export const contractsSeed: Array<IContract> = [
    // * SYNC_SWAP
    {
        chain: EChains.ZKSYNC,
        protocol: EProtocols.SYNC_SWAP,
        name: EProtocolNames.ROUTER,
        address: "0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295"
    },
    {
        chain: EChains.ZKSYNC,
        protocol: EProtocols.SYNC_SWAP,
        name: EProtocolNames.VAULT,
        address: "0x621425a1Ef6abE91058E9712575dcc4258F8d091"
    },
    {
        chain: EChains.ZKSYNC,
        protocol: EProtocols.SYNC_SWAP,
        name: EProtocolNames.MASTER_POOL,
        address: "0xbB05918E9B4bA9Fe2c8384d223f0844867909Ffb"
    },
    {
        chain: EChains.ZKSYNC,
        protocol: EProtocols.SYNC_SWAP,
        name: EProtocolNames.CLASSIC_POOL_FACTORY,
        address: "0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb"
    },
    {
        chain: EChains.ZKSYNC,
        protocol: EProtocols.SYNC_SWAP,
        name: EProtocolNames.STABLE_POOL_FACTORY,
        address: "0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3"
    },

    // * MUTE
    {
        chain: EChains.ZKSYNC,
        protocol: EProtocols.MUTE,
        name: EProtocolNames.ROUTER,
        address: "0x8B791913eB07C32779a16750e3868aA8495F5964"
    },
    {
        chain: EChains.ZKSYNC,
        protocol: EProtocols.MUTE,
        name: EProtocolNames.POOL_FACTORY,
        address: "0x40be1cba6c5b47cdf9da7f963b6f761f4c60627d"
    },
    {
        chain: EChains.ZKSYNC,
        protocol: EProtocols.NONE,
        name: EProtocolNames.MULTICALL,
        address: "0xb1F9b5FCD56122CdfD7086e017ec63E50dC075e7"
    },

    // * SpaceSwap
    {
        chain: EChains.ZKSYNC,
        protocol: EProtocols.SPACE_SWAP,
        name: EProtocolNames.ROUTER,
        address: "0xbE7D1FD1f6748bbDefC4fbaCafBb11C6Fc506d1d"
    },
    {
        chain: EChains.ZKSYNC,
        protocol: EProtocols.SPACE_SWAP,
        name: EProtocolNames.POOL_FACTORY,
        address: "0x0700Fb51560CfC8F896B2c812499D17c5B0bF6A7"
    },

    // * OneInch
    {
        chain: EChains.ZKSYNC,
        protocol: EProtocols.ONEINCH,
        name: EProtocolNames.ROUTER,
        address: "0x6e2B76966cbD9cF4cC2Fa0D76d24d5241E0ABC2F"
    },
    {
        chain: EChains.ETH,
        protocol: EProtocols.ONEINCH,
        name: EProtocolNames.ROUTER,
        address: "0x111111111117dC0aa78b770fA6A738034120C302"
    },
]