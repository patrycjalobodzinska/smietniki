import { type NextRequest, NextResponse } from "next/server";
import http from "node:http";
import https from "node:https";

/**
 * Same-origin API proxy.
 *
 * The browser calls `/api/v1/...` on the frontend's own origin; this handler
 * forwards to the real backend (API_PROXY_TARGET) server-side and relays the
 * response — rewriting `Set-Cookie` so the auth cookie lands as a first-party
 * cookie on the frontend domain. That sidesteps third-party-cookie blocking
 * (Safari/ITP, Chrome, Firefox strict) when the API is on a different domain.
 *
 * Forwarding uses the Node http/https module rather than global fetch: the
 * SprigaAPI backend (behind Cloudflare) rejects undici's fingerprint with a
 * 500, while Node's own client works like a browser/curl.
 *
 * Enable by setting NEXT_PUBLIC_API_URL=/api (client) and, optionally,
 * API_PROXY_TARGET=<backend base url> (server; defaults to SprigaAPI).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TARGET = (process.env.API_PROXY_TARGET ?? "https://spriga-api.essa.sx").replace(/\/$/, "");

const STRIP_REQUEST = new Set(["host", "connection", "content-length", "accept-encoding"]);
const STRIP_RESPONSE = new Set(["transfer-encoding", "connection", "keep-alive", "content-length"]);

/** Make a backend Set-Cookie first-party to this origin. */
function rewriteSetCookie(cookie: string, isHttps: boolean): string {
  let out = cookie.replace(/;\s*Domain=[^;]*/i, ""); // bind to the frontend host
  if (!isHttps) {
    // Over http (dev): a Secure cookie is dropped, and SameSite=None requires
    // Secure — so strip Secure and relax SameSite to Lax.
    out = out.replace(/;\s*Secure/i, "");
    out = out.replace(/;\s*SameSite=None/i, "; SameSite=Lax");
  }
  return out;
}

async function proxy(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const targetUrl = new URL(`${TARGET}/${(path ?? []).join("/")}${request.nextUrl.search}`);
  const mod = targetUrl.protocol === "http:" ? http : https;

  const outHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!STRIP_REQUEST.has(key.toLowerCase())) outHeaders[key] = value;
  });
  outHeaders["accept-encoding"] = "identity"; // relay uncompressed for simplicity

  const method = request.method.toUpperCase();
  const bodyBuf =
    method === "GET" || method === "HEAD" ? undefined : Buffer.from(await request.arrayBuffer());
  if (bodyBuf && bodyBuf.length > 0) outHeaders["content-length"] = String(bodyBuf.length);

  const isHttps =
    (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "")) === "https";

  return new Promise<NextResponse>((resolve) => {
    const req = mod.request(
      targetUrl,
      {
        method,
        headers: outHeaders,
        // path/search already encoded in targetUrl
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c as Buffer));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          const resHeaders = new Headers();
          for (const [k, v] of Object.entries(res.headers)) {
            const key = k.toLowerCase();
            if (key === "set-cookie" || STRIP_RESPONSE.has(key) || v == null) continue;
            if (Array.isArray(v)) v.forEach((val) => resHeaders.append(k, val));
            else resHeaders.set(k, String(v));
          }
          const out = new NextResponse(buf, { status: res.statusCode ?? 502, headers: resHeaders });
          const sc = res.headers["set-cookie"];
          if (Array.isArray(sc)) {
            for (const cookie of sc) out.headers.append("set-cookie", rewriteSetCookie(cookie, isHttps));
          }
          resolve(out);
        });
      },
    );
    req.on("error", (e) =>
      resolve(NextResponse.json({ error: "proxy_error", message: String(e) }, { status: 502 })),
    );
    if (bodyBuf && bodyBuf.length > 0) req.write(bodyBuf);
    req.end();
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
