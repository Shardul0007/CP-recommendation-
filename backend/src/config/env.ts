import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "test" | "production";

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const nodeEnv = (process.env.NODE_ENV ?? "development") as NodeEnv;

export const env = Object.freeze({
  nodeEnv,
  port: parseNumber(process.env.PORT, 4000),
  mongodbUri:
    process.env.MONGODB_URI ??
    (nodeEnv === "test"
      ? "mongodb://127.0.0.1:27017/cp-recommendation-test"
      : "mongodb://127.0.0.1:27017/cp-recommendation"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  codeforcesApiBaseUrl:
    process.env.CODEFORCES_API_BASE_URL ?? "https://codeforces.com/api",
  requestTimeoutMs: parseNumber(process.env.REQUEST_TIMEOUT_MS, 10000)
});
