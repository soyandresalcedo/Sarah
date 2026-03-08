#!/usr/bin/env node
import { readFileSync } from "node:fs";

const STOPWORDS = new Set([
  "de",
  "la",
  "que",
  "el",
  "en",
  "y",
  "a",
  "los",
  "del",
  "se",
  "las",
  "por",
  "un",
  "para",
  "con",
  "no",
  "una",
  "su",
  "al",
  "lo",
  "como",
  "más",
  "pero",
  "sus",
  "le",
  "ya",
  "o",
  "este",
  "sí",
  "porque",
  "esta",
  "entre",
  "cuando",
  "muy",
  "sin",
  "sobre",
  "también",
  "me",
  "hasta",
  "hay",
  "donde",
  "quien",
  "desde",
  "todo",
  "nos",
  "durante",
  "todos",
  "uno",
  "les",
  "ni",
  "contra",
  "otros",
  "ese",
  "eso",
  "ante",
  "ellos",
  "e",
  "esto",
  "mí",
  "antes",
  "algunos",
  "qué",
  "unos",
  "yo",
  "otro",
  "otras",
  "otra",
  "él",
  "tanto",
  "esa",
  "estos",
  "mucho",
  "quienes",
  "nada",
  "muchos",
  "cual",
  "poco",
  "ella",
  "estar",
  "estas",
  "algunas",
  "algo",
  "nosotros",
  "mi",
  "mis",
  "tú",
  "te",
  "ti",
  "tu",
  "tus",
  "ellas",
  "nosotras",
  "vosotros",
  "vosotras",
  "os",
  "mío",
  "mía",
  "míos",
  "mías",
  "tuyo",
  "tuya",
  "tuyos",
  "tuyas",
  "suyo",
  "suya",
  "suyos",
  "suyas",
  "nuestro",
  "nuestra",
  "nuestros",
  "nuestras",
  "vuestro",
  "vuestra",
  "vuestros",
  "vuestras",
  "esos",
  "esas",
  "estoy",
  "estás",
  "está",
  "estamos",
  "estáis",
  "están",
  "esté",
  "estés",
  "estemos",
  "estéis",
  "estén",
  "estaré",
  "estarás",
  "estará",
  "estaremos",
  "estaréis",
  "estarán",
  "estaría",
  "estarías",
  "estaríamos",
  "estaríais",
  "estarían",
  "estaba",
  "estabas",
  "estábamos",
  "estabais",
  "estaban",
  "estuve",
  "estuviste",
  "estuvo",
  "estuvimos",
  "estuvisteis",
  "estuvieron",
  "estuviera",
  "estuvieras",
  "estuviéramos",
  "estuvierais",
  "estuvieran",
  "estuviese",
  "estuvieses",
  "estuviésemos",
  "estuvieseis",
  "estuviesen",
  "estando",
  "estado",
  "estada",
  "estados",
  "estadas",
  "estad",
]);

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(text) {
  const words = normalizeText(text).split(" ");
  const counts = new Map();
  for (const word of words) {
    if (!word || word.length < 3) continue;
    if (STOPWORDS.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return counts;
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
  if (!apiUrl) throw new Error("Falta GHOST_API_URL");
  if (!key) throw new Error("Falta GHOST_CONTENT_API_KEY");

  const limit = Number(getArg("--limit") || "10");
  const url = new URL("/ghost/api/content/posts/", apiUrl.replace(/\/+$/, ""));
  url.searchParams.set("key", key);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("fields", "id,title,slug,primary_tag,created_at");
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Ghost Content API ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  const posts = json?.posts || [];

  const keywordCounts = new Map();
  for (const post of posts) {
    const text = `${post.title || ""} ${(post.primary_tag?.name || "").trim()}`;
    const counts = extractKeywords(text);
    for (const [word, count] of counts.entries()) {
      keywordCounts.set(word, (keywordCounts.get(word) || 0) + count);
    }
  }

  const topKeywords = Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => `${word} (${count})`);

  const out = {
    total: posts.length,
    posts: posts.map((p) => ({
      title: p.title,
      tag: p.primary_tag?.name || null,
      created_at: p.created_at,
    })),
    top_keywords: topKeywords,
  };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
