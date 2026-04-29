import rawData from "../languages.json";

export const languages = rawData.entries;

export const getLanguageByCode = (lc) =>
  languages.find(lang => lang.lc === lc) || null;

export const searchLanguages = (query) => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return languages.filter(lang =>
    lang.lc?.toLowerCase().includes(q) ||
    lang.ln?.toLowerCase().includes(q) ||
    lang.ang?.toLowerCase().includes(q)
  );
};