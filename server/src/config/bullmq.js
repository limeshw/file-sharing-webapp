import IORedis from "ioredis";

export const createBullMQConnection = (type = "producer") => {
  const isWorker = type === "worker";

  return new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: isWorker ? null : 1,
    enableReadyCheck: false,
  });
};
