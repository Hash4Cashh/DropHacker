import { prisma } from "@db";
import { StepActionState, StepState } from "@prisma/client";

export async function updateAction(
  action: StepActionState,
  data: Partial<StepActionState>
) {
  return await prisma.stepActionState.update({
    where: { id: action.id },
    data,
  });
}