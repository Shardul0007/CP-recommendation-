import app from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./config/database";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  await connectToDatabase();

  const server = app.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
  });

  const shutdown = async (): Promise<void> => {
    server.close(async () => {
      await disconnectFromDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};
console.log("SERVER FILE LOADED", new Date().toISOString());

startServer().catch((error) => {
  console.error("Failed to start backend.", error);
  process.exit(1);
});