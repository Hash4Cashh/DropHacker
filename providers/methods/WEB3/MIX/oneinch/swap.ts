import {
  BigNumber,
  BigNumberish,
  Wallet,
  providers,
} from "ethers";
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
import {
  completeAction,
  completeActionAndNext,
} from "@providers/execution/utils/action/completeAction";
import { getProvider, getProviderUrl } from "@providers/execution/utils/base/provider";
import { getAccountAddrPriv } from "@providers/execution/utils/base/account";
import { getCoin } from "@providers/execution/utils/base/coin";
import { getContractAddress } from "@providers/execution/utils/base/contract";
import {
  convertERC20Amount,
  convertEthAmount,
} from "@providers/execution/utils/base/convertAmount";
import {
  approveERC20,
  getERC20Allowance,
} from "@providers/execution/utils/base/erc20";
import {
  initialiseArgs,
  initialiseProvider,
  initialiseWallet,
} from "@providers/execution/utils/base/initialiseInAction";
import {
  checkBalanceERC20,
  checkBalanceETH,
} from "@providers/execution/utils/base/checkBalance";
import { getOrCreateAction } from "@providers/execution/utils/action/getOrCreateAction";
import { actionWaitTxReceipt } from "@providers/execution/utils/actions/actionWaitTxReceipt";
import { initialiseGasPrice } from "@providers/execution/utils/base/gasPrice";
import { ethAddress, getOneInchSwapData, isETH } from "./utils";

interface IProps {
  amountIn: {
    value: string;
    option: EPriceType;
  };
  tokenIn: { value: ECoin };
  tokenOut: { value: ECoin };
  slippage: { value: number | string };
}

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
        action = await completeActionAndNext(action, EActions.CHECK_ALLOWANCE);

      // # # Check Allowance
      case EActions.CHECK_ALLOWANCE:
        args = await initialiseArgs(args, stepState);

        if (!isETH(args?.tokenIn.symbol!)) {
          // `Initialise args
          args = await initialiseArgs<IParseArgs>(args, stepState);
          provider = await initialiseProvider(provider, args.provider.url);

          // # Check Allowance
          const allowance = await getERC20Allowance(provider, args.tokenIn.address, args.address, args.routerAddr); // prettier-ignore
          if (allowance.lt(args.amountIn)) {
            action = await completeActionAndNext(
              action,
              EActions.APPROVE_ERC20
            );
          } else action = await completeActionAndNext(action, EActions.SWAP);
          console.log("ALLOWANCE", allowance.toString());
        } else {
          action = await completeActionAndNext(action, EActions.SWAP);
        }

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
          const approveTx = await approveERC20(wallet, args?.tokenIn.address!, args?.routerAddr!, args?.amountIn!, { gasPrice }); // prettier-ignore
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

          const isStepState1 = await actionWaitTxReceipt(stepState, action, provider, EActions.APPROVE_ERC20); // prettier-ignore
          if (!isStepState1) return;
          stepState = isStepState1;
          action = await completeActionAndNext(action, EActions.SWAP);
        }

      // ## ## SWAP
      case EActions.SWAP:
        // `Initialise
        args = await initialiseArgs<IParseArgs>(args, stepState);
        provider = await initialiseProvider(provider, args.provider.url);
        wallet = await initialiseWallet(wallet, provider, args.privateKey);
        gasPrice = await initialiseGasPrice(gasPrice, provider, args.provider);

        const fromTokenAddress = isETH(args.tokenIn.symbol)
          ? ethAddress
          : args.tokenIn.address;
        const toTokenAddress = isETH(args.tokenOut.symbol)
          ? ethAddress
          : args.tokenOut.address;

        let data = await getOneInchSwapData({
          fromTokenAddress,
          toTokenAddress,
          fromAddress: wallet.address,
          amount: args.amountIn,
          slippage: stepArgs.slippage.value,
          chainId: args.chainId,
        });

        let amountIn: BigNumber = BigNumber.from("0");

        // `Check amountIn Balance. If ETH - may change amountIn and get updated tx.data
        if (isETH(args.tokenIn.symbol)) {
          amountIn = await checkBalanceETH(
            provider,
            wallet.address,
            args.amountIn,
            {
              gasPrice,
              gasLimit: data.tx.gas,
              deductFromAmount: stepArgs.amountIn.option === EPriceType.Percent,
            }
          );
          if (!amountIn.eq(args.amountIn)) {
            console.log("Update oneInch tx data...");
            // "If amountIn was changed, make request to update data.
            data = await getOneInchSwapData({
              fromTokenAddress,
              toTokenAddress,
              fromAddress: wallet.address,
              amount: amountIn.toString(), // update data with this value
              slippage: stepArgs.slippage.value,
              chainId: args.chainId,
            });
          }
        } else {
          // `Check Eth Balance
          await checkBalanceERC20(
            provider,
            args.address,
            args.amountIn,
            args.tokenIn
          );
        }

        const resultTx = data.tx;

        const nonce = await provider.getTransactionCount(wallet.address);
        const tx = {
          to: resultTx.to,
          data: resultTx.data,
          gasPrice: BigNumber.from(resultTx.gasPrice),
          gasLimit: BigNumber.from(resultTx.gas),
          chainId: args.chainId,
          nonce,
        };

        if (isETH(args.tokenIn.symbol)) Object.assign(tx, { value: amountIn });

        const signedTx = await wallet.signTransaction(tx);

        const response = await provider.sendTransaction(signedTx);

        // `Save tx in stepState.logs.[SWAP]
        stepState = await saveTxResponseInStepStateLog(stepState, response, EActions.SWAP); // prettier-ignore

        // `Go to the nextStep
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
  };

  async function prepareArgs(
    stepState: StepState,
    stepArgs: IProps
  ): Promise<IParseArgs> {
    // const chain = EChains.ZKSYNC;
    // provider
    // const providerUrl = await getProviderUrl(chain);
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
    const routerAddr = await getContractAddress(
      chain,
      EProtocols.ONEINCH,
      EProtocolNames.ROUTER
    );

    // if()
    // convert AmountIn depends on 'eth', 'wei' or '%'.
    let amountIn;
    if (isETH(tokenIn?.symbol!)) {
      amountIn = await convertEthAmount(
        stepArgs.amountIn.value,
        stepArgs.amountIn.option,
        { providerUrl: provider.url, owner: address }
      );
    } else {
      amountIn = await convertERC20Amount(
        stepArgs.amountIn.value,
        stepArgs.amountIn.option,
        {
          providerUrl: provider.url,
          owner: address,
          decimals: tokenIn!.decimals,
          erc20Address: tokenIn!.address,
        }
      );
    }

    const _provider = await initialiseProvider(undefined, provider.url);
    const network = await _provider.getNetwork();
    const chainId = network.chainId;

    return {
      provider,
      address,
      privateKey,
      tokenIn: tokenIn!,
      tokenOut: tokenOut!,
      routerAddr,
      amountIn,
      chainId,
    };
  }
}

interface IParseArgs {
  provider: Provider;
  address: string;
  privateKey: string;
  chainId: number;
  tokenIn: Coin;
  tokenOut: Coin;
  routerAddr: string;
  amountIn: string;
}
