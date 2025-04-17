import { headers } from "next/headers";

export async function getIp() {
  // cf-connecting-ip is in header if using cloudflare
  const realIp = (await headers()).get("cf-connecting-ip");
  console.log("realIp", realIp);

  if (realIp) {
    return realIp.trim();
  }

  if (process.env.NODE_ENV === "development") {
    return "127.0.0.1";
  }

  return null;
}
