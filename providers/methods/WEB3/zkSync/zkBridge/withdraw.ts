import { BigNumberish, constants, ethers, utils } from "ethers";
import { Coin, Provider, StepState } from "@prisma/client";
import {
  saveTxResponseInStepStateLog,
  updateStepStateArgs,
  updateStepStateLogs,
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
  convertEthAmount,
} from "@providers/execution/utils/base/convertAmount";
import {
  initialiseArgs,
  initialiseLogs,
  initialiseProvider,
} from "@providers/execution/utils/base/initialiseInAction";
import { checkBalanceETH } from "@providers/execution/utils/base/checkBalance";
import { getOrCreateAction } from "@providers/execution/utils/action/getOrCreateAction";
import { actionWaitTxReceipt } from "@providers/execution/utils/actions/actionWaitTxReceipt";
import {
  approveERC20,
  getERC20Allowance,
} from "@providers/execution/utils/base/erc20";
import { Provider as ZkProvider, Wallet } from "zksync-web3";
import {
  initialiseZkProvider,
  initialiseZkWallet,
} from "../../../../execution/utils/base/zkSync/initialise";
import { TransactionReceipt } from "zksync-web3/build/src/types";
import { initialiseGasPrice } from "@providers/execution/utils/base/gasPrice";

interface IProps {
  amount: {
    value: string;
    option: EPriceType;
  };
  token: { value: ECoin };
  slippage: { value: number | string };
}

const isETH = (symbol: string) => symbol === ECoin.ETH;

