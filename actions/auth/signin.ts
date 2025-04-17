"use server";

import { unauthenticatedActionClient } from "@/lib/safe-action";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const signInWithGoogleAction = unauthenticatedActionClient
  .metadata({ actionName: "signInWithGoogleAction" })
  .action(async () => {
    const data = await auth.api.signInSocial({
      body: {
        provider: "google",
        callbackURL: "/dashboard",
        disableRedirect: true,
      },
    });

    if (!data.url) {
      throw new Error("No redirect URL");
    }

    redirect(data.url);
  });
