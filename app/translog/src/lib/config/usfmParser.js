// src/usfmParser.js
export function extractBookMetadata(usfmText) {
  let code = "";
  let name = "";

  const lines = usfmText.split("\n");

  for (const line of lines) {
    if (line.startsWith("\\id ")) {
      const rest = line.slice(4).trim();
      code = rest.split(" ")[0] || "";
    }

    if (line.startsWith("\\h ")) {
      name = line.slice(3).trim();
    }
  }

  return { code, name };
}