import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { IAccountGroup } from "@types";
import { getErrorMessage } from "@utils/getErrorMessage";
import { prisma } from "@db";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    // console.log("\nDELETE ACCOUNTS\t :::: \n\n", req.body);
    const res = await req.json();
    // console.log("DELETE ACCOUNTS", res);
    const { id, accounts = [] } = res as IAccountGroup;

    // Revalidate Page
    // const path = req.nextUrl.searchParams.get('path') || '/'
    revalidatePath("/api/accounts");
    revalidateTag("accounts");

    let deletedGroup = {};
    if(id) {
      deletedGroup = await prisma.accountsGroup.delete({
        where: {
          id
        }
      });
    }

    const deletedAccounts = []
    console.log(accounts);
    for (const account of accounts) {
      if(account.id) {
        const del = await prisma.account.delete({
          where: {
            id: account.id
          }
        })
        if(del.id) {
          deletedAccounts.push(del);
        }
      }
    }

    return NextResponse.json({ ...deletedGroup, accounts: deletedAccounts})
  } catch (e) {
    const errMessage = getErrorMessage(e)
    console.log("ERR\t:::: \t",errMessage)
    return NextResponse.error();
  } finally {
    await prisma.$disconnect();
  }
}