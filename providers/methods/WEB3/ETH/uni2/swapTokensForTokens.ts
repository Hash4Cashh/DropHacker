import { BigNumber, BigNumberish, Contract, Wallet, ethers, providers } from "ethers";
import { Provider, StepState } from "@prisma/client";
import {
  saveTxResponseInStepStateLog,
  updateStepStateArgs,
} from "@providers/execution/utils/stepState/update";
import {
  EActions,
  EChains,
  ECoin,
  EPriceType,
  EProtocolNames,
  EProtocols,
} from "@types";
import RouterABI from "@abi/UniV2/UniswapV2Router02.json";
import {
  completeAction,
  completeActionAndNext,
} from "@providers/execution/utils/action/completeAction";
import { getProvider, getProviderUrl } from "@providers/execution/utils/base/provider";
import { getAccountAddrPriv } from "@providers/execution/utils/base/account";
import { getCoin } from "@providers/execution/utils/base/coin";
import { getContractAddress } from "@providers/execution/utils/base/contract";
import { convertERC20Amount } from "@providers/execution/utils/base/convertAmount";
import { getMinAmountOut } from "./utils/getMinAmountOut";
import {
  approveERC20,
  getERC20Allowance,
} from "@providers/execution/utils/base/erc20";
import {
  initialiseArgs,
  initialiseProvider,
  initialiseWallet,
} from "@providers/execution/utils/base/initialiseInAction";
import { checkBalanceERC20 } from "@providers/execution/utils/base/checkBalance";
import { getOrCreateAction } from "@providers/execution/utils/action/getOrCreateAction";
import { actionWaitTxReceipt } from "@providers/execution/utils/actions/actionWaitTxReceipt";
import { initialiseGasPrice } from "@providers/execution/utils/base/gasPrice";

interface IProps {
  amountIn: {
    value: string;
    option: EPriceType;
  };
  tokenIn: { value: ECoin };
  tokenOut: { value: ECoin };
  slippage: { value: number | string };
}

