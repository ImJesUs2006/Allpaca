import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsOrigins, env, isProd } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import { authRouter } from "./modules/auth/routes.js";
import { communitiesRouter } from "./modules/communities/routes.js";
import { messagesRouter } from "./modules/messages/routes.js";
import { ordersRouter } from "./modules/orders/routes.js";
import { productsRouter } from "./modules/products/routes.js";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      // `false` en vez de un regex lax: sin allowlist no se refleja el origen.
      origin: isProd ? corsOrigins : ["http://localhost:4200", "http://localhost:5173", ...corsOrigins],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(isProd ? "combined" : "dev"));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "allpaca-api", env: env.NODE_ENV });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/communities", communitiesRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/messages", messagesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
