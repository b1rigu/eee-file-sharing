import { createClient } from "redis";

const options: {
  url?: string;
} = {};

if (process.env.REDIS_URL) {
  options.url = process.env.REDIS_URL;
}

export const redisClient = createClient(options)
  .on("error", (err) => console.log("Redis Client Error", err))
  .on("ready", () => console.log("Redis Client Ready"));
