import { BigNumberish, Contract, Wallet, ethers } from "ethers";
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
import { convertEthAmount } from "@providers/execution/utils/base/convertAmount";
import { getMinAmountOut } from "./utils/getMinAmountOut";
import {
  initialiseArgs,
  initialiseProvider,
  initialiseWallet,
} from "@providers/execution/utils/base/initialiseInAction";
import { checkBalanceETH } from "@providers/execution/utils/base/checkBalance";
import { getOrCreateAction } from "@providers/execution/utils/action/getOrCreateAction";
import { actionWaitTxReceipt } from "@providers/execution/utils/actions/actionWaitTxReceipt";
import { initialiseGasPrice } from "@providers/execution/utils/base/gasPrice";

interface IProps {
  amountIn: {
    value: string;
    option: EPriceType;
  };
  tokenOut: { value: ECoin };
  slippage: { value: number | string };
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
      action = await completeActionAndNext(action, EActions.SWAP);

    // # # SWAP
    case EActions.SWAP:
      // `Initialise args.
      args = await initialiseArgs(args, stepState);
      provider = await initialiseProvider(provider, args.provider.url);
      wallet = await initialiseWallet(wallet, provider, args.privateKey);
      gasPrice = await initialiseGasPrice(gasPrice, provider, args.provider);

      // `Initialise contractInstance
      const routerInstance = new Contract(args.router, RouterABI, wallet);

      // `Check Eth Balance, and Deduct balance - gas = amount (only if price was set in Percents)
      const amount = await checkBalanceETH(provider, wallet.address, args.amountIn, {
        gasLimit: 3_000_000,
        gasPrice,
        deductFromAmount: stepArgs.amountIn.option === EPriceType.Percent,
      });

      // `Modify amountIn, rudicing, ethTransferAmount by amountIn -
      // const gasLimit = 200_000;
      // const gasPrice = await provider.getGasPrice();
      // const estimatedGasCost = gasPrice.mul(gasLimit);

      // `Calculate minAmountOut.
      const minAmountOut = await getMinAmountOut(
        routerInstance,
        amount.toString(),
        [args.tokenIn, args.tokenOut],
        stepArgs.slippage.value
      );

      // ` calculate Deadline
      const timestamp = Math.floor(Date.now() / 1000);
      const deadline = ethers.BigNumber.from(timestamp).add(1800); // deadline - 30 minutes

      console.log("ARGS FOR SWAP:", minAmountOut, [args.tokenIn.address, args.tokenOut.address], wallet.address, deadline, [false], { value: amount }); // prettier-ignore

      // * Make Swap
      const tx = await routerInstance.swapExactETHForTokens(
        minAmountOut, // amountOutMin
        [args.tokenIn.address, args.tokenOut.address], // path,
        wallet.address, // to
        deadline, // deadline
        {
          value: amount,
          // value: args.amountIn,
          gasPrice,
        }
      );
      console.log("TX OF SWAP\n", tx);

      // `Save tx in stepState.logs.[SWAP]
      stepState = await saveTxResponseInStepStateLog(stepState, tx, EActions.SWAP);
      // `Go to next action.
      action = await completeActionAndNext(action, EActions.WAIT_SWAP);

    // # # WAIT SWAP
    case EActions.WAIT_SWAP:
      // `Initialise values
      args = await initialiseArgs<IParseArgs>(args, stepState);
      provider = await initialiseProvider(provider, args.provider.url);

      const isStepState2 = await actionWaitTxReceipt(stepState, action, provider, EActions.SWAP); // prettier-ignore
      if (!isStepState2) return;
      stepState = isStepState2;

      // `Complete StepState
      return completeAction(action);

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
  // const providerUrl = await getProviderUrl(chain);
  const provider = await getProvider(chain);
  // privateKey && address
  const { privateKey, address } = await getAccountAddrPriv(
    stepState.accountExecutionId
  );
  // get WETH address
  const tokenIn = await getCoin(ECoin.WETH, chain);
  // get WETH address
  const tokenOut = await getCoin(stepArgs.tokenOut.value, chain);
  // routerAddress
  const router = await getContractAddress(
    chain,
    EProtocols.UNIV2,
    EProtocolNames.ROUTER
  );
  // convert AmountIn depends on 'eth', 'wei' or '%'.
  const amountIn = await convertEthAmount(
    stepArgs.amountIn.value,
    stepArgs.amountIn.option,
    { providerUrl: provider.url, owner: address }
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
