import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@db";

// Get Only groups, without accounts.
export async function GET() {
    try {
      const groups = await prisma.accountsGroup.findMany();
  
      return NextResponse.json(groups);
    } catch (e) {
      return NextResponse.error();
    } finally {
      await prisma.$disconnect();
    }
  }