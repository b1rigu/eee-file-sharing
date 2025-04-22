"use server";

import { db } from "@/lib/drizzle";
import { uploadedFiles } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { checkSignature } from "./utils";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3";

export const getSignedDownloadUrlAction = authActionClient
  .metadata({ actionName: "getSignedDownloadUrlAction" })
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
      throw new Error("You do not have permission to download this file");
    }

    const putCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: uploadedFile.fileKey,
    });

    const url = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 3600,
    });

    return {
      url: url,
    };
  });
