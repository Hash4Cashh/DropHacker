import { EChains, EMethods, EProtocols } from "@types";
import OneInchSwap from "./swap";

const zkSyncProtocolsWithFunction = (chain: EChains) => {
  return {
    [EMethods.SWAP]: OneInchSwap(chain),
  };
};

export default zkSyncProtocolsWithFunction;
