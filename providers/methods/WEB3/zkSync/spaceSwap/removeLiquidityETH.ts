import { BigNumberish, Contract, Wallet, ethers, providers } from "ethers";
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
import RouterABI from "@abi/UniV2/UniswapV2Router02.json";
import {
  completeAction,
  completeActionAndNext,
} from "@providers/execution/utils/action/completeAction";
import { getProvider, getProviderUrl } from "@providers/execution/utils/base/provider";
import { getAccountAddrPriv } from "@providers/execution/utils/base/account";
import { createLpCoin, getCoin, getLPCoin } from "@providers/execution/utils/base/coin";
import { getContractAddress } from "@providers/execution/utils/base/contract";
import { convertERC20Amount } from "@providers/execution/utils/base/convertAmount";
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
import { getPair } from "./utils/pair";
import { initialiseGasPrice } from "@providers/execution/utils/base/gasPrice";

interface IProps {
  amountOfPoolToken: {
    value: string;
    option: EPriceType;
  };
  token: { value: ECoin };
  slippage: { value: number | string };
}

export default async function removeLiquidityETH(
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
      const allowance = await getERC20Allowance(provider, args.lpToken.address, args.address, args.routerAddr); // prettier-ignore
      if (allowance.lt(args.amountOfPoolToken)) {
        action = await completeActionAndNext(action, EActions.APPROVE_ERC20); // 'APPROVE ERC20
      } else
        action = await completeActionAndNext(action, EActions.REMOVE_LIQUIDITY); // 'NEXT STEP
      console.log("ALLOWANCE", allowance.toString());

    // # # Approve ERC20 Tokens
    case EActions.APPROVE_ERC20:
      if (action.name === EActions.APPROVE_ERC20) {
        console.log("APPROVE_ERC20");

        // `Initialise args
        args = await initialiseArgs(args, stepState);
        provider = await initialiseProvider(provider, args?.provider.url);
        wallet = await initialiseWallet(wallet, provider, args?.privateKey);
        gasPrice = await initialiseGasPrice(gasPrice, provider, args.provider);

        // # Approve erc20 Tokens
        const approveTx = await approveERC20(wallet, args?.lpToken.address, args?.routerAddr, args?.amountOfPoolToken, { gasPrice }); // prettier-ignore
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

        // # Wait Receipt to be completed, or throw error if transaction was reverded.
        const isStepState1 = await actionWaitTxReceipt(stepState, action, provider, EActions.APPROVE_ERC20); // prettier-ignore
        if (!isStepState1) return;
        stepState = isStepState1;
        action = await completeActionAndNext(
          action,
          EActions.REMOVE_LIQUIDITY
        );
      }

    // ## ## REMOVE_LIQUIDITY
    case EActions.REMOVE_LIQUIDITY:
      // `Initialise
      args = await initialiseArgs<IParseArgs>(args, stepState);
      provider = await initialiseProvider(provider, args.provider.url);
      wallet = await initialiseWallet(wallet, provider, args.privateKey);
      gasPrice = await initialiseGasPrice(gasPrice, provider, args.provider);

      // `Initialise contract
      const routerInstance = new Contract(args.routerAddr, RouterABI, wallet);

      // `Check Eth Balance
      await checkBalanceERC20(
        provider,
        args.address,
        args.amountOfPoolToken,
        args.lpToken
      );


      // ` calculate Deadline
      const timestamp = Math.floor(Date.now() / 1000);
      const deadline = ethers.BigNumber.from(timestamp).add(1800); // deadline - 30 minutes

      console.log("ARGS FOR SWAP:", [args.amountOfPoolToken], [args.token.address], wallet.address, deadline, false); // prettier-ignore
        
      // *** ADD LIQUIDITY
      const tx = await routerInstance.removeLiquidityETH(
        args.token.address, // address token,
        args.amountOfPoolToken, // uint liquidity,
        1000, // uint amountTokenMin,
        1000, // uint amountETHMin,
        wallet.address, // address to,
        deadline, // uint deadline,
        {
          gasPrice,
        }
      );

      // `Save tx in stepState.logs.[SWAP]
      stepState = await saveTxResponseInStepStateLog(stepState, tx, EActions.REMOVE_LIQUIDITY); // prettier-ignore
      // `Go to the nextStep
      action = await completeActionAndNext(action, EActions.WAIT_REMOVE_LIQUIDITY);

    // # # WAIT REMOVE_LIQUIDITY
    case EActions.WAIT_REMOVE_LIQUIDITY:
      // `Initialise values
      args = await initialiseArgs<IParseArgs>(args, stepState);
      provider = await initialiseProvider(provider, args.provider.url);

      const isStepState2 = await actionWaitTxReceipt(stepState, action, provider, EActions.REMOVE_LIQUIDITY); // prettier-ignore
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
  token: { address: string; decimals: number };
  lpToken: { address: string; decimals: number };
  routerAddr: string;
  factoryAddr: string;
  // amountETH?: string;
  amountOfPoolToken: string;
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

  // routerAddress
  const routerAddr = await getContractAddress(
    chain,
    EProtocols.SPACE_SWAP,
    EProtocolNames.ROUTER
  );

  const factoryAddr = await getContractAddress(
    chain,
    EProtocols.SPACE_SWAP,
    EProtocolNames.POOL_FACTORY
  );

  // get TokenIn address
  const token = await getCoin(stepArgs.token.value, chain);
  // get TokenIn address
  const tokenETH = await getCoin(ECoin.WETH, chain);
  console.log("ECoin.WETH, stepArgs.token.value", ECoin.WETH, stepArgs.token.value);


  // `get lpToken address
  let lpToken: Coin | null;
  lpToken = await getLPCoin(ECoin.WETH, stepArgs.token.value, chain, EProtocols.SPACE_SWAP); // prettier-ignore
  console.log("lpToken", lpToken);
  // "If lpToken was not Found, need to create lPToken.
  if(!lpToken) {
    const _provider = await initialiseProvider(undefined, provider.url);
    
    const lpAddress = await getPair(tokenETH?.address!, token?.address!, factoryAddr, _provider); // prettier-ignore
    console.log("LP ADDRESS :::\n", lpAddress)
    if(!lpAddress) throw new Error(`Was not able to find poolAddress for ${ECoin.WETH} - ${stepArgs.token.value}`); // prettier-ignore
    lpToken = await createLpCoin(lpAddress, ECoin.WETH, stepArgs.token.value, chain, EProtocols.SPACE_SWAP, _provider); // prettier-ignore
  }

  // convert AmountIn depends on 'eth', 'wei' or '%'.
  const amountOfPoolToken = await convertERC20Amount(
    stepArgs.amountOfPoolToken.value,
    stepArgs.amountOfPoolToken.option,
    {
      providerUrl: provider.url,
      owner: address,
      decimals: lpToken.decimals,
      erc20Address: lpToken.address,
    }
  );

  return {
    provider,
    address,
    privateKey,
    routerAddr,
    factoryAddr,

    token: token!,
    lpToken,
    amountOfPoolToken,
  };
}
