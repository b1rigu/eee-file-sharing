"use server";

import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { s3Client } from "@/lib/s3";
import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { checkSignature } from "./utils";

export const abortMultipartUploadAction = authActionClient
  .metadata({ actionName: "abortMultipartUploadAction" })
  .schema(
    z.object({
      key: z.string(),
      uploadId: z.string().optional(),
      signature: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);
    
    const command = new AbortMultipartUploadCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: parsedInput.key,
      UploadId: parsedInput.uploadId,
    });

    await s3Client.send(command);
  });
