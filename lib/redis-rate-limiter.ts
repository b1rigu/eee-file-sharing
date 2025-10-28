import { redisClient } from "./redis";

export async function slidingWindowRateLimiter(
  limit: number,
  windowSizeSeconds: number,
  subWindowSizeSeconds: number,
  limitKey: string
) {
  await redisClient.connect();
  const key = `rate_limiter:${limitKey}`;
  const subWindowCounts = await redisClient.hGetAll(key);
  const totalCount = Object.values(subWindowCounts).reduce(
    (acc, count) => acc + parseInt(count),
    0
  );

  const isAllowed = totalCount < limit;

  if (isAllowed) {
    const currentTime = Date.now();
    const subWindowSizeMillis = subWindowSizeSeconds * 1000;
    const currentSubWindow = Math.floor(currentTime / subWindowSizeMillis);

    const transaction = redisClient.multi();
    transaction.hIncrBy(key, currentSubWindow.toString(), 1);
    transaction.hExpire(
      key,
      currentSubWindow.toString(),
      windowSizeSeconds,
      "NX"
    );
    const result = await transaction.exec();
    await redisClient.disconnect();

    if (result.length === 0) throw new Error("Redis Error");
  }

  return isAllowed;
}
