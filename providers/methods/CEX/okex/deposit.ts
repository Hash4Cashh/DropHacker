import { BigNumberish, Wallet, ethers } from "ethers";
import { Provider, StepState } from "@prisma/client";
import {
  saveTxResponseInStepStateLog,
  updateStepStateArgs,
} from "@providers/execution/utils/stepState/update";
import {
  EActions,
  EChains,
  ECoin,
  EExchanges,
  EPriceType,
  IExchange,
} from "@types";
import {
  completeAction,
  completeActionAndNext,
} from "@providers/execution/utils/action/completeAction";
import { getProvider } from "@providers/execution/utils/base/provider";
import { getAccountAddrPriv } from "@providers/execution/utils/base/account";
import { getCoin } from "@providers/execution/utils/base/coin";
import {
  convertEthAmount,
} from "@providers/execution/utils/base/convertAmount";
import {
  initialiseArgs,
  initialiseProvider,
  initialiseWallet,
} from "@providers/execution/utils/base/initialiseInAction";
import { checkBalanceETH } from "@providers/execution/utils/base/checkBalance";
import { getOrCreateAction } from "@providers/execution/utils/action/getOrCreateAction";
import { actionWaitTxReceipt } from "@providers/execution/utils/actions/actionWaitTxReceipt";
import { getExchange } from "@providers/execution/utils/base/exchange";
import { getDepositAddress } from "./utils/getDepositAddress";
import { DOUBLE_TIME_LIMIT } from "@utils/promises";
import { initialiseGasPrice } from "@providers/execution/utils/base/gasPrice";

