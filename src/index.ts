import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { pageHtml } from "./html";
import { uploadFileWithPinarkiveSdk } from "./pinarkive";

export type Env = {
  PINARKIVE_API_KEY: string;
  PINARKIVE_API_BASE_URL: string;
  /** Optional; forwarded as SDK `clusterId` (`cl`) */
  PINARKIVE_CLUSTER_ID?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.html(pageHtml()));

app.post("/api/upload", async (c) => {
  const apiKey = c.env.PINARKIVE_API_KEY?.trim();
  const baseUrlFromEnv = c.env.PINARKIVE_API_BASE_URL?.trim();
  const clusterId = c.env.PINARKIVE_CLUSTER_ID?.trim();

  if (!apiKey) {
    return c.json(
      {
        ok: false,
        cid: null,
        data: null,
        error:
          "Missing PINARKIVE_API_KEY. See README and the environment example file in this repository.",
      },
      500
    );
  }

  let body: unknown;
  try {
    body = await c.req.parseBody();
  } catch {
    return c.json(
      { ok: false, cid: null, data: null, error: "Invalid multipart body." },
      400
    );
  }

  const record =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  const entry = record?.["file"];

  if (entry === undefined || typeof entry === "string") {
    return c.json(
      { ok: false, cid: null, data: null, error: "No file provided." },
      400
    );
  }

  if (!(entry instanceof Blob)) {
    return c.json(
      {
        ok: false,
        cid: null,
        data: null,
        error: "No file provided.",
      },
      400
    );
  }

  const { result, httpStatus } = await uploadFileWithPinarkiveSdk(entry, {
    apiKey,
    baseUrlFromEnv,
    clusterId,
  });
  return c.json(result, httpStatus as ContentfulStatusCode);
});

export default app;
