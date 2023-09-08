import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export function revalidate(req: NextRequest, tag: string) {
    const path = req.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);
    revalidateTag(tag);
  }
  