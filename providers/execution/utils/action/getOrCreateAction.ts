import { prisma } from "@db";
import { StepActionState, StepState } from "@prisma/client";
import { EStatuses } from "@types";

export async function getOrCreateAction(
  stepState: StepState,
  actionName: string,
  status: EStatuses = EStatuses.IN_PROGRESS
) {
  let action: StepActionState | null | undefined;

  // `Try To FInd PREVIOS ACTION
  const prevAction = await prisma.stepActionState.findUnique({
    where: {
      stepStateId_actionNumber: {
        stepStateId: stepState.id,
        actionNumber: stepState.currentAction - 1,
      },
    },
    select: {
      id: true,
    },
  });

  // `Try to find CURRENT ACTION
  action = await prisma.stepActionState.findUnique({
    where: {
      stepStateId_actionNumber: {
        stepStateId: stepState.id,
        actionNumber: stepState.currentAction,
      },
    },
  });

  // "If Don't Find Current Action
  if (!action) {
    // `Create Current Action with referenig to previosAction
    action = await prisma.stepActionState.create({
      data: {
        name: actionName,
        status,
        actionNumber: stepState.currentAction, // Number of the currentAction

        // relations
        stepStateId: stepState.id, // Create Relation to stepState
        previosActionId: prevAction?.id, // Create Relation to Previos Action if have
      },
    });
  }

  // 'Return Current Action
  return action;
}