interface IProps {
  amount: {
    value: string;
    option: EPriceType;
  };
  token: { value: ECoin };
  chain: { value: EChains };
}
export default async function swapEthForTokens(
  stepState: StepState,
  stepArgs: IProps
) {
  let action = await getOrCreateAction(stepState, EActions.PREPARE_ARGS);
  let provider: ethers.providers.JsonRpcProvider | undefined;
  let wallet: Wallet | undefined;
  let args: IParseArgs | undefined;
  let gasPrice: BigNumberish | undefined;

  console.log("stepArgs", stepArgs);
  switch (action.name) {
    // # # Prepare Args
    case EActions.PREPARE_ARGS:
      args = await prepareArgs(stepState, stepArgs);
      stepState = await updateStepStateArgs(stepState.id, args);
      action = await completeActionAndNext(action, EActions.DEPOSIT);

    // # # Check Allowance
    // case EActions.CHECK_ALLOWANCE:
    //   console.log("CHECK ALLOWANCE");

    //   // `Initialise args
    //   args = await initialiseArgs<IParseArgs>(args, stepState);
    //   provider = await initialiseProvider(provider, args.providerUrl);

    //   // # Check Allowance
    //   const allowance = await getERC20Allowance(provider, args.tokenIn.address, args.address, args.router); // prettier-ignore
    //   if (allowance.lt(args.amountIn)) {
    //     action = await completeActionAndNext(action, EActions.APPROVE_ERC20);
    //   } else action = await completeActionAndNext(action, EActions.SWAP);
    //   console.log("ALLOWANCE", allowance.toString());

    // # # Approve ERC20 Tokens
    // case EActions.APPROVE_ERC20:
    //   if (action.name === EActions.APPROVE_ERC20) {
    //     console.log("APPROVE_ERC20");

    //     // `Initialise args
    //     args = await initialiseArgs<IParseArgs>(args, stepState);
    //     provider = await initialiseProvider(provider, args?.providerUrl!);
    //     wallet = await initialiseWallet(wallet, provider, args?.privateKey!);

    //     // # Approve erc20 Tokens
    //     const approveTx = await approveERC20(wallet, args?.tokenIn.address!, args?.router!, args?.amountIn!); // prettier-ignore
    //     stepState = await saveTxResponseInStepStateLog(stepState, approveTx, EActions.APPROVE_ERC20); // prettier-ignore
    //     action = await completeActionAndNext(action, EActions.WAIT_APPROVE);
    //   }

    // # # Wait Approval
    // case EActions.WAIT_APPROVE:
    //   if (action.name === EActions.WAIT_APPROVE) {
    //     console.log("WAIT APPROVE_ERC20");

    //     // `Initialise Args
    //     args = await initialiseArgs(args, stepState);
    //     provider = await initialiseProvider(provider, args.providerUrl);

    //     const isStepState1 = await actionWaitTxReceipt(stepState, action, provider, EActions.APPROVE_ERC20); // prettier-ignore
    //     if (!isStepState1) return;
    //     stepState = isStepState1;
    //     action = await completeActionAndNext(action, EActions.SWAP);
    //   }

    // ## ## DEPOSIT
    case EActions.DEPOSIT:
      // `Initialise args.
      args = await initialiseArgs(args, stepState);
      provider = await initialiseProvider(provider, args.provider.url);
      wallet = await initialiseWallet(wallet, provider, args.privateKey);
      gasPrice = await initialiseGasPrice(gasPrice, provider, args.provider)

      // todo canDep - get in getCurrency.

      // `Check Eth Balance
      console.log("args.depositAmount", args.depositAmount);
      const value = await checkBalanceETH(
        provider,
        wallet.address,
        args.depositAmount,
        {
          gasPrice,
          gasLimit: 21000,
          deductFromAmount: stepArgs.amount.option === EPriceType.Percent,
        }
      );

      const tx = await wallet.sendTransaction({
        to: args.depositAddress,
        value,
        gasPrice,
      });

      console.log("COME HERE AFTER RETURN");
      // `Save tx in stepState.logs.[SWAP]
      stepState = await saveTxResponseInStepStateLog(
        stepState,
        tx,
        EActions.DEPOSIT
      );
      // `Go to next action.
      action = await completeActionAndNext(action, EActions.WAIT_DEPOSIT);

    // # # WAIT_DEPOSIT
    case EActions.WAIT_DEPOSIT:
      // `Initialise values
      args = await initialiseArgs<IParseArgs>(args, stepState);
      provider = await initialiseProvider(provider, args.provider.url);

      // * Wait TX Receipt.
      const isStepState2 = await actionWaitTxReceipt(
        stepState,
        action,
        provider,
        EActions.DEPOSIT,
        { timeLimit: DOUBLE_TIME_LIMIT }
      );
      if (!isStepState2) return;
      stepState = isStepState2;

      // `Complete StepState
      return completeAction(action);

    case EActions.WAIT_FUNDS:
      // todo. Need to wait, until account would be deposited.
      // todo Later
      // Wait Balance on SubAccount.
      // Transfer Balance to MainAccount.
      // Delete Sub Account. (To keep everything Clear).
      break;
    default:
      throw `Unknown Action ${action.name}`; // should never come here
  }
}

interface IParseArgs {
  provider: Provider;
  address: string;
  privateKey: string;

  exchange: IExchange;

  depositToken: { address: string; decimals: number };
  depositAddress: string;
  depositAmount: string;
}

async function prepareArgs(
  stepState: StepState,
  stepArgs: IProps
): Promise<IParseArgs> {
  const chain = stepArgs.chain.value;
  const sToken = stepArgs.token.value;

  // provider
  // const providerUrl = await getProviderUrl(chain);
  const provider = await getProvider(chain);

  // privateKey && address
  const { privateKey, address } = await getAccountAddrPriv(
    stepState.accountExecutionId
  );

  // get WETH address
  const depositToken = await getCoin(sToken, chain);

  // get Okex Exchange
  const exchange = (await getExchange(EExchanges.OKEX)) as IExchange;

  // todo Create Sub Account, get Deposit Address of the SubAccount.
  const depositAddress = await getDepositAddress(exchange, sToken, chain);

  // convert depositAmount depends on 'eth', 'wei' or '%'.
  const depositAmount = await convertEthAmount(
    stepArgs.amount.value,
    stepArgs.amount.option,
    {
      providerUrl: provider.url,
      owner: address,
    }
  );

  return {
    provider,
    address,
    privateKey,

    exchange,
    depositToken: depositToken!,
    depositAmount,
    depositAddress,
  };
}
