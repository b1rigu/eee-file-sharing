"use server";

import { db } from "@/lib/drizzle";
import { uploadedFiles } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkSignature } from "./utils";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";

export const deleteUploadedFileAction = authActionClient
  .metadata({ actionName: "deleteUploadedFileAction" })
  .schema(
    z.object({
      fileId: z.string(),
      signature: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput: { fileId, signature } }) => {
    await checkSignature(signature, ctx.session.user.id);

    const uploadedFile = await db.query.uploadedFiles.findFirst({
      where: eq(uploadedFiles.id, fileId),
    });

    if (!uploadedFile) {
      throw new Error("File not found");
    }

    if (uploadedFile.userId !== ctx.session.user.id) {
      throw new Error("You do not have permission to delete this file");
    }

    await db.delete(uploadedFiles).where(eq(uploadedFiles.id, fileId));

    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: uploadedFile.fileKey,
    });

    await s3Client.send(deleteCommand);

    revalidatePath("/dashboard");
  });
