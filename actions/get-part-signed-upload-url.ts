"use server";

import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { s3Client } from "@/lib/s3";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SIGNED_URL_EXPIRATION } from "@/app.config";
import { checkSignature } from "./utils";

export const getPartSignedUploadUrlAction = authActionClient
  .metadata({ actionName: "getPartSignedUploadUrlAction" })
  .schema(
    z.object({
      key: z.string(),
      uploadId: z.string().optional(),
      partNumber: z.number().int().min(1).max(10000),
      signature: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    const command = new UploadPartCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: parsedInput.key,
      UploadId: parsedInput.uploadId,
      PartNumber: parsedInput.partNumber,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: SIGNED_URL_EXPIRATION,
    });

    return {
      url: url,
      expires: SIGNED_URL_EXPIRATION,
    };
  });
