"use server";

import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { s3Client } from "@/lib/s3";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { checkSignature } from "./utils";

export const completeMultipartUploadAction = authActionClient
  .metadata({ actionName: "completeMultipartUploadAction" })
  .schema(
    z.object({
      key: z.string(),
      uploadId: z.string().optional(),
      parts: z.array(
        z.object({
          PartNumber: z.number().int().min(1).max(10000),
          ETag: z.string(),
        })
      ),
      signature: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);
    
    const command = new CompleteMultipartUploadCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: parsedInput.key,
      UploadId: parsedInput.uploadId,
      MultipartUpload: {
        Parts: parsedInput.parts,
      },
    });

    const data = await s3Client.send(command);

    return {
      location: data.Location,
    };
  });
