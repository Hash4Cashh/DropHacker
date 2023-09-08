import { getErrorMessage } from "@utils/getErrorMessage";
import { NextRequest, NextResponse } from "next/server";

export function handleApiErrorMessage(e: unknown) {
    return new NextResponse("An error occurred", { status: 500, statusText: getErrorMessage(e) }); // Send a custom error response
}