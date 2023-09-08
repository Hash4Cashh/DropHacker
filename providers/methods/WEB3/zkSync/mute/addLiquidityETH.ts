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
import RouterABI from "@abi/Mute/MuteRouter.json";
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
import { checkBalanceERC20, checkBalanceETH } from "@providers/execution/utils/base/checkBalance";
import { getOrCreateAction } from "@providers/execution/utils/action/getOrCreateAction";
import { actionWaitTxReceipt } from "@providers/execution/utils/actions/actionWaitTxReceipt";
import { initialiseGasPrice } from "@providers/execution/utils/base/gasPrice";

interface IProps {
  amountOfToken: {
    value: string;
    option: EPriceType;
  };
  token: { value: ECoin };
  slippage: { value: number | string };
}

export default async function addLiquidityETH(
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
      action = await completeActionAndNext(action, EActions.CHECK_ALLOWANCE);

    // # # Check Allowance
    case EActions.CHECK_ALLOWANCE:
      // `Initialise args
      args = await initialiseArgs<IParseArgs>(args, stepState);
      provider = await initialiseProvider(provider, args.provider.url);

      // # Check Allowance
      const allowance = await getERC20Allowance(provider, args.token.address, args.address, args.router); // prettier-ignore
      if (allowance.lt(args.amountToken)) {
        action = await completeActionAndNext(action, EActions.APPROVE_ERC20);
      } else
        action = await completeActionAndNext(
          action,
          EActions.ADD_LIQUIDITY
        );
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
        const approveTx = await approveERC20(wallet, args?.token.address!, args?.router!, args?.amountToken!, { gasPrice }); // prettier-ignore
        stepState = await saveTxResponseInStepStateLog(stepState, approveTx, EActions.APPROVE_ERC20); // prettier-ignore
        action = await completeActionAndNext(action, EActions.WAIT_APPROVE);
      }

    // # # Wait Approval
    case EActions.WAIT_APPROVE:
      if (action.name === EActions.WAIT_APPROVE) {
        console.log("WAIT APPROVE_ERC20");

        // `Initialise Args
        args = await initialiseArgs(args, stepState);
        provider = await initialiseProvider(provider, args.provider.url);

        // # Wait Receipt to be completed, or throw error if transaction was reverded.
        const isStepState1 = await actionWaitTxReceipt(stepState, action, provider, EActions.APPROVE_ERC20); // prettier-ignore
        if (!isStepState1) return;
        stepState = isStepState1;
        action = await completeActionAndNext(
          action,
          EActions.ADD_LIQUIDITY
        );
      }

    // ## ## ADD_LIQUIDITY
    case EActions.ADD_LIQUIDITY:
      // `Initialise
      args = await initialiseArgs<IParseArgs>(args, stepState);
      provider = await initialiseProvider(provider, args.provider.url);
      wallet = await initialiseWallet(wallet, provider, args.privateKey);
      gasPrice = await initialiseGasPrice(gasPrice, provider, args.provider);

      // `Initialise contract
      const routerInstance = new Contract(args.router, RouterABI, wallet);

      // `Check Eth Balance
      await checkBalanceERC20(
        provider,
        args.address,
        args.amountToken,
        args.token
      );

      // `Calculate minAmountOut.
      const amountETH = await getMinAmountOut(
        routerInstance,
        args.amountToken,
        [args.token, args.tokenETH],
        0,
        false
      );
      const minAmountETH = amountETH.div(4); // 25% of the ETH amount
      const minAmountToken = BigNumber.from(args.amountToken).div(4); // 25% of the ETH amount

      await checkBalanceETH(provider, args.address, amountETH);

      // ` calculate Deadline
      const timestamp = Math.floor(Date.now() / 1000);
      const deadline = ethers.BigNumber.from(timestamp).add(1800); // deadline - 30 minutes

      console.log("ARGS FOR SWAP:", [args.amountToken ,amountETH], [args.token.address, args.tokenETH.address], wallet.address, deadline, [false], { value: amountETH }); // prettier-ignore

      // *** ADD LIQUIDITY
      const tx = await routerInstance.addLiquidityETH(
        args.token.address, // Token address
        args.amountToken, // amountTokenDesired
        minAmountToken, // amountTokenMin
        minAmountETH, // amountETHMin
        wallet.address, // to
        deadline, // deadline
        1, // fee type
        false, // bool stable
        {
          gasPrice,
          value: amountETH
        }
      );

      // `Save tx in stepState.logs.[SWAP]
      stepState = await saveTxResponseInStepStateLog(stepState, tx, EActions.ADD_LIQUIDITY); // prettier-ignore
      // `Go to the nextStep
      action = await completeActionAndNext(action, EActions.WAIT_ADD_LIQUIDITY);

    // # # WAIT_ADD_LIQUIDITY
    case EActions.WAIT_ADD_LIQUIDITY:
      // `Initialise values
      args = await initialiseArgs<IParseArgs>(args, stepState);
      provider = await initialiseProvider(provider, args.provider.url);

      const isStepState2 = await actionWaitTxReceipt(stepState, action, provider, EActions.ADD_LIQUIDITY); // prettier-ignore
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
  tokenETH: { address: string; decimals: number };
  token: { address: string; decimals: number };
  router: string;
  // amountETH?: string;
  amountToken: string;
}

async function prepareArgs(
  stepState: StepState,
  stepArgs: IProps
): Promise<IParseArgs> {
  const chain = EChains.ZKSYNC;
  // provider
  // const providerUrl = await getProviderUrl(chain);
  const provider = await getProvider(chain);
  // privateKey && address
  const { privateKey, address } = await getAccountAddrPriv(
    stepState.accountExecutionId
  );
  // get TokenIn address
  const token = await getCoin(stepArgs.token.value, chain);
  // get TokenIn address
  const tokenETH = await getCoin(ECoin.WETH, chain);

  // routerAddress
  const router = await getContractAddress(
    chain,
    EProtocols.MUTE,
    EProtocolNames.ROUTER
  );

  // convert AmountIn depends on 'eth', 'wei' or '%'.
  const amountToken = await convertERC20Amount(
    stepArgs.amountOfToken.value,
    stepArgs.amountOfToken.option,
    {
      providerUrl: provider.url,
      owner: address,
      decimals: token!.decimals,
      erc20Address: token!.address,
    }
  );

  return {
    provider,
    address,
    privateKey,
    token: token!,
    tokenETH: tokenETH!,
    // tokenOut,
    router,
    amountToken,
    // amountETH,
  };
}
