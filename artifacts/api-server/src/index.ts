import app from "./app";
import { logger } from "./lib/logger";
import { store } from "./lib/store";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Initialize JSON file store before accepting requests
store.init().then(() => {
  logger.info("Store initialized — using JSON file database (no PostgreSQL needed)");

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Nebula Panel API listening");
  });
}).catch((err) => {
  logger.error({ err }, "Failed to initialize store");
  process.exit(1);
});
