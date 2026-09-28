// PostgreSQL/Prisma records use `id`. These helpers keep the edit forms working
// whether the API returns a nested language object, a `languageId`, or only a
// language code/name (which happens when responses are translated).
export const getId = (item) => item?.id ?? null;

export const resolveLanguageId = (entry, languages = []) => {
  if (!entry) return "";
  if (entry.languageId) return entry.languageId;
  const lang = entry.language;
  if (lang && typeof lang === "object") return lang.id ?? "";
  if (typeof lang === "string") {
    const match = languages.find(
      (l) => String(l.id) === lang || l.code === lang || l.name === lang
    );
    return match ? match.id : lang;
  }
  return "";
};

// Prisma `Int` columns reject strings such as "2" or "".
export const toInt = (value, fallback = 0) => {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
};
