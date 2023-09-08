import { EChains, EMethods, EProtocols } from "@types";
import transferERC20 from "./transferERC20";
import transferETH from "./transferETH";
import { BigNumberish } from "ethers";

const NoneFns = (chain: EChains) => {
  return {
    [EMethods.TRANSFER_ETH]: transferETH(chain),
    [EMethods.TRANSFER_ERC20]: transferERC20(chain),
  };
};

export default NoneFns;
