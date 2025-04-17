"use server";

import { db } from "@/lib/drizzle";
import { fileAccess, uploadedFiles } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { checkSignature } from "./utils";

export const insertUploadedFileAction = authActionClient
  .metadata({ actionName: "insertUploadedFileAction" })
  .schema(
    z.object({
      filePath: z.string(),
      encryptedFileKey: z.string(),
      iv: z.string(),
      fileInfo: z.object({
        name: z.string(),
        type: z.string(),
        size: z.string(),
      }),
      signature: z.string(),
      signatureMessage: z.string(),
    })
  )
  .action(
    async ({
      ctx,
      parsedInput: { filePath, fileInfo, encryptedFileKey, iv, signature, signatureMessage },
    }) => {
      await checkSignature(signature, signatureMessage, ctx.session.user.id);

      const fileId = uuidv4();
      await db.transaction(async (tx) => {
        await tx.insert(uploadedFiles).values({
          id: fileId,
          fileName: fileInfo.name,
          fileType: fileInfo.type,
          fileSize: fileInfo.size,
          filePath: filePath,
          createdAt: new Date(),
        });
        await tx.insert(fileAccess).values({
          id: uuidv4(),
          fileId: fileId,
          userId: ctx.session.user.id,
          encryptedFileKey: encryptedFileKey,
          iv: iv,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      revalidatePath("/dashboard");
    }
  );
