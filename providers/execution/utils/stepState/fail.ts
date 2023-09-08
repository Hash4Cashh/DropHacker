import { prisma } from "@db";
import { Prisma, StepState } from "@prisma/client";
import { EStatuses } from "@types";

export async function setStepStateFail(stepState: StepState){
    await prisma.stepState.update({
      where: {
        id: stepState.id
      },
      data: { status: EStatuses.FAILED },
    });
}
export async function setActionFailByState(
  stepState: StepState,
  errorMessage: string
) {
  try {
    // `` Update StepState. Due to it have to have different 'currentAction'.
    const _stepState = await prisma.stepState.findUnique({where: {id: stepState.id}})
    if(!_stepState) throw new Error("Can't find stepState: Should never happened");


    await prisma.stepActionState.update({
      where: {
        stepStateId_actionNumber: {
          stepStateId: _stepState.id,
          actionNumber: _stepState.currentAction,
        },
      },
      data: { status: EStatuses.FAILED, errorMessage },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === 'P2002') {
        console.log(
          'There is a unique constraint violation, a new user cannot be created with this email'
        )
      }
    }
    console.error(e)
  }
}
