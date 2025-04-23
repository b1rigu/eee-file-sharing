"use server";

import { db } from "@/lib/drizzle";
import { dataNodes } from "@/lib/drizzle/schema";
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
      dataId: z.string(),
      signature: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput: { dataId, signature } }) => {
    await checkSignature(signature, ctx.session.user.id);

    const uploadedData = await db.query.dataNodes.findFirst({
      where: eq(dataNodes.id, dataId),
    });

    if (!uploadedData) {
      throw new Error("File not found");
    }

    if (uploadedData.userId !== ctx.session.user.id) {
      throw new Error("You do not have permission to download this file");
    }

    if (uploadedData.type !== "file") {
      throw new Error("This is not a file");
    }

    const putCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: uploadedData.fileKey!,
    });

    const url = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 3600,
    });

    return {
      url: url,
    };
  });
