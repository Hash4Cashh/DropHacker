import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@db";
import { IStep, ITask } from "@types";
import { TaskStep } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { getErrorMessage } from "@utils/getErrorMessage";

export async function GET() {
  try {
    const tasksResult = [];
    const tasks = await prisma.task.findMany({});

    // ``Fetch all steps (and sort them by stepNumber)
    // ``Parse all step.args (due to is stored as JSON)
    // ``Combine Tasks and Steps
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      // `Get all steps by task, sorted by stepNumber
      const steps = await prisma.taskStep.findMany({
        where: {
          taskId: task.id,
        },
        orderBy: {
          stepNumber: "asc",
        },
      });

      // `Parse args in all steps (due to they are stored as JSON)
      const parsedSteps = [];
      for (const step of steps) {
        parsedSteps.push(parseStep(step));
      }

      // `Combine Task and Steps
      tasksResult.push({
        ...task,
        steps: parsedSteps,
      });
    }

    return NextResponse.json(tasksResult);
    // return NextResponse.json(groups);
  } catch (e) {
    console.error(e)
    return new NextResponse("An error occurred", { status: 500, statusText: getErrorMessage(e) }); // Send a custom error response
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    // console.log(req);
    const res = await req.json();
    const { name, steps = [] } = res as ITask;

    // Create Task
    const newTask = await prisma.task.create({
      data: {
        name,
      },
    });

    // Revalidate Path
    const path = req.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);
    revalidateTag("tasks");

    // Create Steps
    const newSteps: Array<TaskStep> = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      const newStep = await createStep(step, newTask.id, i);
      newSteps.push(newStep);
    }

    return NextResponse.json({ ...newTask, steps: newSteps });
  } catch (e) {
    console.error(e)
    return new NextResponse("An error occurred", { status: 500, statusText: getErrorMessage(e) }); // Send a custom error response
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const res = await req.json();
    const { id, name, steps = [] } = res as ITask;

    // Update Task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { name },
    });
    if (!updatedTask.id) throw new Error("Invalid Task Id");

    // Revalidate Path
    const path = req.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);
    revalidateTag("tasks");

    // Update Steps
    const updatedSteps: Array<TaskStep> = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      let resStep: TaskStep;

      if (step.id) {
        resStep = await updateStep(step, updatedTask.id, i)
      } else {
        resStep = await createStep(step, updatedTask.id, i);
      }
      updatedSteps.push(resStep);
    }

    return NextResponse.json({ ...updatedTask, steps: updatedSteps });
  } catch (e) {
    console.error(e)
    return new NextResponse("An error occurred", { status: 500, statusText: getErrorMessage(e) }); // Send a custom error response
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    console.log(id);

    const path = req.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);
    revalidateTag("tasks");

    // * Delete Task and steps by Task Id
    if (id) {
      // Fetch all task related to this taskStep
      const taskSteps = await prisma.taskStep.findMany({
        where: {
          taskId: id,
        },
      });

      // Delete all steps related to the task
      for (const step of taskSteps) {
        await prisma.taskStep.delete({
          where: {
            id: step.id,
          },
        });
      }

      // Delete Task
      const delTask = await prisma.task.delete({
        where: {
          id,
        },
      });

      // If don't have task.id, it means that id does not exist.
      if (!delTask.id) throw new Error("Invalid Task Id");

    } 
    // * Delte Steps by step.id
    else {
      let steps = searchParams.get("steps");
      
      if (steps) {
        steps = JSON.parse(steps);
        if (!Array.isArray(steps))
          throw new Error("steps must be an array of TaskStep");
      } else throw new Error("'steps' array was not provided");

      for (const step of steps) {
        await prisma.taskStep.delete({
          where: {
            id: step.id,
          },
        });
      }
    }

    return NextResponse.json(true);
    // return NextResponse.json(groups);
  } catch (e) {
    console.error(e)
    return new NextResponse("An error occurred", { status: 500, statusText: getErrorMessage(e) }); // Send a custom error response
  } finally {
    await prisma.$disconnect();
  }
}

function parseStep(step: TaskStep) {
  return {
    ...step,
    args: JSON.parse(step.args),
  };
}

async function createStep(step: TaskStep, taskId: string, stepNumber: number) {
  const newStep = await prisma.taskStep.create({
    data: {
      ...step,
      stepNumber,
      args: JSON.stringify(step.args),
      taskId,
    },
  });

  return parseStep(newStep);
}

async function updateStep(step: TaskStep, taskId: string, stepNumber: number) {
  const updatedStep = await prisma.taskStep.update({
    where: {
      id: step.id,
    },
    data: {
      ...step,
      stepNumber,
      args: JSON.stringify(step.args),
      taskId,
    },
  });
  return parseStep(updatedStep);
}