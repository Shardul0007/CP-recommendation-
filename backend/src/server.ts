import app from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./config/database";
import { env } from "./config/env";

const listenOnPort = async (
  port: number
): Promise<{ server: ReturnType<typeof app.listen>; port: number }> =>
  new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      resolve({ server, port });
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        server.close(() => {
          void listenOnPort(port + 1).then(resolve).catch(reject);
        });
        return;
      }

      reject(error);
    });
  });

const startServer = async (): Promise<void> => {
  await connectToDatabase();

  const { server, port } = await listenOnPort(env.port);
  console.log(`Backend listening on http://localhost:${port}`);

  const shutdown = async (): Promise<void> => {
    server.close(async () => {
      await disconnectFromDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

startServer().catch((error) => {
  console.error("Failed to start backend.", error);
  process.exit(1);
});
