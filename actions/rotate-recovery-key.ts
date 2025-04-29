"use server";

import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { checkSignature } from "./utils";
import { db } from "@/lib/drizzle";
import { userKeys } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

export const rotateRecoverKeyAction = authActionClient
  .metadata({ actionName: "rotateRecoverKeyAction" })
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
        encryptedPrivateKeyRecovery: parsedInput.encryptedPrivateKey,
        recoverySalt: parsedInput.salt,
        recoveryIv: parsedInput.iv,
      })
      .where(eq(userKeys.userId, ctx.session.user.id));
  });
