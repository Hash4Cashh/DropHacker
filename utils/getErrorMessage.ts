import { Prisma } from "@prisma/client";

export function getErrorMessage(e: unknown): string {
  if(handlePrsimaError(e)) return handlePrsimaError(e);
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch(_) {
    console.log("FAIL TO PARSE JSON", e);
    return "";
  }
}

function handlePrsimaError(e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    // The .code property can be accessed in a type-safe manner
    if (e.code === 'P2002') {
      console.log(
        'There is a unique constraint violation, a new user cannot be created with this email'
      )
    }
    console.log("PSIMA ERROR", JSON.stringify(e))
    return e.message
  }
  return "";
}