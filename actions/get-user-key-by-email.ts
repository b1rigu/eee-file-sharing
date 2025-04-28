"use server";

import { db } from "@/lib/drizzle";
import { user, userKeys } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { eq } from "drizzle-orm";
import { checkSignature } from "./utils";
import { z } from "zod";

export const getUserKeyByEmailAction = authActionClient
  .metadata({ actionName: "getUserKeyByEmailAction" })
  .schema(
    z.object({
      signature: z.string(),
      email: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    const data = await db
      .select({
        publicKey: userKeys.publicKey,
      })
      .from(user)
      .where(eq(user.email, parsedInput.email))
      .leftJoin(userKeys, eq(userKeys.userId, user.id))
      .limit(1);

    if (data.length === 0 || !data[0].publicKey) {
      throw new Error("User not found or they have not set up their key");
    }

    return data[0].publicKey;
  });
