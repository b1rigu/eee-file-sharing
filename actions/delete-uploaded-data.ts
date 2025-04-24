"use server";

import { db } from "@/lib/drizzle";
import { dataNodes } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkSignature } from "./utils";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";

export const deleteUploadedDataAction = authActionClient
  .metadata({ actionName: "deleteUploadedDataAction" })
  .schema(
    z.object({
      dataIds: z.array(z.string()).min(1),
      signature: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput: { dataIds, signature } }) => {
    await checkSignature(signature, ctx.session.user.id);

    const uploadedDataList = await db
      .select()
      .from(dataNodes)
      .where(inArray(dataNodes.id, dataIds));

    if (uploadedDataList.length !== dataIds.length) {
      throw new Error("Wrong ids provided or server error");
    }

    if (uploadedDataList.some((data) => data.userId !== ctx.session.user.id)) {
      throw new Error("You do not have permission to delete some of these");
    }

    const dataWithTypeFile = uploadedDataList.filter((data) => data.type === "file");

    const dataWithTypeFolder = uploadedDataList.filter((data) => data.type === "folder");

    let keysToDelete: string[] = [];

    if (dataWithTypeFile.length > 0) {
      keysToDelete = keysToDelete.concat(dataWithTypeFile.map((data) => data.fileKey!));
    }

    if (dataWithTypeFolder.length > 0) {
      const result = await db.execute(
        sql`
          WITH RECURSIVE descendants AS (
            SELECT id, type, file_key
            FROM data_nodes
            WHERE id IN (${sql.join(
              dataWithTypeFolder.map((data) => sql`${data.id}`),
              sql`, `
            )})
      
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

      keysToDelete = keysToDelete.concat(fileKeysToDelete);
    }

    if (keysToDelete.length > 0) {
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Delete: {
          Objects: keysToDelete.map((key) => ({ Key: key })),
        },
      });

      await s3Client.send(deleteCommand);
    }

    await db.delete(dataNodes).where(inArray(dataNodes.id, dataIds));

    revalidatePath("/dashboard");
  });
