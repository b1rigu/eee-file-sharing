"use server";

import { db } from "@/lib/drizzle";
import { dataNodes } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { checkSignature } from "./utils";
import { eq } from "drizzle-orm";

export const changeDataParentAction = authActionClient
  .metadata({ actionName: "changeDataParentAction" })
  .schema(
    z.object({
      signature: z.string(),
      newParentId: z.string().nullable(),
      dataId: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    const dataNode = await db
      .select()
      .from(dataNodes)
      .where(eq(dataNodes.id, parsedInput.dataId))
      .limit(1);
    if (dataNode.length === 0) {
      throw new Error("Data not found");
    }

    if (dataNode[0].userId !== ctx.session.user.id) {
      throw new Error("You do not have access to this data");
    }

    if (parsedInput.newParentId === dataNode[0].parentId) {
      throw new Error("New parent is the same as current parent");
    }

    if (parsedInput.newParentId) {
      const folderNode = await db
        .select()
        .from(dataNodes)
        .where(eq(dataNodes.id, parsedInput.newParentId))
        .limit(1);
      if (folderNode.length === 0) {
        throw new Error("Folder not found");
      }

      if (folderNode[0].userId !== ctx.session.user.id) {
        throw new Error("You do not have access to this folder");
      }
    }

    await db
      .update(dataNodes)
      .set({ parentId: parsedInput.newParentId })
      .where(eq(dataNodes.id, parsedInput.dataId));
  });
