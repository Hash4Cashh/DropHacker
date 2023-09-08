import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@db";
import { IProvider } from "@types";
import { revalidate } from "@app/api/utils/revalidate";
import { getErrorMessage } from "@utils/getErrorMessage";

export async function GET() {
  try {
    const providers = await prisma.provider.findMany();

    return NextResponse.json(providers);
  } catch (e) {
    console.log("ERROR IN GET - /api/settings/providers\n",e)
    console.log(getErrorMessage(e))
    // return NextResponse.error();
    return NextResponse.json([]);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  const prisma = new PrismaClient();
  try {
    console.log("PROVIDERS POST:")
    const providers = (await req.json()) as Array<IProvider>;
    console.log(providers);

    revalidate(req, "providers");
    const newProviders = [];
    for (const provider of providers) {
        let newProv;
      if (provider.id) {
        newProv = await prisma.provider.update({
          where: { id: provider.id },
          data: { url: provider.url, gasPrice: provider.gasPrice },
        });
      } else {
        newProv = await prisma.provider.create({
          data: { url: provider.url, chain: provider.chain },
        });
      }

      newProviders.push(newProv);
    }

    return NextResponse.json(newProviders);
  } catch (e) {
    console.log(e);
    return NextResponse.error();
  } finally {
    await prisma.$disconnect();
  }
}
