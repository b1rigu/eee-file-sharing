"use server";

import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { checkSignature } from "./utils";
import { db } from "@/lib/drizzle";
import { userKeys } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

export const changePasswordAction = authActionClient
  .metadata({ actionName: "changePasswordAction" })
  .schema(
    z.object({
      signature: z.string(),
      encryptedPrivateKey: z.string(),
      iv: z.string(),
      salt: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    await db
      .update(userKeys)
      .set({
        encryptedPrivateKey: parsedInput.encryptedPrivateKey,
        salt: parsedInput.salt,
        iv: parsedInput.iv,
      })
      .where(eq(userKeys.userId, ctx.session.user.id));
  });
