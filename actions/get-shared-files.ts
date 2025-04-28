"use server";

import { db } from "@/lib/drizzle";
import { dataNodes, sharedFiles, user } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { checkSignature } from "./utils";
import { SharedFileType } from "./types";

export const getSharedFilesAction = authActionClient
  .metadata({ actionName: "getSharedFilesAction" })
  .schema(
    z.object({
      signature: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    return (await db
      .select({
        fileId: dataNodes.id,
        createdAt: sharedFiles.createdAt,
        encryptedKey: sharedFiles.encryptedKey,
        encryptedName: dataNodes.encryptedName,
        encryptedType: dataNodes.encryptedType,
        encryptedSize: dataNodes.encryptedSize,
        fileKey: dataNodes.fileKey,
        iv: dataNodes.iv,
        sender: {
          email: user.email,
          image: user.image,
          name: user.name,
        },
      })
      .from(sharedFiles)
      .where(eq(sharedFiles.receiverId, ctx.session.user.id))
      .leftJoin(dataNodes, eq(dataNodes.id, sharedFiles.dataNodeId))
      .leftJoin(user, eq(user.id, dataNodes.userId))
      .orderBy(
        sql`CASE WHEN ${dataNodes.type} = 'folder' THEN 0 WHEN ${dataNodes.type} = 'file' THEN 1 ELSE 2 END`,
        desc(sharedFiles.createdAt)
      )) as SharedFileType[];
  });
