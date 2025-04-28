"use server";

import { db } from "@/lib/drizzle";
import { dataNodes, sharedFiles, user, userKeys } from "@/lib/drizzle/schema";
import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { checkSignature } from "./utils";
import { eq } from "drizzle-orm";

export const shareFileAction = authActionClient
  .metadata({ actionName: "shareFileAction" })
  .schema(
    z.object({
      signature: z.string(),
      receiverEmail: z.string(),
      nodeId: z.string(),
      encryptedKey: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    await checkSignature(parsedInput.signature, ctx.session.user.id);

    const userToShareWith = await db
      .select({
        publicKey: userKeys.publicKey,
        userId: user.id,
      })
      .from(user)
      .where(eq(user.email, parsedInput.receiverEmail))
      .leftJoin(userKeys, eq(userKeys.userId, user.id))
      .limit(1);

    if (userToShareWith.length === 0 || !userToShareWith[0].publicKey) {
      throw new Error("User not found or they have not set up their key");
    }

    if (userToShareWith[0].userId === ctx.session.user.id) {
      throw new Error("You cannot share a file with yourself");
    }

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

    await db.insert(sharedFiles).values({
      id: uuidv4(),
      receiverId: userToShareWith[0].userId,
      dataNodeId: parsedInput.nodeId,
      encryptedKey: parsedInput.encryptedKey,
      createdAt: new Date(),
    });
  });
