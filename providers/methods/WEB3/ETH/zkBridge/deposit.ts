import { BigNumber, BigNumberish, constants, ethers } from "ethers";
import { Coin, Provider, StepState } from "@prisma/client";
import { saveTxResponseInStepStateLog, updateStepStateArgs } from "@providers/execution/utils/stepState/update"; // prettier-ignore
import { EActions, EChains, ECoin, EPriceType } from "@types";
import { completeAction, completeActionAndNext } from "@providers/execution/utils/action/completeAction"; // prettier-ignore
import { getProvider, getProviderUrl } from "@providers/execution/utils/base/provider";
import { getAccountAddrPriv } from "@providers/execution/utils/base/account";
import { getCoin } from "@providers/execution/utils/base/coin";
import { convertERC20Amount, convertEthAmount } from "@providers/execution/utils/base/convertAmount"; // prettier-ignore
import { initialiseArgs, initialiseLogs, initialiseProvider } from "@providers/execution/utils/base/initialiseInAction"; // prettier-ignore
import { checkBalanceETH } from "@providers/execution/utils/base/checkBalance";
import { getOrCreateAction } from "@providers/execution/utils/action/getOrCreateAction";
import { actionWaitTxReceipt } from "@providers/execution/utils/actions/actionWaitTxReceipt";
import { approveERC20, getERC20Allowance } from "@providers/execution/utils/base/erc20"; // prettier-ignore
import { Provider as ZkProvider, Wallet, utils } from "zksync-web3";
import { getStepStateLogs } from "@providers/execution/utils/stepState/get";
import {
  initialiseZkProvider,
  initialiseZkWallet,
} from "@providers/execution/utils/base/zkSync/initialise";
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
export default async function Deposit(stepState: StepState, stepArgs: IProps) {
  let action = await getOrCreateAction(stepState, EActions.PREPARE_ARGS);
  let providerL1: ethers.providers.JsonRpcProvider | undefined;
  let providerL2: ZkProvider | undefined;
  let wallet: Wallet | undefined;
  let args: IParseArgs | undefined;
  let logs: Record<string, any> | undefined;
  let gasPrice: BigNumberish | undefined;
  const sToken = stepArgs.token.value;

  switch (action.name) {
    // # # Prepare Args
    case EActions.PREPARE_ARGS:
      console.log("\nPREPARE ARGS, DEPOSIT\n");
      args = await prepareArgs(stepState, stepArgs);
      stepState = await updateStepStateArgs(stepState.id, args);

      if (isETH(sToken)) {
        action = await completeActionAndNext(action, EActions.DEPOSIT);
      } else {
        // TODO
        throw new Error("Deposit currently sopport only ETH for Deposit");
        action = await completeActionAndNext(action, EActions.CHECK_ALLOWANCE);
      }

    // # # Check Allowance // NOT SUPPORTED YET
    case EActions.CHECK_ALLOWANCE:
      if (action.name === EActions.CHECK_ALLOWANCE) {
        console.log("CHECK ALLOWANCE");

        // `Initialise args
        args = await initialiseArgs<IParseArgs>(args, stepState);
        providerL1 = await initialiseProvider(providerL1, args.providerL1.url);

        // # Check Allowance
        const allowance = await getERC20Allowance(providerL1, args.token.address, args.address, "TODO"); // prettier-ignore
        if (allowance.lt(args.amount)) {
          action = await completeActionAndNext(action, EActions.APPROVE_ERC20);
        } else action = await completeActionAndNext(action, EActions.DEPOSIT);
        console.log("ALLOWANCE", allowance.toString());
      }

    // # # Approve ERC20 Tokens // NOT SUPPORTED YET
    case EActions.APPROVE_ERC20:
      if (action.name === EActions.APPROVE_ERC20) {
        console.log("APPROVE_ERC20");

        // `Initialise args
        args = await initialiseArgs<IParseArgs>(args, stepState);
        providerL1 = await initialiseProvider(providerL1, args?.providerL1.url!);
        providerL2 = await initialiseZkProvider(providerL2, args?.providerL2.url!); // prettier-ignore
        wallet = await initialiseZkWallet(wallet, args?.privateKey!, providerL2!, providerL1!); // prettier-ignore
        gasPrice = await initialiseGasPrice(gasPrice, providerL1, args.providerL1);

        // # Approve erc20 Tokens
        const approveTx = await approveERC20(wallet, args?.token.address!, "TODO"!, args?.amount!, { gasPrice }); // prettier-ignore
        stepState = await saveTxResponseInStepStateLog(stepState, approveTx, EActions.APPROVE_ERC20); // prettier-ignore
        action = await completeActionAndNext(action, EActions.WAIT_APPROVE);
      }

    // # # Wait Approval // NOT SUPPORTED YET
    case EActions.WAIT_APPROVE:
      if (action.name === EActions.WAIT_APPROVE) {
        console.log("WAIT APPROVE_ERC20");

        // `Initialise Args
        args = await initialiseArgs(args, stepState);
        providerL1 = await initialiseProvider(providerL1, args?.providerL1.url!);

        const isStepState1 = await actionWaitTxReceipt(stepState, action, providerL1, EActions.APPROVE_ERC20); // prettier-ignore
        if (!isStepState1) return;
        stepState = isStepState1;
        action = await completeActionAndNext(action, EActions.DEPOSIT);
      }

    // # # Deposit
    case EActions.DEPOSIT:
      console.log("\nDEPOSITING\n");
      // `Initialise args.
      args = await initialiseArgs(args, stepState);
      providerL1 = await initialiseProvider(providerL1, args.providerL1.url);
      providerL2 = await initialiseZkProvider(providerL2, args.providerL2.url);
      wallet = await initialiseZkWallet(wallet, args.privateKey, providerL2, providerL1); // prettier-ignore
      gasPrice = await initialiseGasPrice(gasPrice, providerL1, args.providerL1);

      let depositToken: string;
      if (isETH(sToken)) {
        depositToken = constants.AddressZero;
      } else {
        depositToken = args.token.address;
      }

      let amount;
      // ``Check balances
      if (isETH(sToken)) {
        amount = await checkBalanceETH(providerL1, args.address, args.amount, {
          gasLimit: 160000, // todo dinamically check gasLimit
          gasPrice,
          deductFromAmount: stepArgs.amount.option === EPriceType.Percent, // if amountType is percent, deduct gas from amount, otherwise from ethBalance
        });
        console.log("DEPOSIT AMOUNT", ethers.utils.formatEther(amount), ethers.utils.formatEther(args.amount)); // prettier-ignore
      } else {
        // TODO
        throw new Error("Deposit currently sopport only ETH for Deposit");
        // `Check ERC20 Balance
        // await checkBalanceERC20(providerL1, wallet.address, args.amount, args.token); // prettier-ignore
      }

      //_* Make DEPOSIT
      const tx = await wallet.deposit({
        token: depositToken,
        amount,
        overrides: {
          gasPrice,
        },
      });
      console.log("TX OF Deposit\n", tx);

      // `Save tx in stepState.logs.[SWAP]
      stepState = await saveTxResponseInStepStateLog(
        stepState,
        tx,
        EActions.DEPOSIT
      );
      // `Go to next action.
      action = await completeActionAndNext(action, EActions.WAIT_DEPOSIT);

    // # # WAIT DEPOSIT
    case EActions.WAIT_DEPOSIT:
      console.log("\nWAIT DEPOSITING");
      // `Initialise values
      args = await initialiseArgs<IParseArgs>(args, stepState);
      logs = await initialiseLogs(undefined, stepState);
      providerL1 = await initialiseProvider(providerL1, args.providerL1.url);
      providerL2 = await initialiseZkProvider(providerL2, args.providerL2.url);
      wallet = await initialiseZkWallet(
        wallet,
        args.privateKey,
        providerL2,
        providerL1
      );

      const mainContract = await wallet.getMainContract();

      // `Wait Receipt, and after save l2Hash from receipt.logs to stepState.logs
      const _stepState2 = await actionWaitTxReceipt(
        stepState,
        action,
        providerL1,
        EActions.DEPOSIT,
        {
          parseLog: async ({ log, updateStepNameLog }) => {
            if (
              log.address.toLowerCase() != mainContract.address.toLowerCase()
            ) {
              return;
            }
            try {
              const priorityQueueLog = utils.ZKSYNC_MAIN_ABI.parseLog(log);
              if (priorityQueueLog && priorityQueueLog.args.txHash != null) {
                const txHash = priorityQueueLog.args.txHash;
                console.log("L2 HASH::", txHash);
                updateStepNameLog({ l2Hash: txHash });
              }
            } catch {}
          },
        }
      );
      if (!_stepState2) return;
      stepState = _stepState2;

      // `Complete StepState
      action = await completeActionAndNext(action, EActions.FINILISE);

    // # # FINILISE
    case EActions.FINILISE:
      console.log("\nFinilise");
      args = await initialiseArgs(args, stepState);
      logs = await getStepStateLogs(stepState);

      providerL2 = await initialiseZkProvider(providerL2, args.providerL2.url);

      const l2Hash = logs?.[EActions.DEPOSIT]?.l2Hash;
      if (!l2Hash) throw new Error("Can't Find l2Hash in StepState logs");

      enum TransactionStatus {
        NotFound = "not-found",
        Processing = "processing",
        Committed = "committed",
        Finalized = "finalized",
      }
      const status = await providerL2.getTransactionStatus(l2Hash);
      if (status === TransactionStatus.NotFound) {
        console.log(
          `\n\tL2 TX still not in Blockchain. StepState: ${stepState.id}\n`
        );
        return; // Tx still not included in blockchain.
      }

      const finiliseTx = await providerL2.getTransaction(l2Hash);

      // `Save tx in stepState.logs.[SWAP]
      stepState = await saveTxResponseInStepStateLog(
        stepState,
        finiliseTx,
        EActions.FINILISE
      );

      action = await completeActionAndNext(action, EActions.WAIT_FINILISE);

    // # # WAIT FINILISE
    case EActions.WAIT_FINILISE:
      console.log("\nWAIT Finilise");
      // `Initialise values
      args = await initialiseArgs<IParseArgs>(args, stepState);
      providerL2 = await initialiseZkProvider(providerL2, args.providerL2.url);

      // todo: Wrap with try{}catch{}. It will fail if transaction would revert.
      //    `In this case, need to call 'wallet.claimFailedDeposit(logs?.[EActions.DEPOSIT]?.hash)'
      const _stepState3 = await actionWaitTxReceipt(stepState, action, providerL2, EActions.FINILISE); // prettier-ignore
      if (!_stepState3) return; // still not finished.
      stepState = _stepState3;

      // `Complete StepState
      return await completeAction(action);
    default:
      throw `Unknown Action ${action.name}`; // should never come here
  }
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
  console.log("stepArgs", stepArgs);

  const chainL2 = EChains.ZKSYNC;
  const chainL1 = EChains.ETH;
  const sToken = stepArgs.token.value;

  // provider
  const providerL1 = await getProvider(chainL1);
  const providerL2 = await getProvider(chainL2);

  // privateKey && address
  const { privateKey, address } = await getAccountAddrPriv(
    stepState.accountExecutionId
  );

  // get WETH address
  let token: Coin | null;
  if (sToken === ECoin.ETH) {
    token = await getCoin(ECoin.WETH, chainL1);
  } else {
    token = await getCoin(sToken, chainL1);
  }

  let amount: string;
  if (sToken === ECoin.ETH) {
    console.log("CONVERTING ETH AMOUNT");
    amount = await convertEthAmount(
      stepArgs.amount.value,
      stepArgs.amount.option,
      {
        providerUrl: providerL1.url,
        owner: address,
      }
    );
  } else {
    console.log("CONVERTING ERC20 AMOUNT");
    amount = await convertERC20Amount(
      stepArgs.amount.value,
      stepArgs.amount.option,
      {
        providerUrl: providerL1.url,
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
