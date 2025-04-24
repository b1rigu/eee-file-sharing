"use server";

import { db } from "@/lib/drizzle";
import { dataNodes } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { checkSignature } from "./utils";

export const getUserDataAction = authActionClient
  .metadata({ actionName: "getUserDataAction" })
  .schema(
    z.object({
      signature: z.string(),
      parentId: z.string().optional(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    if (!parsedInput.parentId) {
      return await db
        .select()
        .from(dataNodes)
        .where(and(eq(dataNodes.userId, ctx.session.user.id), isNull(dataNodes.parentId)))
        .orderBy(desc(dataNodes.createdAt));
    }

    const parentExists = await db
      .select()
      .from(dataNodes)
      .where(eq(dataNodes.id, parsedInput.parentId));

    if (parentExists.length === 0) {
      throw new Error("Parent folder not found");
    }

    return await db
      .select()
      .from(dataNodes)
      .where(
        and(eq(dataNodes.userId, ctx.session.user.id), eq(dataNodes.parentId, parsedInput.parentId))
      )
      .orderBy(
        sql`CASE WHEN ${dataNodes.type} = 'folder' THEN 0 WHEN ${dataNodes.type} = 'file' THEN 1 ELSE 2 END`,
        desc(dataNodes.createdAt)
      );
  });
