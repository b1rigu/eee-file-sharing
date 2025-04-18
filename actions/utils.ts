import { db } from "@/lib/drizzle";
import { userKeys } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { base64ToUint8Array } from "@/utils/utils";

export async function checkSignature(
  signature: string,
  message: string,
  userId: string
) {
  const userKey = await db.query.userKeys.findFirst({
    where: eq(userKeys.userId, userId),
  });

  if (!userKey) {
    throw new Error("Key not found");
  }

  const binaryKey = base64ToUint8Array(userKey.publicKey);
  const importedPublicKey = await crypto.subtle.importKey(
    "spki",
    binaryKey,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    true,
    ["verify"]
  );

  const isValid = await crypto.subtle.verify(
    {
      name: "RSA-PSS",
      saltLength: 32,
    },
    importedPublicKey,
    base64ToUint8Array(signature),
    new TextEncoder().encode(message)
  );

  if (!isValid) {
    throw new Error("Invalid signature");
  }
}
