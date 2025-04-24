"use server";

import { db } from "@/lib/drizzle";
import { dataNodes } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { checkSignature } from "./utils";
import { eq } from "drizzle-orm";

export const createFolderAction = authActionClient
  .metadata({ actionName: "createFolderAction" })
  .schema(
    z.object({
      signature: z.string(),
      parentId: z.string().nullable(),
      iv: z.string(),
      encryptedKey: z.string(),
      encryptedName: z.string(),
      nameHash: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    if (parsedInput.parentId) {
      const parentNode = await db
        .select()
        .from(dataNodes)
        .where(eq(dataNodes.id, parsedInput.parentId));
      if (parentNode.length === 0) {
        throw new Error("Parent folder not found");
      }

      if (parentNode[0].userId !== ctx.session.user.id) {
        throw new Error("You do not have access to this folder");
      }
    }

    console.log(
      `parentId: ${parsedInput.parentId}, userId: ${ctx.session.user.id}, type: folder, nameHash: ${parsedInput.nameHash}`
    );

    const folderToInsert: typeof dataNodes.$inferInsert = {
      id: uuidv4(),
      userId: ctx.session.user.id,
      iv: parsedInput.iv,
      parentId: parsedInput.parentId,
      type: "folder",
      encryptedKey: parsedInput.encryptedKey,
      encryptedName: parsedInput.encryptedName,
      nameHash: parsedInput.nameHash,
      createdAt: new Date(),
    };

    await db.insert(dataNodes).values(folderToInsert);

    revalidatePath("/dashboard");
  });
