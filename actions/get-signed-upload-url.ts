"use server";

import { authActionClient } from "@/lib/safe-action";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { checkSignature } from "./utils";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "@/lib/drizzle";
import { dataNodes } from "@/lib/drizzle/schema";
import { and, eq, isNull } from "drizzle-orm";

export const getSignedUploadUrlAction = authActionClient
  .metadata({ actionName: "getSignedUploadUrlAction" })
  .schema(
    z.object({
      parentId: z.string().nullable(),
      nameHash: z.string(),
      fileExtension: z.string().nullable(),
      signature: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput: { fileExtension, signature, parentId, nameHash } }) => {
    await checkSignature(signature, ctx.session.user.id);

    if (parentId) {
      const parentData = await db
        .select()
        .from(dataNodes)
        .where(and(eq(dataNodes.id, parentId), eq(dataNodes.userId, ctx.session.user.id)))
        .limit(1);

      if (parentData.length === 0) {
        throw new Error("Parent folder not found or not yours");
      }
    }

    if (parentId) {
      const fileExists = await db
        .select()
        .from(dataNodes)
        .where(
          and(
            eq(dataNodes.nameHash, nameHash),
            eq(dataNodes.parentId, parentId),
            eq(dataNodes.type, "file"),
            eq(dataNodes.userId, ctx.session.user.id)
          )
        )
        .limit(1);
      if (fileExists.length !== 0) {
        throw new Error("File with same name already exists");
      }
    } else {
      const fileExists = await db
        .select()
        .from(dataNodes)
        .where(
          and(
            eq(dataNodes.nameHash, nameHash),
            isNull(dataNodes.parentId),
            eq(dataNodes.type, "file"),
            eq(dataNodes.userId, ctx.session.user.id)
          )
        )
        .limit(1);
      if (fileExists.length !== 0) {
        throw new Error("File with same name already exists");
      }
    }

    const filePath =
      ctx.session.user.id + "/" + uuidv4() + `${fileExtension ? `.${fileExtension}` : ""}`;

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
