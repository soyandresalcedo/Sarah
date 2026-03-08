#!/usr/bin/env node
import process from "node:process";

function getArg(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function run() {
  const query = getArg("--query", getArg("-q"));
  const type = (getArg("--type", "search") || "search").toLowerCase();
  const country = (getArg("--country", "us") || "us").toLowerCase();
  const language = (getArg("--language", "en") || "en").toLowerCase();
  const num = Math.min(Math.max(toInt(getArg("--num", "5"), 5), 1), 20);

  if (!query) {
    throw new Error("Falta --query \"<busqueda>\"");
  }

  if (!["search", "news"].includes(type)) {
    throw new Error('Tipo inválido. Usa --type "search" o "news".');
  }

  const apiKey = process.env.SERPER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Falta la variable de entorno SERPER_API_KEY.");
  }

  const endpoint =
    type === "news"
      ? "https://google.serper.dev/news"
      : "https://google.serper.dev/search";

  const payload = {
    q: query,
    num,
    gl: country,
    hl: language,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const detail = data?.message || data?.error || JSON.stringify(data) || "Sin detalle";
    throw new Error(`Serper API ${res.status}: ${detail}`);
  }

  const rawResults = type === "news" ? data?.news || [] : data?.organic || [];
  const results = rawResults.map((item) => ({
    title: item?.title || "",
    link: item?.link || "",
    snippet: item?.snippet || "",
    source: item?.source || "",
    date: item?.date || "",
    position: item?.position ?? null,
  }));

  const output = {
    ok: true,
    type,
    query,
    country,
    language,
    results,
  };

  console.log(JSON.stringify(output, null, 2));
}

run().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
