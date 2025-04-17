"use server";

import { db } from "@/lib/drizzle";
import { uploadedFiles } from "@/lib/drizzle/schema";
import { minioClient } from "@/lib/minio";
import { authActionClient } from "@/lib/safe-action";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const getSignedDownloadUrlAction = authActionClient
  .metadata({ actionName: "getSignedDownloadUrlAction" })
  .schema(
    z.object({
      fileId: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput: { fileId } }) => {
    const uploadedFile = await db.query.uploadedFiles.findFirst({
      where: eq(uploadedFiles.id, fileId),
      with: {
        fileAccess: true,
      },
    });

    if (!uploadedFile) {
      throw new Error("File not found");
    }

    if (
      uploadedFile.fileAccess.findIndex(
        (fileAccess) => fileAccess.userId === ctx.session.user.id
      ) === -1
    ) {
      throw new Error("You do not have permission to download this file");
    }

    const url = await minioClient.presignedGetObject(
      "uploaded-files",
      uploadedFile.filePath,
      60 * 5
    );

    return {
      url: url,
    };
  });
