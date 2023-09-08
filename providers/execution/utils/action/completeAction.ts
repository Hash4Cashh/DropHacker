import { prisma } from "@db";
import { StepActionState } from "@prisma/client";
import { EStatuses } from "@types";
import { updateStepState } from "../stepState/update";

export async function completeAction(action: StepActionState) {
  await prisma.stepActionState.update({
    where: { id: action.id },
    data: { status: EStatuses.COMPLETE },
  });

  return true;
}

export async function completeActionAndNext(
  action: StepActionState,
  name: string,
  status: EStatuses = EStatuses.IN_PROGRESS,
): Promise<StepActionState> {
  await prisma.stepActionState.update({
    where: { id: action.id },
    data: { status: EStatuses.COMPLETE },
  });

  await updateStepState(action.stepStateId, {currentAction: action.actionNumber + 1})

  return await prisma.stepActionState.create({
    data: {
        stepStateId: action.stepStateId,
        previosActionId: action.id,

        name,
        status,
        actionNumber: action.actionNumber + 1,
    }
  })
}