export default function createWithdrawFunction() {
  const finilisedBlock = {
    value: 0,
    ts: 0,
  };

  return async function withdraw(stepState: StepState, stepArgs: IProps) {
    let action = await getOrCreateAction(stepState, EActions.PREPARE_ARGS);
    let providerL1: ethers.providers.JsonRpcProvider | undefined;
    let providerL2: ZkProvider | undefined;
    let wallet: Wallet | undefined;
    let args: IParseArgs | undefined;
    let logs: Record<string, any>;
    let gasPrice: BigNumberish | undefined;
    const sToken = stepArgs.token.value;

    console.log("stepArgs", stepArgs);
    switch (action.name) {
      // # # Prepare Args
      case EActions.PREPARE_ARGS:
        args = await prepareArgs(stepState, stepArgs);
        stepState = await updateStepStateArgs(stepState.id, args);

        if (isETH(sToken)) {
          action = await completeActionAndNext(action, EActions.WITHDRAW);
        } else {
          // TODO
          throw new Error("Withdraw currently sopport only ETH for withdraw");
          action = await completeActionAndNext(
            action,
            EActions.CHECK_ALLOWANCE
          );
        }

      // # # Check Allowance
      case EActions.CHECK_ALLOWANCE:
        if (action.name === EActions.CHECK_ALLOWANCE) {
          console.log("CHECK ALLOWANCE");

          // `Initialise args
          args = await initialiseArgs<IParseArgs>(args, stepState);
          providerL2 = await initialiseZkProvider(
            providerL2,
            args.providerL2.url
          );

          // # Check Allowance
          const allowance = await getERC20Allowance(providerL2, args.token.address, args.address, "TODO"); // prettier-ignore
          if (allowance.lt(args.amount)) {
            action = await completeActionAndNext(
              action,
              EActions.APPROVE_ERC20
            );
          } else
            action = await completeActionAndNext(action, EActions.WITHDRAW);
          console.log("ALLOWANCE", allowance.toString());
        }

      // # # Approve ERC20 Tokens
      case EActions.APPROVE_ERC20:
        if (action.name === EActions.APPROVE_ERC20) {
          console.log("APPROVE_ERC20");

          // `Initialise args
          args = await initialiseArgs<IParseArgs>(args, stepState); // prettier-ignore
          providerL1 = await initialiseProvider(providerL1, args?.providerL1.url!); // prettier-ignore
          providerL2 = await initialiseZkProvider(providerL2, args?.providerL2.url!); // prettier-ignore
          wallet = await initialiseZkWallet(wallet, args?.privateKey!, providerL2!, providerL1!); // prettier-ignore
          gasPrice = await initialiseGasPrice(gasPrice, providerL2, args.providerL2);

          // # Approve erc20 Tokens
          const approveTx = await approveERC20(wallet, args?.token.address!, "TODO"!, args?.amount!, { gasPrice }); // prettier-ignore
          stepState = await saveTxResponseInStepStateLog(stepState, approveTx, EActions.APPROVE_ERC20); // prettier-ignore
          action = await completeActionAndNext(action, EActions.WAIT_APPROVE);
        }

      // # # Wait Approval
      case EActions.WAIT_APPROVE:
        if (action.name === EActions.WAIT_APPROVE) {
          console.log("WAIT APPROVE_ERC20");

          // `Initialise Args
          args = await initialiseArgs(args, stepState);
          providerL2 = await initialiseZkProvider(
            providerL2,
            args.providerL2.url
          );

          const isStepState1 = await actionWaitTxReceipt(stepState, action, providerL2, EActions.APPROVE_ERC20); // prettier-ignore
          if (!isStepState1) return;
          stepState = isStepState1;
          action = await completeActionAndNext(action, EActions.WITHDRAW);
        }

      // # # WITHDRAW
      case EActions.WITHDRAW:
        console.log(`\n WITHDRAW`)
        // `Initialise args.
        args = await initialiseArgs(args, stepState);
        providerL1 = await initialiseProvider(providerL1, args.providerL1.url);
        providerL2 = await initialiseZkProvider(providerL2, args.providerL2.url);
        wallet = await initialiseZkWallet(wallet, args.privateKey, providerL2, providerL1); // prettier-ignore
        gasPrice = await initialiseGasPrice(gasPrice, providerL2, args.providerL2);
        const fee = "448032250000000";

        let withdrawAmount;
        // Check balances
        if (isETH(sToken)) {
          withdrawAmount = await checkBalanceETH(
            providerL2,
            args.address,
            args.amount,
            {
              gasPrice,
              gasLimit: 1_350_000, // im note sure, it's like that. but in l2 consume more gas (10 time more) than in l1 (but also gasPrice 100 time cheaper)
              deductFromAmount: stepArgs.amount.option === EPriceType.Percent,
            }
          );
          withdrawAmount = withdrawAmount.sub(fee);
        } else {
          // TODO
          throw new Error("Withdraw currently sopport only ETH for withdraw");
          // `Check Eth Balance
          // await checkBalanceERC20(providerL2, wallet.address, args.amount, args.token); // prettier-ignore
        }

        console.log("AMMOUNTS", utils.formatEther(withdrawAmount), utils.formatEther(args.amount), utils.formatEther(fee)); // prettier-ignore
        console.log("TOKEN", args.token.address);

        // *** WITHDRAW
        const tx = await wallet.withdraw({
          token: args.token.address,
          amount: withdrawAmount,
          overrides: {
            gasPrice,
          },
        });
        console.log("TX OF WITHDRAW\n", tx);

        // `Save tx in stepState.logs.[SWAP]
        stepState = await saveTxResponseInStepStateLog(
          stepState,
          tx,
          EActions.WITHDRAW
        );
        // `Go to next action.
        action = await completeActionAndNext(action, EActions.WAIT_WITHDRAW);

      // # # WAIT WITHDRAW
      case EActions.WAIT_WITHDRAW:
        console.log(`\n WAIT_WITHDRAW`)
        // `Initialise values
        args = await initialiseArgs<IParseArgs>(args, stepState);
        providerL2 = await initialiseZkProvider(providerL2, args.providerL2.url);

        const _stepState = await actionWaitTxReceipt(
          stepState,
          action,
          providerL2,
          EActions.WITHDRAW,
          {
            parseReceipt: async ({ receipt, updateStepNameLog }) => {
              const _receipt = receipt as TransactionReceipt;
              // console.log("\nparseReceipt:", _receipt)
              updateStepNameLog({ l1BatchNumber: _receipt.l1BatchNumber });
            },
          }
        );
        if (!_stepState) return;
        stepState = _stepState;

        // `Complete StepState
        action = await completeActionAndNext(action, EActions.FINILISE);

      // # # FINILISE
      case EActions.FINILISE:
        console.log(`\n FINILISE`)
        
        args = await initialiseArgs(args, stepState);
        logs = await initialiseLogs<Record<string, any>>(undefined, stepState);
        providerL1 = await initialiseProvider(providerL1, args.providerL1.url);
        providerL2 = await initialiseZkProvider(providerL2, args.providerL2.url);
        wallet = await initialiseZkWallet(wallet, args.privateKey, providerL2, providerL1); // prettier-ignore

        const hash = logs?.[EActions.WITHDRAW]?.hash;
        if(!hash) throw new Error("Can't find hash in withdraw logs");
        const blockNumber = logs?.[EActions.WITHDRAW]?.blockNumber;
        if(!blockNumber) throw new Error("Can't find blockNumber in withdraw logs");
        // Find it Here: https://etherscan.io/address/0xb2097dbe4410b538a45574b1fcd767e2303c7867#code
        // function proveL1ToL2TransactionStatus(...)

        // Optimise Code, to not fetch this value every time. (only every 5 minutes for all accounts).
        // But this is working only one exectuion. During next execution, this variable would be cleared.
        const min5 = 5 * 60 * 1000;
        if (finilisedBlock.ts <= Date.now() - min5) {
          const _finilisedBlock = await providerL2.getBlock("finalized");

          finilisedBlock.value = _finilisedBlock.number;
          finilisedBlock.ts = Date.now();
        }
        console.log("finilisedBlock", finilisedBlock.value, "<", blockNumber , ":", finilisedBlock.value > blockNumber);
        
        if (finilisedBlock.value < blockNumber) {
          return; // Withdraw is not ready
        }

        // todo, check this. Maybe it return if withdraw is finilised in l1 (tx is executed in l1).
        // todo - speed it up (too slow)
        const isWithdrawalFinalized = await wallet.isWithdrawalFinalized(hash); // prettier-ignore
        console.log("isWithdrawalFinalized", isWithdrawalFinalized);
        // "If tx is not ready to execute, wait more.
        if (isWithdrawalFinalized) {
          // FINISH
          return completeAction(action);
        }

        return;
        // ? Do i need to finilise TX?
        // const finiliseTx = await wallet.finalizeWithdrawal(hash, 0, {
        //   gasPrice: await providerL1.getGasPrice(),
        // });

        // // `Save tx in stepState.logs.[SWAP]
        // stepState = await saveTxResponseInStepStateLog(
        //   stepState,
        //   finiliseTx,
        //   EActions.FINILISE
        // );
        // action = await completeActionAndNext(action, EActions.WAIT_FINILISE);

      // # # WAIT FINILISE
      case EActions.WAIT_FINILISE:
        // `Initialise values
        // args = await initialiseArgs<IParseArgs>(args, stepState);
        // providerL1 = await initialiseProvider(providerL1, args.providerUrlL1);

        // stepState = await actionWaitTxReceipt(stepState, action, providerL1, EActions.FINILISE) as any; // prettier-ignore
        // if (!stepState) return;

        // // `Complete StepState
        // return await completeAction(action);
      default:
        throw `Unknown Action ${action.name}`; // should never come here
    }
  };
}

