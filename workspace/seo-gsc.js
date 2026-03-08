#!/usr/bin/env node
const DEFAULT_API_BASE = "http://localhost:8080";
const DEFAULT_ENDPOINT = "summary";

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function normalizeBool(value) {
  if (value == null) return null;
  const v = String(value).toLowerCase().trim();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return null;
}

async function main() {
  const apiBase =
    (getArg("--api-base") || process.env.OPENCLAW_SEO_API_BASE || DEFAULT_API_BASE).trim();
  const apiKey =
    (getArg("--api-key") || process.env.OPENCLAW_SEO_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("Falta OPENCLAW_SEO_API_KEY");
  }

  const dimensions = (getArg("--dimensions") || "").trim();
  const searchType = (getArg("--searchType") || "").trim();
  const filterDimension = (getArg("--filterDimension") || "").trim();
  const filterOperator = (getArg("--filterOperator") || "").trim();
  const filterExpression = (getArg("--filterExpression") || "").trim();

  const endpoint = dimensions
    ? "explore"
    : (getArg("--endpoint") || DEFAULT_ENDPOINT).trim();

  const siteUrl = (getArg("--siteUrl") || process.env.OPENCLAW_GSC_SITE_URL || "").trim();
  const days = (getArg("--days") || "").trim();
  const compare = (getArg("--compare") || "").trim();
  const startDate = (getArg("--startDate") || "").trim();
  const endDate = (getArg("--endDate") || "").trim();
  const rowLimit = (getArg("--rowLimit") || "").trim();
  const startRow = (getArg("--startRow") || "").trim();
  const includeInsights = normalizeBool(getArg("--includeInsights"));

  const url = new URL(`/api/seo/gsc/${endpoint}`, apiBase);
  if (siteUrl) url.searchParams.set("siteUrl", siteUrl);
  if (days) url.searchParams.set("days", days);
  if (compare) url.searchParams.set("compare", compare);
  if (startDate) url.searchParams.set("startDate", startDate);
  if (endDate) url.searchParams.set("endDate", endDate);
  if (rowLimit) url.searchParams.set("rowLimit", rowLimit);
  if (startRow) url.searchParams.set("startRow", startRow);
  if (dimensions) url.searchParams.set("dimensions", dimensions);
  if (searchType) url.searchParams.set("searchType", searchType);
  if (filterDimension) url.searchParams.set("filterDimension", filterDimension);
  if (filterOperator) url.searchParams.set("filterOperator", filterOperator);
  if (filterExpression) url.searchParams.set("filterExpression", filterExpression);
  if (includeInsights !== null) {
    url.searchParams.set("includeInsights", String(includeInsights));
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    let message = text;
    try {
      const parsed = JSON.parse(text);
      message = parsed?.error || parsed?.message || JSON.stringify(parsed);
    } catch {
      // keep raw text
    }
    throw new Error(message);
  }

  process.stdout.write(`${text.trim()}\n`);
}

main().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
