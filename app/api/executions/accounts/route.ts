import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@db";
import { EExecutionAccountsMethods, EStatuses } from "@types";
import {
  Account,
  ExecutionAccount,
  ExecutionStep,
  TaskStep,
} from "@prisma/client";
import { getErrorMessage } from "@utils/getErrorMessage";
import { revalidate } from "@app/api/utils/revalidate";
import {
  includeAllExecutionAccount,
  includeAllExecutionStep,
  includeAllStepState,
} from "../include";

const tag = "executions"; // for revalidation

export async function GET(req: NextRequest) {
  try {
    const executionId = req.nextUrl.searchParams.get("executionId");
    const address = req.nextUrl.searchParams.get("address");

    if (executionId && address) {
      const account = await prisma.executionAccount.findFirst({
        where: { executionId, address },
        select: {
          ...includeAllExecutionAccount,
          account: true,
          execution: true,
        },
      });

      const steps = await prisma.executionStep.findMany({
        where: {
          executionId,
        },
        select: {
          ...includeAllExecutionStep,

          states: {
            where: { accountExecutionId: account?.id },
            select: {
              ...includeAllStepState,
              actions: true,
            },
          },
        },
      });

      // console.log("FETCHED STEPS", steps)

      return NextResponse.json({ account, steps });
    }
  } catch (e) {
    console.error(e);
    return new NextResponse("An error occurred", {
      status: 500,
      statusText: getErrorMessage(e),
    }); // Send a custom error response
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest) {
  try {
    // todo Transaction
    // console.log(req);
    const method = req.nextUrl.searchParams.get("method");
    const res = await req.json();
    const { accounts, status } = res as {
      status: EStatuses;
      accounts: Array<ExecutionAccount>;
    };
    const newAccounts = [];

    revalidate(req, tag);

    switch (method) {
      case EExecutionAccountsMethods.UPDATE_STATUS:
        for (const acc of accounts) {
          const newAcc = await prisma.executionAccount.update({
            where: { id: acc.id },
            data: { status },
          });
          try {
            const step = await prisma.executionStep.findFirst({where: { executionId: acc.executionId, stepNumber: acc.currentStep }}) // prettier-ignore

            if (step) {
              const stepState = await prisma.stepState.findFirst({where: { stepId: step.id, accountExecutionId: acc.id }}); // prettier-ignore
              await prisma.stepState.update({
                where: { id: stepState?.id },
                data: { status },
              });

              const action = await prisma.stepActionState.findFirst({where: { stepStateId: stepState!.id, actionNumber: stepState?.currentAction}}); // prettier-ignore
              await prisma.stepActionState.update({
                where: { id: action?.id },
                data: { status },
              });
            }
          } catch (e) {}
          newAccounts.push(newAcc);
        }
        break;

      case EExecutionAccountsMethods.RESTART_ACTION:
        for (const acc of accounts) {
          await prisma.executionAccount.update({
            where: { id: acc.id },
            data: { status: EStatuses.PENDING },
          });

          const step = await prisma.executionStep.findFirst({where: { executionId: acc.executionId, stepNumber: acc.currentStep }}) // prettier-ignore

          const stepState = await prisma.stepState.findFirst({
            where: { accountExecutionId: acc.id, stepId: step?.id },
            select: { actions: true, id: true },
          });
          
          await prisma.stepState.update({
            where: { id: stepState?.id },
            data: { status: EStatuses.PENDING },
          });

          for (const action of stepState?.actions || []) {
            await prisma.stepActionState.delete({where: { id: action.id }})
          }
        }
        break;
      case EExecutionAccountsMethods.SKIP_CURRENT_STEP:
        for (const acc of accounts) {
          await prisma.executionAccount.update({
            where: { id: acc.id },
            data: { currentStep: acc.currentStep + 1 },
          });
        }
        break;
      default:
        throw new Error(`Unknown Method ${method}`);
    }

    revalidate(req, tag);
    return NextResponse.json({ success: true, accounts: newAccounts });
  } catch (e) {
    console.error(e);
    console.error(getErrorMessage(e));
    return new NextResponse("An error occurred", {
      status: 500,
      statusText: getErrorMessage(e),
    }); // Send a custom error response
  } finally {
    await prisma.$disconnect();
  }
}

// export async function PUT(req: NextRequest) {
//   try {
//     const res = await req.json();
//     const { id, name, steps = [] } = res as ITask;

//     // Update Task
//     const updatedTask = await prisma.task.update({
//       where: { id },
//       data: { name },
//     });
//     if (!updatedTask.id) throw new Error("Invalid Task Id");

//     // Revalidate Path
//     revalidate(req, tag);

//     // Update Steps
//     const updatedSteps: Array<TaskStep> = [];
//     for (let i = 0; i < steps.length; i++) {
//       const step = steps[i];
//       let resStep: TaskStep;

//       if (step.id) {
//         resStep = await updateStep(step, updatedTask.id, i);
//       } else {
//         resStep = await createStep(step, updatedTask.id, i);
//       }
//       updatedSteps.push(resStep);
//     }

//     return NextResponse.json({ ...updatedTask, steps: updatedSteps });
//   } catch (e) {
//     console.error(e);
//     return new NextResponse("An error occurred", {
//       status: 500,
//       statusText: getErrorMessage(e),
//     }); // Send a custom error response
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// export async function DELETE(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");
//     console.log(id);

//     revalidate(req, tag);

//     // * Delete Task and steps by Task Id
//     if (id) {
//       // Fetch all task related to this taskStep
//       const taskSteps = await prisma.taskStep.findMany({
//         where: {
//           taskId: id,
//         },
//       });

//       // Delete all steps related to the task
//       for (const step of taskSteps) {
//         await prisma.taskStep.delete({
//           where: {
//             id: step.id,
//           },
//         });
//       }

//       // Delete Task
//       const delTask = await prisma.task.delete({
//         where: {
//           id,
//         },
//       });

//       // If don't have task.id, it means that id does not exist.
//       if (!delTask.id) throw new Error("Invalid Task Id");
//     }
//     // * Delte Steps by step.id
//     else {
//       let steps = searchParams.get("steps");

//       if (steps) {
//         steps = JSON.parse(steps);
//         if (!Array.isArray(steps))
//           throw new Error("steps must be an array of TaskStep");
//       } else throw new Error("'steps' array was not provided");

//       for (const step of steps) {
//         await prisma.taskStep.delete({
//           where: {
//             id: step.id,
//           },
//         });
//       }
//     }

//     return NextResponse.json(true);
//     // return NextResponse.json(groups);
//   } catch (e) {
//     console.error(e);
//     return new NextResponse("An error occurred", {
//       status: 500,
//       statusText: getErrorMessage(e),
//     }); // Send a custom error response
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// Utils function.
function parseStep(step: ExecutionStep, key = "args") {
  return {
    ...step,
    [key]: JSON.parse(step["args"]), // todo change. type conflict
  };
}

async function createStep(
  step: ExecutionStep,
  executionId: string,
  stepNumber: number
) {
  const newStep = await prisma.executionStep.create({
    data: {
      ...step,
      stepNumber,
      args: JSON.stringify(step.args),
      executionId,
    },
  });

  return parseStep(newStep);
}

async function updateStep(
  step: ExecutionStep,
  executionId: string,
  stepNumber: number
) {
  const updatedStep = await prisma.executionStep.update({
    where: {
      id: step.id,
    },
    data: {
      ...step,
      stepNumber,
      args: JSON.stringify(step.args),
      executionId,
    },
  });
  return parseStep(updatedStep);
}
