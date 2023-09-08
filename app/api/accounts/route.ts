import { NextRequest, NextResponse } from "next/server";
import { Account, AccountsGroup } from "@prisma/client";
import { IAccountGroup } from "@types";
import { getErrorMessage } from "@utils/getErrorMessage";
import { prisma } from "@db";
import { revalidatePath } from "next/cache";
import { handleApiErrorMessage } from "../utils/apiErrorMessage";
import { revalidate } from "../utils/revalidate";

const tag = "accounts"
export async function GET() {
  try {
    const groups = await prisma.accountsGroup.findMany({
      include: {
        accounts: true,
      },
      orderBy: {
        // created_at: "desc",
      },
    });

    // console.log("ACCOUNTS :::", groups[0].accounts)
    return NextResponse.json(groups);
  } catch (e) {
    return NextResponse.error();
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const res = await req.json();
    const { id, name, accounts = [] } = res as IAccountGroup;

    // Revalidate Page
    const path = req.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);

    const uniqueAccounts: Record<string, Account> = {};
    // ``Check, if all accounts is unique:
    for (const acc of accounts) {
      const uniqueAcc = uniqueAccounts?.[acc.address];
      if (uniqueAcc) {
        throw new Error(
          `Dublicated accounts: ${uniqueAcc.name} and ${acc.name}. Have the same address: ${acc.address}`
        );
      } else {
        uniqueAccounts[acc.address] = acc;
      }

      // ``Check If account already exist
      const dbAcc = await prisma.account.findFirst({
        where: { address: acc.address },
        select: { group: true, name: true, address: true },
      });
      if (dbAcc) {
        throw new Error(
          `Account ${acc.address} already exist in group '${dbAcc.group?.name}' with name '${dbAcc.name}'`
        );
      }
    }

    // `CREATE GROUP
    let group: AccountsGroup | { id: string | undefined } = { id: undefined };
    if (!id) {
      group = await prisma.accountsGroup.create({
        data: {
          name,
        },
      });
    } else {
      group.id = id;
    }

    // `CREATE ACCOUNTS
    const newAccounts = [];
    if (!group.id) {
      throw new Error(
        "In order to create accounts, need group name to create group, or group Id to connect account to group"
      );
    }
    for (const account of accounts) {
      try {
        const newAcc = await prisma.account.create({
          data: {
            ...account,
            groupId: group.id,
          },
        });
        newAccounts.push(newAcc);
      } catch (e) {}
    }

    return NextResponse.json({ ...group, accounts: newAccounts });
  } catch (e) {
    return handleApiErrorMessage(e);
    // console.log(e);
    // return NextResponse.error();
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const res = await req.json();
    const { id, name, accounts = [] } = res as IAccountGroup;

    revalidate(req, tag)

    // ``Update Group Name by Id
    let updatedGroup: AccountsGroup;
    if (id && name) {
      updatedGroup = await prisma.accountsGroup.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });
      if (!updatedGroup.id) {
        throw new Error("Invalid group Id");
      }
      return NextResponse.json(updatedGroup);
    }

    // ``Update Accounts
    if(accounts) {
      const updatedAccounts = [];
      for (const account of accounts) {
        if (account.id) {
          const updatedAcc = await prisma.account.update({
            where: {
              id: account.id,
            },
            data: {
              name: account.name,
            },
          });
          if (updatedAcc.id) {
            updatedAccounts.push(updatedAcc);
          }
        }
      }
      return NextResponse.json({ accounts: updatedAccounts });
    }

    throw new Error("Need to provide [id: groupId, name: groupName] or [{accounts: Array<{id, name}>}]")

  } catch (e) {
    console.log(e);
    return NextResponse.error();
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log("\nDELETE ACCOUNTS\t :::: \n\n", req.body);
    // const res = await req.json()
    // console.log("DELETE ACCOUNTS", res);
    // const { id, accounts = [] } = res as IAccountGroup;
    const { id, accounts = [] } = req.body as IAccountGroup;
    console.log(id, accounts);

    let deletedGroup = {};
    if (id) {
      deletedGroup = await prisma.accountsGroup.delete({
        where: {
          id,
        },
      });
    }

    const deletedAccounts = [];
    console.log(accounts);
    for (const account of accounts) {
      if (account.id) {
        const del = await prisma.account.delete({
          where: {
            id: account.id,
          },
        });
        if (del.id) {
          deletedAccounts.push(del);
        }
      }
    }

    return NextResponse.json({ ...deletedGroup, accounts: deletedAccounts });
  } catch (e) {
    const errMessage = getErrorMessage(e);
    console.log("ERR\t:::: \t", errMessage);
    return NextResponse.error();
  } finally {
    await prisma.$disconnect();
  }
}
