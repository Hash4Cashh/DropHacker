import { BigNumberish, Contract, Wallet, constants, ethers } from "ethers";
import { Coin, Provider, StepState } from "@prisma/client";
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
import RouterABI from "@abi/SyncSwap/Router.abi.json";
import {
  completeAction,
  completeActionAndNext,
} from "@providers/execution/utils/action/completeAction";
import { getProvider, getProviderUrl } from "@providers/execution/utils/base/provider";
import { getAccountAddrPriv } from "@providers/execution/utils/base/account";
import { createLpCoin, getCoin, getLPCoin } from "@providers/execution/utils/base/coin";
import { getContractAddress } from "@providers/execution/utils/base/contract";
import { convertEthAmount } from "@providers/execution/utils/base/convertAmount";
import {
  initialiseArgs,
  initialiseProvider,
  initialiseWallet,
} from "@providers/execution/utils/base/initialiseInAction";
import { checkBalanceETH } from "@providers/execution/utils/base/checkBalance";
import { getOrCreateAction } from "@providers/execution/utils/action/getOrCreateAction";
import { actionWaitTxReceipt } from "@providers/execution/utils/actions/actionWaitTxReceipt";
import { getPoolAddress } from "./utils/getPoolAddress";
import { defaultAbiCoder } from "ethers/lib/utils";
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

      // `Check Eth Balance, and deduct gas from ethAmount
      const value = await checkBalanceETH(provider, wallet.address, args.amountIn, {
        gasLimit: 3_000_000, // in l2 gas_limit 10 times higher.
        gasPrice, // But also gas price 100 times cheaper.
        deductFromAmount: stepArgs.amountIn.option === EPriceType.Percent,
      });

      // ` calculate Deadline
      const timestamp = Math.floor(Date.now() / 1000);
      const deadline = ethers.BigNumber.from(timestamp).add(1800); // deadline - 30 minutes

      // console.log("ARGS FOR SWAP:", minAmountOut, [args.tokenIn.address, args.tokenOut.address], wallet.address, deadline, [false], { value: args.amountIn }); // prettier-ignore

      const path = args.paths;
      path[0].amountIn = value; // change amount in according to the value.

      // * Make Swap
      const tx = await routerInstance.swap(
        args.paths,
        ethers.constants.Zero, // AmountOutMin - slippage have to be there. // todo Get AmountsOut or Price and implement Slippage.
        deadline, // deadline - 30 minutes
        {
          // value: args.amountIn,
          value,
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
  pool: { address: string; decimals: number };
  paths: any,
  router: string;
  amountIn: string;
}

async function prepareArgs(
  stepState: StepState,
  stepArgs: IProps
): Promise<IParseArgs> {
  const chain = EChains.ZKSYNC;
  const protocol = EProtocols.SYNC_SWAP;
  const sTokenIn = ECoin.WETH;
  const sTokenOut = stepArgs.tokenOut.value
  // provider
  // const providerUrl = await getProviderUrl(chain);
  const provider = await getProvider(chain);
  // privateKey && address
  const { privateKey, address } = await getAccountAddrPriv(
    stepState.accountExecutionId
  );

  // get WETH address
  const tokenIn = await getCoin(sTokenIn, chain);
  // get WETH address
  const tokenOut = await getCoin(sTokenOut, chain);

  let pool: Coin | null;
  pool = await getLPCoin(ECoin.WETH, sTokenOut, chain, protocol); // prettier-ignore
  if(!pool) {
    const _provider = await initialiseProvider(undefined, provider.url);
    const poolAddress = await getPoolAddress(tokenIn?.address!, tokenOut?.address!, _provider); // prettier-ignore
    pool = await createLpCoin(poolAddress, sTokenIn, sTokenOut, chain, protocol, _provider); // prettier-ignore
  }

  // routerAddress
  const router = await getContractAddress(chain, protocol, EProtocolNames.ROUTER); // prettier-ignore
  
  // convert AmountIn depends on 'eth', 'wei' or '%'.
  const amountIn = await convertEthAmount(
    stepArgs.amountIn.value,
    stepArgs.amountIn.option,
    { providerUrl: provider.url, owner: address }
  );

  // * Constructs the swap paths with steps.
  // Determine withdraw mode, to withdraw native ETH or wETH on last step.
  // 0 - vault internal transfer
  // 1 - withdraw and unwrap to naitve ETH
  // 2 - withdraw and wrap to wETH
  const withdrawMode = 1; // 1 or 2 to withdraw to user's wallet
  const abiCoder = defaultAbiCoder;
  const swapData = abiCoder.encode(
    ["address", "address", "uint8"],
    [tokenIn?.address, address, withdrawMode] // tokenIn, receiver, withdrawMode
  );

  // * STEPS
  const steps = [
    {
      pool: pool.address,
      data: swapData,
      callback: ethers.constants.AddressZero, //don't have callback
      callbackData: "0x",
    },
  ];

  /**
   * If we want to use the native ETH as the input token,
   * the `tokenIn` on path should be replaced with the zero address.
   * NOTE: however we still have to encode the wETH address to pool's swap data.
   */
  const paths = [
    {
      steps,
      tokenIn: constants.AddressZero,
      amountIn,
    },
  ];

  return {
    provider,
    address,
    privateKey,
    tokenIn: tokenIn!,
    tokenOut: tokenOut!,
    pool,
    paths,
    router,
    amountIn,
  };
}
