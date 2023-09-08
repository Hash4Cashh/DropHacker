import { Exchange } from "@prisma/client";
import { getHeaders } from "@providers/methods/CEX/okex/utils/getHeader";
import { EStatuses, IExchange } from "@types";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    console.log("GET:::CHECK")
}

export async function POST(req: NextRequest) {
  try {
    console.log("CHECK::POST")
    const exchange = (await req.json()) as IExchange;

    // console.log("exchange", exchange);
    const endpoint = "/api/v5/asset/deposit-address?ccy=ETH";
    const { apiKey, passphrase, secretKey } = exchange.credentials;

    // console.log(apiKey, passphrase, secretKey);
    
    const headers = getHeaders({
      apiKey: apiKey!,
      passphrase: passphrase!,
      secretKey: secretKey!,
      endpoint,
      method: "GET",
    });

    // console.log(exchange.url + endpoint, headers);
    
    const res = await axios(exchange.url + endpoint, { headers });
    // console.log("RES", res);

    return NextResponse.json({status: EStatuses.SUCCESS, data: res.data});
  } catch (e) {
    console.log("FAILED TO CHECK EXCHANGE");
    return NextResponse.json({status: EStatuses.FAILED});
    //   return NextResponse.error();
  }
}
