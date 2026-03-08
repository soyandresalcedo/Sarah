#!/usr/bin/env node
import crypto from "node:crypto";
import path from "node:path";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";

function loadEnvFiles() {
  const candidates = [
    new URL("./.env", import.meta.url).pathname,
    path.join(process.cwd(), ".env"),
    "/data/workspace/.env",
    "/data/workspace/research/.env",
    "/data/workspace/ghost/.env",
  ];
  for (const p of candidates) {
    try {
      if (!existsSync(p)) continue;
      const raw = readFileSync(p, "utf8");
      let loaded = 0;
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 1) continue;
        const k = trimmed.slice(0, eq).trim();
        const v = trimmed.slice(eq + 1).trim().replace(/^"|"$/g, "");
        if (!process.env[k]) { process.env[k] = v; loaded++; }
      }
      if (loaded > 0) console.error(`[ghost-post] loaded ${loaded} vars from ${p}`);
    } catch { /* skip */ }
  }
}
loadEnvFiles();

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signGhostJwt(adminKey) {
  const [id, secretHex] = adminKey.split(":");
  if (!id || !secretHex) {
    throw new Error("GHOST_ADMIN_API_KEY inválida (esperado: id:secret)");
  }
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT", kid: id };
  const payload = { iat: now, exp: now + 5 * 60, aud: "/admin/" };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", Buffer.from(secretHex, "hex"))
    .update(signingInput)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${signingInput}.${signature}`;
}

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function parseTags(value) {
  if (!value) return undefined;
  const tags = value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return tags.length ? tags : undefined;
}

async function ghostFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Ghost ${token}`,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Ghost API ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function getLatestDraftId(apiUrl, token) {
  const url = new URL("/ghost/api/admin/posts/", apiUrl.replace(/\/+$/, ""));
  url.searchParams.set("filter", "status:draft");
  url.searchParams.set("order", "updated_at desc");
  url.searchParams.set("limit", "1");
  url.searchParams.set("fields", "id,updated_at");
  const json = await ghostFetch(url, token);
  const post = json?.posts?.[0];
  if (!post?.id) {
    throw new Error("No se encontró ningún draft para actualizar");
  }
  return { id: post.id, updated_at: post.updated_at };
}

async function getPostMeta(apiUrl, token, id) {
  const url = new URL(`/ghost/api/admin/posts/${id}/`, apiUrl.replace(/\/+$/, ""));
  url.searchParams.set("fields", "id,updated_at");
  const json = await ghostFetch(url, token);
  const post = json?.posts?.[0];
  if (!post?.id || !post?.updated_at) {
    throw new Error("No se pudo obtener updated_at del post");
  }
  return { id: post.id, updated_at: post.updated_at };
}

async function findDraftByTitle(apiUrl, token, title) {
  const url = new URL("/ghost/api/admin/posts/", apiUrl.replace(/\/+$/, ""));
  url.searchParams.set("filter", "status:draft");
  url.searchParams.set("order", "updated_at desc");
  url.searchParams.set("limit", "50");
  url.searchParams.set("fields", "id,title,updated_at");
  const json = await ghostFetch(url, token);
  const posts = json?.posts || [];
  const needle = title.trim().toLowerCase();
  const exact = posts.find(
    (post) => post?.title?.trim().toLowerCase() === needle
  );
  if (exact?.id && exact?.updated_at) {
    return { id: exact.id, updated_at: exact.updated_at };
  }
  const partial = posts.find((post) => {
    const hay = post?.title?.trim().toLowerCase();
    if (!hay) return false;
    return hay.includes(needle) || needle.includes(hay);
  });
  if (!partial?.id || !partial?.updated_at) {
    throw new Error("No se encontró ningún draft con ese título");
  }
  return { id: partial.id, updated_at: partial.updated_at };
}

async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

async function main() {
  const apiUrl = process.env.GHOST_API_URL?.trim();
  const adminKey = process.env.GHOST_ADMIN_API_KEY?.trim();
  if (!apiUrl || !adminKey) {
    console.error(`[ghost-post] ENV check — GHOST_API_URL: ${apiUrl ? "set" : "MISSING"}, GHOST_ADMIN_API_KEY: ${adminKey ? "set" : "MISSING"}`);
    console.error(`[ghost-post] cwd: ${process.cwd()}, script: ${import.meta.url}`);
  }
  if (!apiUrl) throw new Error("Falta GHOST_API_URL");
  if (!adminKey) throw new Error("Falta GHOST_ADMIN_API_KEY");

  const title = getArg("--title");
  let html = getArg("--html");
  const htmlFile = getArg("--html-file");
  const status = getArg("--status") || "draft";
  const tags = parseTags(getArg("--tags"));
  const excerpt = getArg("--excerpt") || undefined;
  const featureImage = getArg("--feature-image") || undefined;
  const slug = getArg("--slug") || undefined;
  const metaTitle = getArg("--meta-title") || undefined;
  const metaDescription = getArg("--meta-description") || undefined;
  const canonicalUrl = getArg("--canonical") || undefined;
  const postId = getArg("--id");
  const updateTitle = getArg("--update-title");
  const updateLatest = process.argv.includes("--update-latest");

  if (!title) throw new Error("Falta --title");
  if (!html && htmlFile) {
    html = readFileSync(htmlFile, "utf8").trim();
  }
  if (!html) {
    const fallbackFiles = ["./ghost-draft.html", "./tmp-admissions-roi.html"];
    for (const fallbackFile of fallbackFiles) {
      if (existsSync(fallbackFile)) {
        html = readFileSync(fallbackFile, "utf8").trim();
        break;
      }
    }
  }
  if (!html) {
    try {
      const htmlCandidates = readdirSync(".")
        .filter((name) => name.endsWith(".html") && name.startsWith("tmp-"))
        .map((name) => ({ name, mtime: statSync(name).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);
      if (htmlCandidates.length) {
        html = readFileSync(htmlCandidates[0].name, "utf8").trim();
      }
    } catch {
      // ignore
    }
  }
  if (!html && !process.stdin.isTTY) {
    html = (await readStdin()).trim();
  }
  if (!html) throw new Error("Falta --html o contenido por stdin");

  // Lossless HTML: wrap in Ghost HTML card so Lexical stores it as-is
  if (!html.includes("<!--kg-card-begin: html-->")) {
    html = `<!--kg-card-begin: html-->\n${html}\n<!--kg-card-end: html-->`;
  }

  const token = signGhostJwt(adminKey);
  let targetId = postId || null;
  let updatedAt = null;
  if (updateTitle && !postId) {
    const match = await findDraftByTitle(apiUrl, token, updateTitle);
    targetId = match.id;
    updatedAt = match.updated_at;
  } else if (updateLatest && !postId) {
    const latest = await getLatestDraftId(apiUrl, token);
    targetId = latest.id;
    updatedAt = latest.updated_at;
  }
  if (targetId && !updatedAt) {
    const meta = await getPostMeta(apiUrl, token, targetId);
    updatedAt = meta.updated_at;
  }

  const body = {
    posts: [
      {
        ...(targetId ? { id: targetId, updated_at: updatedAt } : {}),
        title,
        html,
        status,
        tags,
        excerpt,
        feature_image: featureImage,
        slug,
        meta_title: metaTitle,
        meta_description: metaDescription,
        canonical_url: canonicalUrl,
      },
    ],
  };
  const method = targetId ? "PUT" : "POST";
  const url = targetId
    ? new URL(`/ghost/api/admin/posts/${targetId}/`, apiUrl.replace(/\/+$/, ""))
    : new URL("/ghost/api/admin/posts/", apiUrl.replace(/\/+$/, ""));
  url.searchParams.set("source", "html");

  console.error(`[ghost-post] ${method} ${url.pathname} — ${html.length} chars de HTML`);

  const json = await ghostFetch(url, token, { method, body: JSON.stringify(body) });
  const post = json?.posts?.[0];

  const createdId = post?.id;
  if (createdId) {
    const verifyUrl = new URL(
      `/ghost/api/admin/posts/${createdId}/`,
      apiUrl.replace(/\/+$/, ""),
    );
    verifyUrl.searchParams.set("formats", "html");
    const verify = await ghostFetch(verifyUrl, token);
    const savedHtml = verify?.posts?.[0]?.html || "";
    if (savedHtml.trim().length < 20) {
      console.error(
        `[ghost-post] WARN: post creado pero HTML parece vacío (${savedHtml.length} chars)`,
      );
    } else {
      console.error(
        `[ghost-post] OK: post verificado con ${savedHtml.length} chars de HTML`,
      );
    }
  }

  const out = post?.url || post?.id || "OK";
  process.stdout.write(`${out}\n`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
