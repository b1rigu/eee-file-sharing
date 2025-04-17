"use server";

import { auth } from "@/lib/auth";
import { authActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

export const signOutAction = authActionClient
  .metadata({ actionName: "signOutAction" })
  .action(async () => {
    const data = await auth.api.signOut({
      headers: await headers(),
    });

    if (!data.success) {
      throw new Error("Failed to sign out");
    }

    revalidatePath("/", "layout");
    redirect("/", RedirectType.replace);
  });