export default async function swapTokensForTokens(
  stepState: StepState,
  stepArgs: IProps
) {
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
      action = await completeActionAndNext(action, EActions.CHECK_ALLOWANCE); // 'NEXT STEP

    // # # Check Allowance
    case EActions.CHECK_ALLOWANCE:
      // `Initialise args
      args = await initialiseArgs<IParseArgs>(args, stepState);
      provider = await initialiseProvider(provider, args.provider.url);

      // # Check Allowance
      const allowance = await getERC20Allowance(provider, args.tokenIn.address, args.address, args.router); // prettier-ignore
      if (allowance.lt(args.amountIn)) {
        action = await completeActionAndNext(action, EActions.APPROVE_ERC20); // 'APROVE TOKENS
      } else action = await completeActionAndNext(action, EActions.SWAP); // 'NEXT STEP
      console.log("ALLOWANCE", allowance.toString());

    // # # Approve ERC20 Tokens
    case EActions.APPROVE_ERC20:
      if (action.name === EActions.APPROVE_ERC20) {
        console.log("APPROVE_ERC20");

        // `Initialise args
        args = await initialiseArgs(args, stepState);
        provider = await initialiseProvider(provider, args?.provider.url!);
        wallet = await initialiseWallet(wallet, provider, args?.privateKey!);
        gasPrice = await initialiseGasPrice(gasPrice, provider, args.provider);

        // # Approve erc20 Tokens
        const approveTx = await approveERC20(wallet, args?.tokenIn.address!, args?.router!, args?.amountIn!, { gasPrice }); // prettier-ignore
        stepState = await saveTxResponseInStepStateLog(stepState, approveTx, EActions.APPROVE_ERC20); // prettier-ignore
        action = await completeActionAndNext(action, EActions.WAIT_APPROVE); // 'WAIT APPROVE
      }

    // # # Wait Approval
    case EActions.WAIT_APPROVE:
      if (action.name === EActions.WAIT_APPROVE) {
        console.log("WAIT APPROVE_ERC20");

        // `Initialise Args
        args = await initialiseArgs(args, stepState);
        provider = await initialiseProvider(provider, args.provider.url);

        const isStepState1 = await actionWaitTxReceipt(stepState, action, provider, EActions.APPROVE_ERC20); // prettier-ignore
        if (!isStepState1) return;
        stepState = isStepState1;
        action = await completeActionAndNext(action, EActions.SWAP); // 'NEXT STEP
      }

    // ## ## SWAP
    case EActions.SWAP:
      // `Initialise
      args = await initialiseArgs<IParseArgs>(args, stepState);
      provider = await initialiseProvider(provider, args.provider.url);
      wallet = await initialiseWallet(wallet, provider, args.privateKey);
      gasPrice = await initialiseGasPrice(gasPrice, provider, args.provider)

      // `Initialise contract
      const routerInstance = new Contract(args.router, RouterABI, wallet);

      // `Check Eth Balance
      await checkBalanceERC20(
        provider,
        args.address,
        args.amountIn,
        args.tokenIn
      );

      // `Calculate minAmountOut.
      const minAmountOut = await getMinAmountOut(
        routerInstance,
        args.amountIn,
        [args.tokenIn, args.tokenOut],
        stepArgs.slippage.value
      );

      // ` calculate Deadline
      const timestamp = Math.floor(Date.now() / 1000);
      const deadline = ethers.BigNumber.from(timestamp).add(1800); // deadline - 30 minutes

      console.log("ARGS FOR SWAP:", minAmountOut, [args.tokenIn.address, args.tokenOut.address], wallet.address, deadline, [false], { value: args.amountIn }); // prettier-ignore

      // *** Make Swap
      const tx = await routerInstance.swapExactTokensForTokens(
        args.amountIn, // amountIn
        minAmountOut, // amountOutMin
        [args.tokenIn.address, args.tokenOut.address], // path,
        wallet.address, // to
        deadline, // deadline
        { gasPrice }
      );

      // `Save tx in stepState.logs.[SWAP]
      stepState = await saveTxResponseInStepStateLog(stepState, tx, EActions.SWAP); // prettier-ignore
      // `Go to the nextStep
      action = await completeActionAndNext(action, EActions.WAIT_SWAP); // 'NEXT STEP

    // # # WAIT SWAP
    case EActions.WAIT_SWAP:
      // `Initialise values
      args = await initialiseArgs<IParseArgs>(args, stepState);
      provider = await initialiseProvider(provider, args.provider.url);

      const isStepState2 = await actionWaitTxReceipt(stepState, action, provider, EActions.SWAP); // prettier-ignore
      if (!isStepState2) return;
      stepState = isStepState2;

      // `Complete StepState
      return completeAction(action); // ''FINISH

    default:
      throw `Unknown Action ${action.name}`; // should never come here
  }
}

interface IParseArgs {
  provider: Provider;
  address: string;
  privateKey: string;
  tokenIn: { address: string; decimals: number };
  tokenOut: { address: string; decimals: number };
  router: string;
  amountIn: string;
}

async function prepareArgs(
  stepState: StepState,
  stepArgs: IProps
): Promise<IParseArgs> {
  const chain = EChains.ETH;
  // provider
  const provider = await getProvider(chain);
  // privateKey && address
  const { privateKey, address } = await getAccountAddrPriv(
    stepState.accountExecutionId
  );
  // get TokenIn address
  const tokenIn = await getCoin(stepArgs.tokenIn.value, chain);
  // get WETH address
  const tokenOut = await getCoin(stepArgs.tokenOut.value, chain);
  // routerAddress
  const router = await getContractAddress(
    chain,
    EProtocols.UNIV2,
    EProtocolNames.ROUTER
  );
  // convert AmountIn depends on 'eth', 'wei' or '%'.
  const amountIn = await convertERC20Amount(
    stepArgs.amountIn.value,
    stepArgs.amountIn.option,
    {
      providerUrl: provider.url,
      owner: address,
      decimals: tokenIn!.decimals,
      erc20Address: tokenIn!.address,
    }
  );

  return {
    provider,
    address,
    privateKey,
    tokenIn: tokenIn!,
    tokenOut: tokenOut!,
    router,
    amountIn,
  };
}
