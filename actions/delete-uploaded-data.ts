"use server";

import { db } from "@/lib/drizzle";
import { dataNodes } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkSignature } from "./utils";
import { DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";

export const deleteUploadedDataAction = authActionClient
  .metadata({ actionName: "deleteUploadedDataAction" })
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
      throw new Error("Data not found");
    }

    if (uploadedData.userId !== ctx.session.user.id) {
      throw new Error("You do not have permission to delete this");
    }

    if (uploadedData.type === "file") {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: uploadedData.fileKey!,
      });

      await s3Client.send(deleteCommand);
    } else {
      const result = await db.execute(
        sql`
          WITH RECURSIVE descendants AS (
            SELECT id, type, file_key
            FROM data_nodes
            WHERE id = ${dataId}
      
            UNION ALL
      
            SELECT f.id, f.type, f.file_key
            FROM data_nodes f
            INNER JOIN descendants d ON f.parent_id = d.id
          )
          SELECT * FROM descendants
        `
      );

      const allNodes = result.rows as {
        id: string;
        type: string;
        file_key: string | null;
      }[];

      const fileKeysToDelete = allNodes
        .filter((node) => node.type === "file" && node.file_key)
        .map((node) => node.file_key!);

      if (fileKeysToDelete.length > 0) {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Delete: {
            Objects: fileKeysToDelete.map((key) => ({ Key: key })),
          },
        });

        await s3Client.send(deleteCommand);
      }
    }

    await db.delete(dataNodes).where(eq(dataNodes.id, dataId));

    revalidatePath("/dashboard");
  });
