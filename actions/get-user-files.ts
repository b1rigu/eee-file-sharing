"use server";

import { db } from "@/lib/drizzle";
import { fileAccess, uploadedFiles } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { checkSignature } from "./utils";

export const getUserFilesAction = authActionClient
  .metadata({ actionName: "getUserFilesAction" })
  .schema(
    z.object({
      signature: z.string(),
      signatureMessage: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(
      parsedInput.signature,
      parsedInput.signatureMessage,
      ctx.session.user.id
    );

    const userAvailableFiles = await db
      .select()
      .from(fileAccess)
      .where(eq(fileAccess.userId, ctx.session.user.id))
      .leftJoin(uploadedFiles, eq(fileAccess.fileId, uploadedFiles.id))
      .orderBy(desc(uploadedFiles.createdAt));

    return userAvailableFiles;
  });