interface IParseArgs {
  providerL1: Provider;
  providerL2: Provider;

  address: string;
  privateKey: string;

  token: { address: string; decimals: number };
  amount: string;
}

async function prepareArgs(
  stepState: StepState,
  stepArgs: IProps
): Promise<IParseArgs> {
  const chainL2 = EChains.ZKSYNC;
  const chainL1 = EChains.ETH;
  const sToken = stepArgs.token.value;

  // provider
  // const providerUrlL1 = await getProviderUrl(chainL1);
  // const providerUrlL2 = await getProviderUrl(chainL2);
  const providerL1 = await getProvider(chainL1);
  const providerL2 = await getProvider(chainL2);

  // privateKey && address
  const { privateKey, address } = await getAccountAddrPriv(
    stepState.accountExecutionId
  );

  // get WETH address
  let token = await getCoin(sToken, chainL2);

  let amount: string;
  if (sToken === ECoin.ETH) {
    amount = await convertEthAmount(
      stepArgs.amount.value,
      stepArgs.amount.option,
      {
        providerUrl: providerL2.url,
        owner: address,
      }
    );
  } else {
    amount = await convertERC20Amount(
      stepArgs.amount.value,
      stepArgs.amount.option,
      {
        providerUrl: providerL2.url,
        owner: address,
        erc20Address: token?.address!,
        decimals: token?.decimals!,
      }
    );
  }

  // convert amount depends on 'eth', 'wei' or '%'.

  return {
    providerL1,
    providerL2,

    address,
    privateKey,

    token: token!,
    amount,
  };
}
