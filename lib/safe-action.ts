import { createMiddleware, createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { getIp } from "../utils/get-ip";
import { auth } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { slidingWindowRateLimiter } from "./redis-rate-limiter";

export const loggingMiddleware = createMiddleware<{
  metadata: { actionName: string };
}>().define(async ({ next, clientInput, metadata }) => {
  const startTime = performance.now();
  const result = await next();
  const endTime = performance.now();

  if (process.env.NODE_ENV === "development") {
    console.log("LOGGING MIDDLEWARE");
    console.log("Result ->", result);
    console.log("Client input ->", clientInput);
    console.log("Metadata ->", metadata);
    console.log("Action execution took", endTime - startTime, "ms");
  }

  return result;
});

export const actionClient = createSafeActionClient({
  defaultValidationErrorsShape: "flattened",
  handleServerError(e) {
    console.error("Action error:", e.message);
    return e.message;
  },
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
}).use(loggingMiddleware);

export const unauthenticatedActionClient = actionClient.use(
  async ({ next }) => {
    
    // const ip = await getIp();
    // if (!ip) {
    //   throw new Error("Rate limit exceeded");
    // }
    // const isAllowed = await slidingWindowRateLimiter(5, 60, 20, `${ip}-global`);
    // if (!isAllowed) {
    //   throw new Error("Rate limit exceeded");
    // }

    return next();
  }
);

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // const isAllowed = await slidingWindowRateLimiter(5, 60, 20, `${session.user.id}-global`);
  // if (!isAllowed) {
  //   throw new Error("Rate limit exceeded");
  // }

  return next({ ctx: { session: session } });
});
