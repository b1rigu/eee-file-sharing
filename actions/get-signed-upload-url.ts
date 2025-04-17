"use server";

import { minioClient } from "@/lib/minio";
import { authActionClient } from "@/lib/safe-action";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { checkSignature } from "./utils";

export const getSignedUploadUrlAction = authActionClient
  .metadata({ actionName: "getSignedUploadUrlAction" })
  .schema(
    z.object({
      fileName: z.string(),
      signature: z.string(),
      signatureMessage: z.string(),
    })
  )
  .action(
    async ({ ctx, parsedInput: { fileName, signature, signatureMessage } }) => {
      await checkSignature(signature, signatureMessage, ctx.session.user.id);

      const splitted = fileName.split(".");
      const extension =
        splitted.length > 1 ? splitted[splitted.length - 1] : null;
      const filePath =
        ctx.session.user.id +
        "/" +
        uuidv4() +
        `${extension ? `.${extension}` : ""}`;
      const url = await minioClient.presignedPutObject(
        "uploaded-files",
        filePath,
        1000
      );

      return {
        url: url,
        filePath: filePath,
      };
    }
  );
