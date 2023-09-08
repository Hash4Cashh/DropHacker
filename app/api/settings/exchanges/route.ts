import { revalidate } from "@app/api/utils/revalidate";
import { prisma } from "@db";
import { Exchange } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

function parseCredentials(exchange: Exchange) {
    return {...exchange, credentials: JSON.parse(exchange.credentials)}
}
export async function GET() {
  try {
    const exchanges = await prisma.exchange.findMany();
    
    const parsedExchanges = [];

    for(const ex of exchanges) {
        parsedExchanges.push(parseCredentials(ex));
    }
    console.log("EXCHANGES", parsedExchanges);
    return NextResponse.json(parsedExchanges);
  } catch (e) {
    return NextResponse.error();
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const exchanges = (await req.json()) as Array<Exchange>;
    console.log(exchanges);

    revalidate(req, "exchange");

    const newValues = [];
    for (const exchange of exchanges) {
      let newValue;
      if (exchange.id) {
        newValue = await prisma.exchange.update({
          where: { id: exchange.id },
          data: {
            name: exchange.name,
            url: exchange.url,
            credentials: JSON.stringify(exchange.credentials || {})
          },
        });
      } else {
        newValue = await prisma.exchange.create({
          data: { ...exchange, credentials: JSON.stringify(exchange.credentials || {}) },
        });
      }

      newValues.push(parseCredentials(newValue));
    }

    console.log("EXCHANGES", newValues)
    return NextResponse.json(newValues);
  } catch (e) {
    console.log(e);
    return NextResponse.error();
  }
}
