import { BigNumber, BigNumberish, Wallet, providers } from "ethers";
import { Coin, Provider, StepState } from "@prisma/client";
import {
  saveTxResponseInStepStateLog,
  updateStepStateArgs,
} from "@providers/execution/utils/stepState/update";
import { EActions, EChains, ECoin, EPriceType } from "@types";
import {
  completeAction,
  completeActionAndNext,
} from "@providers/execution/utils/action/completeAction";
import { getProvider, getProviderUrl } from "@providers/execution/utils/base/provider";
import { getAccountAddrPriv } from "@providers/execution/utils/base/account";
import { getCoin } from "@providers/execution/utils/base/coin";
import { convertEthAmount } from "@providers/execution/utils/base/convertAmount";
import {
  initialiseArgs,
  initialiseProvider,
  initialiseWallet,
} from "@providers/execution/utils/base/initialiseInAction";
import { getOrCreateAction } from "@providers/execution/utils/action/getOrCreateAction";
import { actionWaitTxReceipt } from "@providers/execution/utils/actions/actionWaitTxReceipt";
import { initialiseGasPrice } from "@providers/execution/utils/base/gasPrice";
import { checkBalanceETH } from "@providers/execution/utils/base/checkBalance";

interface IProps {
  amount: {
    value: string;
    option: EPriceType;
  };
  //   tokenIn: { value: ECoin };
  transferTo: { value: string };
}

const defaultOptions = {
  gasLimit: 21000,
};

export default function initialiseTransferETH(chain: EChains) {
  return async (stepState: StepState, stepArgs: IProps) => {
    let action = await getOrCreateAction(stepState, EActions.PREPARE_ARGS);

    let provider: providers.JsonRpcProvider | undefined;
    let wallet: Wallet | undefined;
    let args: IParseArgs | undefined;
    let gasPrice: BigNumberish | undefined;

    console.log("stepArgs", stepArgs);
    switch (action.name) {
      // # # Prepare Arguments
      case EActions.PREPARE_ARGS:
        args = await prepareArgs(stepState, stepArgs);
        stepState = await updateStepStateArgs(stepState.id, args);
        action = await completeActionAndNext(action, EActions.TRANSFER);

      // ## ## TRANSFER
      case EActions.TRANSFER:
        // `Initialise
        args = await initialiseArgs<IParseArgs>(args, stepState);
        provider = await initialiseProvider(provider, args.provider.url);
        wallet = await initialiseWallet(wallet, provider, args.privateKey);
        gasPrice = await initialiseGasPrice(gasPrice, provider, args.provider);

        const gasLimit = await wallet.estimateGas({
            to: stepArgs.transferTo.value,
            value: BigNumber.from(args.amount).div(2),
            data: "0x"
        });

        console.log("GAS LIMIT:::", gasLimit.toString(),gasLimit.mul(101).div(100).toString())
        const value = await checkBalanceETH(
          provider,
          wallet.address,
          args.amount,
          {
            gasPrice,
            gasLimit: gasLimit.mul(1005).div(1000), // increase on 0.5%
            deductFromAmount: stepArgs.amount.option === EPriceType.Percent,
          }
        );

        const response = await wallet.sendTransaction({
          to: stepArgs.transferTo.value,
          gasPrice,
          value,
        });

        // `Save tx in stepState.logs.[SWAP]
        stepState = await saveTxResponseInStepStateLog(stepState, response, EActions.TRANSFER); // prettier-ignore

        // `Go to the nextStep
        action = await completeActionAndNext(action, EActions.WAIT_TRANSFER);

      // # # WAIT_TRANSFER
      case EActions.WAIT_TRANSFER:
        // `Initialise values
        args = await initialiseArgs<IParseArgs>(args, stepState);
        provider = await initialiseProvider(provider, args.provider.url);

        const isStepState2 = await actionWaitTxReceipt(stepState, action, provider, EActions.TRANSFER); // prettier-ignore
        if (!isStepState2) return;
        stepState = isStepState2;

        // `Complete StepState
        return completeAction(action);

      default:
        throw `Unknown Action ${action.name}`; // should never come here
    }
  };

  async function prepareArgs(
    stepState: StepState,
    stepArgs: IProps
  ): Promise<IParseArgs> {
    // provider
    // const providerUrl = await getProviderUrl(chain);
    const provider = await getProvider(chain);

    // privateKey && address
    const { privateKey, address } = await getAccountAddrPriv(
      stepState.accountExecutionId
    );

    // get TokenIn address
    const token = await getCoin(ECoin.ETH, chain);

    const amount = await convertEthAmount(
      stepArgs.amount.value,
      stepArgs.amount.option,
      { providerUrl: provider.url, owner: address }
    );

    return {
      provider,
      address,
      privateKey,
      token: token!,
      amount,
    };
  }
}

interface IParseArgs {
  provider: Provider;
  address: string;
  privateKey: string;
  token: Coin;
  amount: string;
}
