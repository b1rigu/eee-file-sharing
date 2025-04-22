import { db } from "@/lib/drizzle";
import { userKeys } from "@/lib/drizzle/schema";
import { verifyRSASignedMessage } from "@/utils/crypto/crypto";
import { eq } from "drizzle-orm";

export async function checkSignature(signature: string, userId: string) {
  const userKey = await db.query.userKeys.findFirst({
    where: eq(userKeys.userId, userId),
  });

  if (!userKey) {
    throw new Error("Key not found");
  }

  const isValid = await verifyRSASignedMessage(signature, userKey.publicKey);

  if (!isValid) {
    throw new Error("Invalid signature");
  }
}
