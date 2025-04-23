"use server";

import { db } from "@/lib/drizzle";
import { dataNodes } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { checkSignature } from "./utils";

export const createFolderAction = authActionClient
  .metadata({ actionName: "createFolderAction" })
  .schema(
    z.object({
      signature: z.string(),
      parentId: z.string().nullable(),
      iv: z.string(),
      encryptedKey: z.string(),
      encryptedName: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    const folderToInsert: typeof dataNodes.$inferInsert = {
      id: uuidv4(),
      userId: ctx.session.user.id,
      iv: parsedInput.iv,
      parentId: parsedInput.parentId,
      type: "folder",
      encryptedKey: parsedInput.encryptedKey,
      encryptedName: parsedInput.encryptedName,
      createdAt: new Date(),
    };

    await db.insert(dataNodes).values(folderToInsert);

    revalidatePath("/dashboard");
  });
