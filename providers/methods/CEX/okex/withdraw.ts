import { StepState } from "@prisma/client";
import {
  updateStepStateArgs,
  updateStepStateLogs,
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
import { getAccountAddrPriv } from "@providers/execution/utils/base/account";
import { getCoin } from "@providers/execution/utils/base/coin";
import {
  initialiseArgs,
  initialiseLogs,
} from "@providers/execution/utils/base/initialiseInAction";
import { getOrCreateAction } from "@providers/execution/utils/action/getOrCreateAction";
import { getExchange } from "@providers/execution/utils/base/exchange";
import { makeWithdraw } from "./utils/makeWithdraw";
import { getCurrency } from "./utils/getCurrencies";
import { getWithdrawStatus } from "./utils/getWithdrawStatus";
import { EWithdrawStatuses } from "./utils/constants";

interface IProps {
  amount: {
    value: string;
    option: EPriceType;
  };
  token: { value: ECoin };
  chain: { value: EChains };
}
export default async function Withdraw(
  stepState: StepState,
  stepArgs: IProps
) {
  let action = await getOrCreateAction(stepState, EActions.PREPARE_ARGS);
  let args: IParseArgs | undefined;
  let logs: any | undefined;

  console.log("stepArgs", stepArgs);
  switch (action.name) {
    // # # Prepare Args
    case EActions.PREPARE_ARGS:
      args = await prepareArgs(stepState, stepArgs);
      stepState = await updateStepStateArgs(stepState.id, args);
      //   action = await completeActionAndNext(action, EActions.CHECK_ALLOWANCE);
      action = await completeActionAndNext(action, EActions.WITHDRAW);

    // ## ## WITHDRAW
    case EActions.WITHDRAW:
      console.log("\n WITHDRAW OKEX");
      // `Initialise args.
      args = await initialiseArgs(args, stepState);

      const currency = await getCurrency(
        args.exchange,
        stepArgs.token.value,
        stepArgs.chain.value
      );
      // if reach request Limit.
      if (!currency) return;


      const withdraw = await makeWithdraw(
        args.exchange,
        stepArgs.token.value,
        stepArgs.chain.value,
        args.address,
        args.amount,
        currency.minFee,
        currency.wdTickSz, // precision
      );

      // if reach request limit
      if (!withdraw) {
        return
      };


      console.log("withdraw res:",withdraw)
      stepState = await updateStepStateLogs(stepState, {
        [EActions.WITHDRAW]: {
          withdrawId: withdraw.wdId,
          amount: withdraw.amt,
          clientId: withdraw.clientId,
        },
      });

      // `Go to next action.
      action = await completeActionAndNext(action, EActions.WAIT_WITHDRAW);

    // # # WAIT SWAP
    case EActions.WAIT_WITHDRAW:
      // `Initialise values
      args = await initialiseArgs(args, stepState);
      logs = await initialiseLogs(logs, stepState);

      const withdrawId = logs?.[EActions.WITHDRAW]?.withdrawId;
      if(!withdrawId) throw new Error(`Can't find withdrawId in logs`);

      const { status } = await getWithdrawStatus(args.exchange, withdrawId);

      if(status !== EWithdrawStatuses.COMPLETE) {
        return; // Need to wait until complete
      }

      // `Complete StepState
      return completeAction(action);

    default:
      throw `Unknown Action ${action.name}`; // should never come here
  }
}

interface IParseArgs {
  address: string;
  privateKey: string;

  exchange: IExchange;

  token: { address: string; decimals: number };
  amount: string;
}

async function prepareArgs(
  stepState: StepState,
  stepArgs: IProps
): Promise<IParseArgs> {
  const chain = stepArgs.chain.value;
  const sToken = stepArgs.token.value;
  
  // privateKey && address
  const { privateKey, address } = await getAccountAddrPriv(
    stepState.accountExecutionId
  );

  // get ETH address
  const token = await getCoin(sToken, chain);

  // get Okex Exchange
  const exchange = await getExchange(EExchanges.OKEX);

  return {
    address,
    privateKey,

    exchange,
    token: token!,
    amount: stepArgs.amount.value,
  };
}
