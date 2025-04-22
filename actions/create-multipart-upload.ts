"use server";

import { authActionClient } from "@/lib/safe-action";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { s3Client } from "@/lib/s3";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";

export const createMultipartUploadAction = authActionClient
  .metadata({ actionName: "createMultipartUploadAction" })
  .schema(
    z.object({
      fileExtension: z.string().nullable(),
    })
  )
  .action(async ({ ctx, parsedInput: { fileExtension } }) => {
    const filePath =
      ctx.session.user.id +
      "/" +
      uuidv4() +
      `${fileExtension ? `.${fileExtension}` : ""}`;

    const command = new CreateMultipartUploadCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: filePath,
    });

    const data = await s3Client.send(command);

    return {
      key: data.Key!,
      uploadId: data.UploadId!,
    };
  });
