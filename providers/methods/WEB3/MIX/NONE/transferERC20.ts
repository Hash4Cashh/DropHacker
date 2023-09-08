import { BigNumberish, Wallet, providers } from "ethers";
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
import {
  convertERC20Amount,
} from "@providers/execution/utils/base/convertAmount";
import {
  transferERC20
} from "@providers/execution/utils/base/erc20";
import {
  initialiseArgs,
  initialiseProvider,
  initialiseWallet,
} from "@providers/execution/utils/base/initialiseInAction";
import { getOrCreateAction } from "@providers/execution/utils/action/getOrCreateAction";
import { actionWaitTxReceipt } from "@providers/execution/utils/actions/actionWaitTxReceipt";
import { initialiseGasPrice } from "@providers/execution/utils/base/gasPrice";
import { checkBalanceERC20 } from "@providers/execution/utils/base/checkBalance";

interface IProps {
  amount: {
    value: string;
    option: EPriceType;
  };
  token: { value: ECoin };
  transferTo: { value: string };
}

const defaultOptions = {
  gasLimit: 21000,
};

export default function initialiseSwapOneInch(chain: EChains) {

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

        await checkBalanceERC20(provider, wallet.address, args.amount, args.token);

        const response = await transferERC20(wallet, args.token.address, stepArgs.transferTo.value, args.amount, {gasPrice})
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

    // get Token address
    const token = await getCoin(stepArgs.token.value, chain);

    const amount = await convertERC20Amount(
      stepArgs.amount.value,
      stepArgs.amount.option,
      {
        providerUrl: provider.url,
        owner: address,
        decimals: token?.decimals!,
        erc20Address: token?.address!,
      }
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
