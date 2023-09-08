import { StepActionState, StepState } from "@prisma/client";
import { EMethods, EStatuses, ETimeType } from "@types";
import { randomIntFromInterval } from "@utils/random";
import { updateStepStateArgs } from "../../execution/utils/stepState/update";
import {
  completeAction,
  completeActionAndNext,
} from "@providers/execution/utils/action/completeAction";
import { getStepStateArgs } from "@providers/execution/utils/stepState/get";
import { getOrCreateAction } from "@providers/execution/utils/action/getOrCreateAction";

async function delay(stepState: StepState, stepArgs: IArgs) {
  const action = await getOrCreateAction(stepState, "wait");
  const { time } = stepArgs;

  const completed = isDelayed(action, time.value, time.option, "wait");
  if (completed) {
    return await completeAction(action);
  }

  return false;
}

async function delayInterval(
  stepState: StepState,
  {
    measuremnts,
    minValue,
    maxValue,
  }: {
    measuremnts: { value: ETimeType };
    minValue: { value: number };
    maxValue: { value: number };
  }
) {
  // Create Initial
  let action = await getOrCreateAction(stepState, "Generate Random");

  switch (action.actionNumber) {
    case 0:
      const value = randomIntFromInterval(minValue.value, maxValue.value);
      console.log(value, measuremnts.value);
      stepState = await updateStepStateArgs(stepState.id, {
        time: { value, option: measuremnts.value },
      });
      action = await completeActionAndNext(action, "wait random");
    case 1:
      const { time } = (await getStepStateArgs(stepState)) as IArgs;
      // console.log(time);
      const completed = isDelayed(
        action,
        time.value,
        time.option,
        "wait Random"
      );

      if (!completed) {
        return false;
      }
      return await completeAction(action);

    default:
      return true; // Should Never Come here
  }
}


function convertTime(time: number, timeType: ETimeType) {
  switch (timeType) {
    case ETimeType.Seconds:
      return time * 1000;
    case ETimeType.Minutes:
      return time * 1000 * 60;
    case ETimeType.Hour:
      return time * 1000 * 60 * 60;
    default:
      throw new Error(`Unknown time type ${timeType}`);
  }
}

// Time delay was passed
function isDelayed(
  action: StepActionState,
  time: number,
  option: ETimeType,
  logPrefix?: string
) {
  const actionCreatedAt = new Date(action.createdAt).getTime();
  const currentTime = Date.now();
  const targetTime = actionCreatedAt + convertTime(time, option); // Assuming time is in minutes

  if (targetTime <= currentTime) {
    return true;
  } else {
    if (logPrefix)
      console.log((targetTime - currentTime) / 1000, "(sc)\t", logPrefix);
    return false;
  }
}

interface IArgs {
  time: {
    value: number;
    option: ETimeType;
  };
}

const delayFns = {
  [EMethods.DELAY]:delay,
  [EMethods.DELAY_INTERVAL]: delayInterval,
}

//  Export Function for Execution
export default delayFns;