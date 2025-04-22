"use server";

import { db } from "@/lib/drizzle";
import { uploadedFiles } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { checkSignature } from "./utils";

export const getUserFilesAction = authActionClient
  .metadata({ actionName: "getUserFilesAction" })
  .schema(
    z.object({
      signature: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    const userAvailableFiles = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.userId, ctx.session.user.id))
      .orderBy(desc(uploadedFiles.createdAt));

    return userAvailableFiles;
  });
