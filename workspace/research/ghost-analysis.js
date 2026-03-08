#!/usr/bin/env node
import { readFileSync } from "node:fs";
const DEFAULT_LIMIT = 100;
const STOPWORDS = new Set([
  "a","al","algo","algunos","ante","antes","como","con","contra","cual","cuales","cuando",
  "de","del","desde","donde","dos","el","ella","ellas","ellos","en","entre","era","es","esa",
  "esas","ese","eso","esos","esta","estaba","estamos","estan","estas","este","esto","estos",
  "fue","ha","haber","hace","hacia","han","hasta","hay","la","las","le","les","lo","los",
  "mas","más","me","mi","mis","muy","ni","no","nos","o","para","pero","por","que","qué",
  "se","sin","sobre","su","sus","tambien","también","te","ti","tu","tus","un","una","uno",
  "unos","y","ya","en","si","sí","porque","qué","cómo","porqué","entre","hoy","ayer",
]);

function normWord(word) {
  return word
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim();
}

function countWords(text, counts) {
  const parts = text.split(/\s+/);
  for (const p of parts) {
    const w = normWord(p);
    if (!w || w.length < 3 || STOPWORDS.has(w)) continue;
    counts[w] = (counts[w] || 0) + 1;
  }
}

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

async function fetchPage(apiUrl, key, page, limit) {
  const url = new URL("/ghost/api/content/posts/", apiUrl.replace(/\/+$/, ""));
  url.searchParams.set("key", key);
  url.searchParams.set("filter", "status:published");
  url.searchParams.set("include", "tags");
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Ghost Content API ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

async function main() {
  let apiUrl = (getArg("--api-url") || process.env.GHOST_API_URL || "").trim();
  let key = (getArg("--content-key") || process.env.GHOST_CONTENT_API_KEY || "").trim();
  if ((!apiUrl || !key) && !getArg("--api-url") && !getArg("--content-key")) {
    try {
      const envRaw = readFileSync(new URL("./.env", import.meta.url), "utf8");
      for (const line of envRaw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const k = trimmed.slice(0, eq).trim();
        const v = trimmed.slice(eq + 1).trim().replace(/^"|"$/g, "");
        if (!process.env[k]) process.env[k] = v;
      }
      apiUrl = apiUrl || (process.env.GHOST_API_URL || "").trim();
      key = key || (process.env.GHOST_CONTENT_API_KEY || "").trim();
    } catch {
      // ignore
    }
  }
  if ((!apiUrl || !key) && !getArg("--api-url") && !getArg("--content-key")) {
    try {
      const config = JSON.parse(
        readFileSync(
          new URL("./ghost-config.json", import.meta.url),
          "utf8",
        ),
      );
      apiUrl = apiUrl || String(config.apiUrl || "").trim();
      key = key || String(config.contentKey || "").trim();
    } catch {
      // ignore
    }
  }
  if (!apiUrl) throw new Error("Falta GHOST_API_URL");
  if (!key) throw new Error("Falta GHOST_CONTENT_API_KEY");

  const limitArgRaw = getArg("--limit");
  const limitArg = limitArgRaw ? Number.parseInt(limitArgRaw, 10) : DEFAULT_LIMIT;
  const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : DEFAULT_LIMIT;

  let page = 1;
  let pages = 1;
  const posts = [];
  const wordCounts = {};
  const tagCounts = {};

  while (page <= pages) {
    const data = await fetchPage(apiUrl, key, page, limit);
    const items = data.posts || [];
    for (const p of items) {
      const tags = (p.tags || []).map((t) => t.name).filter(Boolean);
      for (const t of tags) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      }
      const title = p.title || "";
      countWords(title, wordCounts);
      posts.push({
        id: p.id,
        title,
        tags,
        published_at: p.published_at,
        url: p.url,
      });
    }
    pages = data.meta?.pagination?.pages || 1;
    page += 1;
  }

  const topKeywords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({ word, count }));

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([tag, count]) => ({ tag, count }));

  const out = {
    total: posts.length,
    posts,
    topKeywords,
    topTags,
  };

  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
