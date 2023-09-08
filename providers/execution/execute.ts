import { prisma } from "@db";
import { Execution } from "@prisma/client";
import { EStatuses } from "@types";
import { executeAccount } from "./executeAccount";

export async function execute(execution: Execution) {
  // todo get all accounts and filter them...
  // `Get All Pending Accounts
  const accountsPending = await prisma.executionAccount.findMany({
    where: {
      executionId: execution.id,
      status: EStatuses.PENDING,
    },
  });

  // `If have Account in Pending
  if (accountsPending.length) {
    console.log(
      `Execution '${execution.name}'\nTotal Accounts Executed: ${accountsPending.length}`
    );

    // `Set Account status to inProgress.
    // `This is need to not execute task twice
    for (const account of accountsPending) {
      await prisma.executionAccount.update({
        where: { id: account.id },
        data: { status: EStatuses.IN_PROGRESS },
      });
    }
    // * Execute Pending Accounts
    for (const account of accountsPending) {
      await executeAccount(execution, account);
    }
  }

  // `if don't have any 'Pending' accounts, need to check accounts 'inProgress'
  else {
    // `Get all Accounts that have status 'inProgress'
    const countInProgress = await prisma.executionAccount.count({
      where: {
        executionId: execution.id,
        status: EStatuses.PENDING,
      },
    });
    console.log(
      `\nNothing to Execute in '${execution.name}'\nTotal Accounts inProgress: ${countInProgress}`
    );

    // `If don't have any accounts inProgress, it means that execution is completed
    if (!countInProgress) {
      await prisma.execution.update({
        where: { id: execution.id },
        data: { status: EStatuses.COMPLETE },
      });
    }
  }
}
