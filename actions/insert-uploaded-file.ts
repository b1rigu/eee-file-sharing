"use server";

import { db } from "@/lib/drizzle";
import { dataNodes } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { checkSignature } from "./utils";

export const insertUploadedFileAction = authActionClient
  .metadata({ actionName: "insertUploadedFileAction" })
  .schema(
    z.object({
      signature: z.string(),
      parentId: z.string().nullable(),
      validUploads: z
        .array(
          z.object({
            fileKey: z.string(),
            iv: z.string(),
            encryptedFileKey: z.string(),
            encryptedFileName: z.string(),
            encryptedFileType: z.string(),
            encryptedFileSize: z.string(),
            nameHash: z.string(),
          })
        )
        .min(1),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    const filesToInsert: (typeof dataNodes.$inferInsert)[] = parsedInput.validUploads.map(
      (upload) => {
        return {
          id: uuidv4(),
          userId: ctx.session.user.id,
          iv: upload.iv,
          parentId: parsedInput.parentId,
          type: "file",
          encryptedKey: upload.encryptedFileKey,
          encryptedName: upload.encryptedFileName,
          fileKey: upload.fileKey,
          encryptedSize: upload.encryptedFileSize,
          encryptedType: upload.encryptedFileType,
          nameHash: upload.nameHash,
          createdAt: new Date(),
        };
      }
    );

    await db.insert(dataNodes).values(filesToInsert);

    revalidatePath("/dashboard");
  });
