import { EPriceType } from "@types";
import { getErrorMessage } from "@utils/getErrorMessage";
import { BigNumber, BigNumberish, ethers, utils } from "ethers";
import { getERC20Balance } from "./erc20";

export async function convertEthAmount(
  amount: BigNumberish,
  option: EPriceType,
  { providerUrl, owner }: { providerUrl: string; owner: string }
) {
  console.log("convertEthAmount providerUrl", providerUrl)
  try {
    switch (option) {
      case EPriceType.Wei:
        return BigNumber.from(amount).toString();
      case EPriceType.Eth:
        return utils.parseEther(amount.toString()).toString();
      case EPriceType.Percent:
        const prov = new ethers.providers.JsonRpcProvider(providerUrl);
        const balance = await prov.getBalance(owner);
        return balance.mul(amount).div(100).toString(); // amount is %
      default:
        throw new Error(`Unsuported amount option ${option}`);
    }
  } catch (e) {
    const errorMessage = getErrorMessage(e);
    throw new Error(
      `Error during converting eth amount. Message: ${errorMessage}`
    );
  }
}

export async function convertERC20Amount(
  amount: BigNumberish,
  option: EPriceType,
  { providerUrl, owner, decimals, erc20Address }: { providerUrl: string; owner: string, decimals: number, erc20Address: string }
) {
  try {
    switch (option) {
      case EPriceType.Wei:
        return BigNumber.from(amount).toString();
      case EPriceType.Eth:
        return utils.parseUnits(amount.toString(), decimals).toString();
      case EPriceType.Percent:
        const prov = new ethers.providers.JsonRpcProvider(providerUrl);
        const balance = await getERC20Balance(prov, erc20Address, owner);;
        return balance.mul(amount).div(100).toString(); // amount is %
      default:
        throw new Error(`Unsuported amount option ${option}`);
    }
  } catch (e) {
    const errorMessage = getErrorMessage(e);
    throw new Error(
      `Error during converting eth amount. Message: ${errorMessage}`
    );
  }
}
