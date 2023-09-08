import { prisma } from "@db";

export async function getAccountAddrPriv(accountId: string) {
    const account = await prisma.executionAccount.findUnique({
        where: { id: accountId },
        select: { account: { select: { privateKey: true, address: true } } },
      });
      if (!account?.account) throw new Error(`Account is not exist`);
      return account.account
}