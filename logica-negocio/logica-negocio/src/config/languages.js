import rawData from "../languages.json";

export const languages = rawData.entries;
export const getLanguageByCode = (lc) =>
  languages.find(lang => lang.lc === lc) || null;