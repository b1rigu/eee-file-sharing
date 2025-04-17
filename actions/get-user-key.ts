"use server";

import { db } from "@/lib/drizzle";
import { userKeys } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { eq } from "drizzle-orm";

export const getUserKeyAction = authActionClient
  .metadata({ actionName: "getUserKeyAction" })
  .action(async ({ ctx }) => {
    const data = await db.query.userKeys.findFirst({
      where: eq(userKeys.userId, ctx.session.user.id),
    });

    if (!data) {
      throw new Error("Key not found");
    }

    return data;
  });
