import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@db";
import { getErrorMessage } from "@utils/getErrorMessage";
import { EStatuses } from "@types";
import { execute } from "@providers/execution/execute";
import { revalidatePath, revalidateTag } from "next/cache";
import { Execution } from "@prisma/client";

const tag = "executions"; // for revalidation
let isRunning = false;

export async function GET(req: NextRequest) {
  try {
    const path = req.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);
    revalidateTag(tag);

    if(isRunning) {
      console.log("\n\nExecution is still running...\n\n\n")
      return NextResponse.json({ executed: 0, isRunning });
    }
    console.log("\n\nEXECUTING...\n\n\n")

    const executions = await prisma.execution.findMany({
      where: {
        status: EStatuses.IN_PROGRESS,
      },
    });

    // If Find At least on Execution
    if (!executions.length) {
      return NextResponse.json({ executed: 0 });
    }

    isRunning = true;
    for (const ex of executions) {
      await execute(ex);
    }

    return NextResponse.json({ executed: executions.length });
    // return NextResponse.json(groups);
  } catch (e) {
    console.error(e);
    return new NextResponse("An error occurred", {
      status: 500,
      statusText: getErrorMessage(e),
    }); // Send a custom error response
  } finally {
    isRunning = false;
  }
}

// Change Status of Execution to 'inProgress'
export async function POST(req: NextRequest) {
  const statuses = [EStatuses.PENDING, EStatuses.FAILED, EStatuses.STOPED];
  try {
    const res = await req.json();
    const { id } = res as Execution;

    const path = req.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);
    revalidateTag(tag);

    const newExecution = await prisma.execution.update({
      // where: { id: execution?.id },
      where: { id },
      data: { status: EStatuses.IN_PROGRESS },
    });

    return NextResponse.json(newExecution);
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

// export async function PUT(req: NextRequest) {
//   const executions = await prisma.execution.findMany({
//     where: {
//       status: EStatuses.IN_PROGRESS,
//     },
//     select: {
//       accounts: {
//         select: {
//           stepsState: true
//         }
//       }
//     }
//   });

//   for(const ex of executions) {
//     for(const acc of ex.accounts) {
//       for(const stepState of acc.stepsState) {
//         const actions = await prisma.stepActionState.findMany({
//           where: {
//             stepStateId: stepState.id
//           },
//           orderBy: {
//             createdAt: "asc"
//           }
//         })

//         for(const act of actions) {
//           console.log('curActions.createdAt:', act.createdAt, act.actionNumber, act.name);
//         }
//         console.log()
//         const time2 = new Date(actions[0].createdAt).getTime();
//         for(const act of actions) {
//           const time = new Date(act.createdAt).getTime();
//           console.log(`${time} :: ${time - time2} :: ${act.actionNumber} ::: ${act.name}`)
//           console.log(time - time2, typeof time, time, typeof time2, time2)
//           // time2 = time;
//         }
//       }
//       console.log("\n")
//     }
//   }

//   return NextResponse.json({success: true });

// }
