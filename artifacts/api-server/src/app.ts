import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check before Clerk middleware (no auth required)
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

// Global error handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  const clerkUserId = (req as any).clerkUserId || "unauthenticated";
  
  console.error("\n[LexAI API ERROR]");
  console.error(`method: ${req.method}`);
  console.error(`route: ${req.url}`);
  console.error(`authenticated user ID: ${clerkUserId}`);
  console.error(`error type: ${err.name || typeof err}`);
  console.error(`error message: ${err.message || String(err)}`);
  console.error(`stack trace:\n${err.stack}\n`);

  res.status(500).json({
    error: "Internal server error",
    message: "Unable to process the request"
  });
});

export default app;
