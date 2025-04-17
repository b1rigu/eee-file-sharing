"use server";

import { db } from "@/lib/drizzle";
import { uploadedFiles } from "@/lib/drizzle/schema";
import { minioClient } from "@/lib/minio";
import { authActionClient } from "@/lib/safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkSignature } from "./utils";

export const deleteUploadedFileAction = authActionClient
  .metadata({ actionName: "deleteUploadedFileAction" })
  .schema(
    z.object({
      fileId: z.string(),
      signature: z.string(),
      signatureMessage: z.string(),
    })
  )
  .action(
    async ({ ctx, parsedInput: { fileId, signature, signatureMessage } }) => {
      await checkSignature(signature, signatureMessage, ctx.session.user.id);

      const uploadedFile = await db.query.uploadedFiles.findFirst({
        where: eq(uploadedFiles.id, fileId),
        with: {
          fileAccess: true,
        },
      });

      if (!uploadedFile) {
        throw new Error("File not found");
      }

      if (
        uploadedFile.fileAccess.findIndex(
          (fileAccess) => fileAccess.userId === ctx.session.user.id
        ) === -1
      ) {
        throw new Error("You do not have permission to delete this file");
      }

      await db.delete(uploadedFiles).where(eq(uploadedFiles.id, fileId));

      await minioClient.removeObject("uploaded-files", uploadedFile.filePath);

      revalidatePath("/dashboard");
    }
  );
