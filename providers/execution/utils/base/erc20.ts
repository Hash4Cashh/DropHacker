import { BigNumber, BigNumberish, Contract, Signer, providers } from "ethers";
import ERC20ABI from "../../../../abi/ERC20.json";

export async function getERC20Balance(
  providerOrSigner: Signer | providers.JsonRpcProvider,
  erc20Address: string,
  ownerAddress: string
): Promise<BigNumber> {
  const erc20Instance = new Contract(erc20Address, ERC20ABI, providerOrSigner);
  return erc20Instance.balanceOf(ownerAddress);
}

export async function getERC20Decimals(
  providerOrSigner: Signer | providers.JsonRpcProvider,
  erc20Address: string
): Promise<number> {
  const erc20Instance = new Contract(erc20Address, ERC20ABI, providerOrSigner);
  const decimals = await erc20Instance.decimals();
  return BigNumber.from(decimals).toNumber();
}

export async function getERC20Allowance(
  providerOrSigner: Signer | providers.JsonRpcProvider,
  erc20Address: string,
  ownerAddress: string,
  approver: string
): Promise<BigNumber> {
  const erc20Instance = new Contract(erc20Address, ERC20ABI, providerOrSigner);
  const allowance = await erc20Instance.allowance(ownerAddress, approver);
  return BigNumber.from(allowance);
}

export async function approveERC20(
  signer: Signer,
  erc20Address: string,
  approver: string,
  amount: BigNumberish,
  options: { gasPrice: BigNumberish }
): Promise<providers.TransactionResponse> {
  const { gasPrice } = options;
  const erc20Instance = new Contract(erc20Address, ERC20ABI, signer);
  return erc20Instance.approve(approver, amount, {
    gasPrice: gasPrice ? gasPrice : await signer.getGasPrice(), // use defaultGasPrice or Specific GasPrice
  });
}

export async function transferERC20(
  signer: Signer,
  erc20Address: string,
  to: string,
  amount: BigNumberish,
  options: { gasPrice?: BigNumberish } = {}
) {
  const { gasPrice } = options;
  const erc20Instance = new Contract(erc20Address, ERC20ABI, signer);
  return erc20Instance.transfer(to, amount, {
    gasPrice: gasPrice ? gasPrice : await signer.getGasPrice(), // use defaultGasPrice or Specific GasPrice
  });
}
