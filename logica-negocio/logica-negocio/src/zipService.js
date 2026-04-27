import JSZip from "jszip";

import { toMarkdown } from "./toMarkdown.js";

export function toZipBasename(session) {
  const date = new Date(session.createdAt);
  const formattedDate = date
    .toISOString()
    .replace(/:/g, "-")
    .substring(0, 19);
  const sanitizedBookId = session.bookId.replace(/[^a-zA-Z0-9]/g, "-");
  return `${sanitizedBookId}_${formattedDate}`;
}

export async function buildSessionZipBlob(session, comments) {
  const commentsByVerseKey = {};
  for (const c of comments) {
    const key = c.verseKey || "sin-verse";
    if (!commentsByVerseKey[key]) commentsByVerseKey[key] = [];
    commentsByVerseKey[key].push(c);
  }

  const markdown = toMarkdown(session, commentsByVerseKey);
  const zip = new JSZip();
  zip.file("acta.md", markdown);

  const blob = await zip.generateAsync({ type: "blob" });
  return blob;
}