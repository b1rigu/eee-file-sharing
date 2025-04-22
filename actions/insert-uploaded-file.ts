"use server";

import { db } from "@/lib/drizzle";
import { uploadedFiles } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { checkSignature } from "./utils";

export const insertUploadedFileAction = authActionClient
  .metadata({ actionName: "insertUploadedFileAction" })
  .schema(
    z.object({
      validUploads: z
        .array(
          z.object({
            fileKey: z.string(),
            iv: z.string(),
            encryptedFileKey: z.string(),
            encryptedFileName: z.string(),
            encryptedFileType: z.string(),
            encryptedFileSize: z.string(),
          })
        )
        .min(1),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    const filesToInsert: (typeof uploadedFiles.$inferInsert)[] =
      parsedInput.validUploads.map((upload) => {
        return {
          id: uuidv4(),
          userId: ctx.session.user.id,
          fileKey: upload.fileKey,
          iv: upload.iv,
          encryptedFileKey: upload.encryptedFileKey,
          encryptedFileName: upload.encryptedFileName,
          encryptedFileSize: upload.encryptedFileSize,
          encryptedFileType: upload.encryptedFileType,
          createdAt: new Date(),
        };
      });

    await db.insert(uploadedFiles).values(filesToInsert);

    revalidatePath("/dashboard");
  });
