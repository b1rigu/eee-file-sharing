"use server";

import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { s3Client } from "@/lib/s3";
import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";

export const abortMultipartUploadAction = authActionClient
  .metadata({ actionName: "abortMultipartUploadAction" })
  .schema(
    z.object({
      key: z.string(),
      uploadId: z.string().optional(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    const command = new AbortMultipartUploadCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: parsedInput.key,
      UploadId: parsedInput.uploadId,
    });

    await s3Client.send(command);
  });
