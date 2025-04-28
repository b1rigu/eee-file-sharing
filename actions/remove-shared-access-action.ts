"use server";

import { db } from "@/lib/drizzle";
import { dataNodes, sharedFiles } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { checkSignature } from "./utils";
import { and, eq } from "drizzle-orm";

export const removeSharedAccessAction = authActionClient
  .metadata({ actionName: "removeSharedAccessAction" })
  .schema(
    z.object({
      signature: z.string(),
      receiverId: z.string(),
      nodeId: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    const dataNode = await db
      .select()
      .from(dataNodes)
      .where(eq(dataNodes.id, parsedInput.nodeId))
      .limit(1);

    if (dataNode.length === 0) {
      throw new Error("Data node not found");
    }

    if (dataNode[0].userId !== ctx.session.user.id) {
      throw new Error("You do not have access to this data node");
    }

    await db
      .delete(sharedFiles)
      .where(
        and(
          eq(sharedFiles.receiverId, parsedInput.receiverId),
          eq(sharedFiles.dataNodeId, parsedInput.nodeId)
        )
      );
  });
