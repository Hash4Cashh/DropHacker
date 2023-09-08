import { BigNumber, BigNumberish, Wallet, providers, utils } from "ethers";
import { getERC20Balance } from "./erc20";

const defaultOptions = {
  gasPrice: 0,
  gasLimit: 21000,
  gas: 0,
  deductFromAmount: false,
  gasThreshold: 100,
  fee: 0,
};

export async function checkBalanceETH(
  provider: providers.JsonRpcProvider,
  owner: string,
  amount: BigNumberish,
  options: {
    gasPrice: BigNumberish;
    gasLimit?: BigNumberish;
    gas?: BigNumberish;
    fee?: BigNumberish;
    deductFromAmount?: boolean;
    gasThreshold?: number;
    asBigNumber?: boolean
  } = defaultOptions
) {
  let { gasLimit, gasPrice, gas, deductFromAmount, gasThreshold } = Object.assign(
    {},
    defaultOptions,
    options
  );

  const ethBalance = await provider.getBalance(owner);
  if (ethBalance.lt(amount))
    throw new Error(
      `Insufficient balance. Need ${utils.formatEther(
        amount
      )} but available ${utils.formatEther(ethBalance)}`
    );

  // No need to check ethBalance
  if(!gas && !gasPrice) return ethBalance;

  // Initialise Calculation Values
  let gasBn: BigNumber;
  if (gas) {
    gasBn = BigNumber.from(gas!);
  } else {
    gasBn = BigNumber.from(gasLimit).mul(gasPrice);
  }

  const amountBn = BigNumber.from(amount);
  const totalRequiredBalance = amountBn.add(gasBn);

  console.log("GAS BN:", utils.formatEther(gasBn));
  console.log("GAS Price:", utils.formatUnits(gasPrice, 9));

  // "Check if Gas is Higher that ethBalance
  if (ethBalance.lt(gasBn)) {
    // todo forse execute...
    // `not enough eth balance for gas execution.
    // this is approximate calculation, so need to have opportunity to skeep this error.
    throw new Error(
      `Not enough balance for GAS. Total balance: ${utils.formatEther(
        ethBalance
      )}. Approximate gas cost: ${utils.formatEther(gasBn)}`
    );
  }

  // ``Calculate gas differance between amount.
  const gasDiff = gasBn.sub(amountBn);
  let gasDiffPercentage = gasDiff.mul(100).div(amountBn);
  // "If gasDiff is less than 0, need
  if (gasDiff.lt(0)) {
    // Simple Example: gas = 20, amount 50. gasDiff = -30, gasDiffP = -60%.
    // So if we 100 - 60% = 40% - this is how much gas are in amount.
    gasDiffPercentage = BigNumber.from(100).add(gasDiffPercentage);
  }

  // "Check if gasDifferance is greate than gasThreshold (default 100% - gas is equal to amount.).
  if (gasDiffPercentage.gte(gasThreshold) && deductFromAmount) {
    // gasDiffPercentage is higher than gasThreshold, which is likely mean that gas is equal to amount or even higher
    // todo forse execute...
    throw new Error(
      `
      ERROR: Is not possible to deduct gas from transfer amount.\n
      Gas is ${gasDiffPercentage.toString()}% higher than the amount. gasThreshold Limit: ${gasThreshold.toString()}%\n
      transfer amount: ${utils.formatEther(
        amount
      )}, Eproximate Gas: ${utils.formatEther(gasBn)}.
      `
    );
  }

  // "Check if ethBalance is higher that amount + gas
  let value;
  if (ethBalance.lt(totalRequiredBalance)) {
    // Insufficient balance for executing the transaction
    if (deductFromAmount) {
      // Deduct the gas cost from the amount
      value = amountBn.sub(gasBn);
    } else {
      value = ethBalance.sub(gasBn);
      // todo forse execute...
      throw new Error(
        `Insufficient balance. Need ${utils.formatEther(amount)} + gas ${utils.formatEther(
          gasBn
        )} -> total ${utils.formatEther(totalRequiredBalance)}  but available ${utils.formatEther(ethBalance)}`
      );
    }
  } else {
    // Sufficient balance for executing the transaction
    if (deductFromAmount) {
      // Deduct the gas cost from the amount
      value = amountBn.sub(gasBn);
    } else {
      value = amountBn;
    }
  }

  // if(asBigNumber) {
    return value;
  // } else {
  //   return value.toString();
  // }
}

export async function checkGasCostBalance() {

}

export async function checkBalanceERC20(
  provider: providers.JsonRpcProvider,
  owner: string,
  amount: BigNumberish,
  coin: { address: string; decimals: number }
) {
  const erc20Balance = await getERC20Balance(provider, coin.address, owner);
  if (erc20Balance.lt(amount))
    throw `Insufficient balance. Need ${utils.formatUnits(
      amount,
      coin.decimals
    )} but available ${utils.formatUnits(erc20Balance, coin.decimals)}`;
}
