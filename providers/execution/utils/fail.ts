import { prisma } from "@db";
import { EStatuses } from "@types";

export async function setAccountFail(accountId: string, errorMessage: string) {
  await prisma.executionAccount.update({
    where: { id: accountId },
    data: { status: EStatuses.FAILED, errorMessage },
  });
}
