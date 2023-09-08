import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@db";
import { EStatuses } from "@types";
import { Account, ExecutionAccount, ExecutionStep, TaskStep } from "@prisma/client";
import { getErrorMessage } from "@utils/getErrorMessage";
import { includeAllExecutionAccount, includeAllExecutionStep } from "./include";
import { revalidate } from "../utils/revalidate";

const tag = "executions"; // for revalidation

export async function GET() {
  try {
    const executionsResult = [];
    const executions = await prisma.execution.findMany({});

    // ``Fetch all steps (and sort them by stepNumber)
    // ``Parse all step.args (due to is stored as JSON)
    // ``Combine executions and Steps
    for (let i = 0; i < executions.length; i++) {
      const execution = executions[i];
      
      // `Get all steps by execution, sorted by stepNumber
      const accounts = await prisma.executionAccount.findMany({
        where: {
          executionId: execution.id,
        },
        select: {
          ...includeAllExecutionAccount,
          account: {
            select: {
              name: true,
              address: true,
            }
          }
        }
      });

      // `Get all steps by execution, sorted by stepNumber
      const steps = await prisma.executionStep.findMany({
        where: {
          executionId: execution.id,
        },
        select: {
          ...includeAllExecutionStep,
          // stepName: true,
          // args: true,
          states: true
        },
        orderBy: {
          stepNumber: "asc",
        },
      });

      // `Parse args in all steps (due to they are stored as JSON)
      const parsedSteps = [];
      for (const step of steps) {
        parsedSteps.push(parseStep(step as any));
      }

      // `Combine Task and Steps
      executionsResult.push({
        ...execution,
        steps: parsedSteps,
        accounts
      });
    }

    return NextResponse.json(executionsResult);
    // return NextResponse.json(groups);
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

export async function POST(req: NextRequest) {
  try {
    // todo Transaction
    // console.log(req);
    const res = await req.json();
    const { name, steps, accounts } = res as {name: string, steps: TaskStep, accounts: Array<Account>};

    if (!Array.isArray(steps) || !Array.isArray(accounts)) {
      throw new Error("Invalid Input");
    }

    // Create Task
    const newExecution = await prisma.execution.create({
      data: {
        name,
        status: EStatuses.PENDING,
      },
    });

    // Revalidate Path
    revalidate(req, tag);

    // Create ExecutionStep
    const newSteps: Array<ExecutionStep> = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      delete (step as any).id; // delete id if it have
      delete (step as any).taskId; // delete TaskId if it have
      const newStep = await createStep(step, newExecution.id, i);
      newSteps.push(newStep);
    }
    
    // Create ExecutionAccount
    const newExAccounts: Array<ExecutionAccount> = [];
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];

      const newExAccount = await prisma.executionAccount.create({
        data: {
          address: account.address,
          status: EStatuses.PENDING,
          executionId: newExecution.id,
        }
      })
      newExAccounts.push(newExAccount);
    }

    return NextResponse.json({ ...newExecution, steps: newSteps, accounts: newExAccounts });
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
