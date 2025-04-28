"use server";

import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle";
import { v4 as uuidv4 } from "uuid";
import { userKeys } from "@/lib/drizzle/schema";

export const enableSecurityAction = authActionClient
  .metadata({ actionName: "enableSecurityAction" })
  .schema(
    z.object({
      publicKey: z.string(),
      encryptedPrivateKey: z.string(),
      iv: z.string(),
      salt: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await db.insert(userKeys).values({
      id: uuidv4(),
      userId: ctx.session.user.id,
      publicKey: parsedInput.publicKey,
      encryptedPrivateKey: parsedInput.encryptedPrivateKey,
      salt: parsedInput.salt,
      iv: parsedInput.iv,
      createdAt: new Date(),
    });
  });
