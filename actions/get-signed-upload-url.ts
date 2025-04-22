"use server";

import { authActionClient } from "@/lib/safe-action";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { checkSignature } from "./utils";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getSignedUploadUrlAction = authActionClient
  .metadata({ actionName: "getSignedUploadUrlAction" })
  .schema(
    z.object({
      fileExtension: z.string().nullable(),
      signature: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput: { fileExtension, signature } }) => {
    await checkSignature(signature, ctx.session.user.id);

    const filePath =
      ctx.session.user.id +
      "/" +
      uuidv4() +
      `${fileExtension ? `.${fileExtension}` : ""}`;

    const putCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: filePath,
    });

    const url = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 3600,
    });

    return {
      url: url,
      filePath: filePath,
    };
  });
