"use server";

import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { s3Client } from "@/lib/s3";
import { ListPartsCommand, Part } from "@aws-sdk/client-s3";
import { checkSignature } from "./utils";

export const listUploadPartsAction = authActionClient
  .metadata({ actionName: "listUploadPartsAction" })
  .schema(
    z.object({
      key: z.string(),
      uploadId: z.string().optional(),
      signature: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    const parts: Part[] = [];

    async function listPartsPage(startsAt?: string) {
      const command = new ListPartsCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: parsedInput.key,
        UploadId: parsedInput.uploadId,
        PartNumberMarker: startsAt,
      });
      const data = await s3Client.send(command);
      if (data.Parts) parts.push(...data.Parts);

      if (data.IsTruncated) {
        return await listPartsPage(data.NextPartNumberMarker);
      } else {
        return parts;
      }
    }

    return await listPartsPage();
  });
