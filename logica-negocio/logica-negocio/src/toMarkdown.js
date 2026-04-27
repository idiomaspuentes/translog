export function toMarkdown(session, commentsByVerseKey) {
  const head = `# Acta de sesión\n\n`;
  const meta = `- Libro: ${session.bookLabel} (${session.bookId})\n`;
  const lang = `- Idioma: ${session.language || "N/A"}\n`;
  const date = `- Fecha: ${new Date(session.createdAt).toLocaleString()}\n\n`;

  let body = "";

  const sortedKeys = Object.keys(commentsByVerseKey).sort();

  for (const key of sortedKeys) {
    const cs = commentsByVerseKey[key];
    if (cs.length === 0) continue;

    body += `### Versículo ${key}\n\n`;

    for (const c of cs) {
      body += `- ${c.content}\n`;
    }
    body += "\n";
  }

  return head + meta + lang + date + body;
}