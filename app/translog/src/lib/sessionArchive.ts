import JSZip from 'jszip';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import type { Language } from './types/types';
import { jsPDF } from 'jspdf';
import { getAudioBlob } from './audioBlobCache';

export interface ContractData {
  language: Language;
}

export class FsUserError extends Error {
  readonly code: 'cancelled' | 'quota' | 'unknown';
  constructor(message: string, code: 'cancelled' | 'quota' | 'unknown') {
    super(message);
    this.code = code;
    this.name = 'FsUserError';
  }
}

/**
 * Opens a file picker for a ZIP and returns its bytes as ArrayBuffer,
 * or null if the user cancelled.
 */
export async function pickAndReadZip(): Promise<ArrayBuffer | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('showOpenFilePicker' in window) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [handle] = await (window as any).showOpenFilePicker({
        types: [{ description: 'Archivos ZIP', accept: { 'application/zip': ['.zip'] } }],
        multiple: false,
      });
      const file = await handle.getFile();
      return await file.arrayBuffer();
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return null;
      console.warn('FSA API falló, usando fallback:', e);
    }
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.style.display = 'none';
    input.onchange = async () => {
      if (input.files && input.files.length > 0) {
        resolve(await input.files[0].arrayBuffer());
      } else {
        resolve(null);
      }
      document.body.removeChild(input);
    };
    input.oncancel = () => { resolve(null); document.body.removeChild(input); };
    document.body.appendChild(input);
    input.click();
  });
}

/** Converts a Blob to a raw base64 string (no data-URI prefix). */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Generates a human-readable Markdown report for the export. */
export function generateTranslogMarkdown(data: Language): string {
  const lines: string[] = [];
  const date = new Date().toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' });

  lines.push(`# Reporte de Translog`);
  lines.push(`\n**Idioma:** ${data.name} (${data.code})  `);
  lines.push(`**Fecha de exportación:** ${date}\n`);
  lines.push('---\n');

  for (const book of data.books) {
    lines.push(`## ${book.name} \`[${book.code}]\`\n`);

    for (const session of book.sessions) {
      const start = new Date(session.startDate).toLocaleString();
      const end = session.endDate ? new Date(session.endDate).toLocaleString() : 'En progreso';
      lines.push(`### Sesión ${session.id}${session.title ? ': ' + session.title : ''}`);
      lines.push(`- **Inicio:** ${start}`);
      lines.push(`- **Fin:** ${end}\n`);

      let rIdx = 1;
      for (const review of session.reviews) {
        const ref = review.reference as { chapterStart?: number; verseStart?: number; chapterEnd?: number; verseEnd?: number };
        lines.push(`#### Revisión ${rIdx++}`);
        lines.push(`> **Referencia:** Cap. ${ref.chapterStart ?? '?'}:${ref.verseStart ?? '?'} – Cap. ${ref.chapterEnd ?? '?'}:${ref.verseEnd ?? '?'}`);
        if (review.text) lines.push(`> \n> ${review.text}`);
        lines.push('');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((review.comments as any[]).length > 0) {
          lines.push('**Comments:**\n');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const c of review.comments as any[]) {
            const dateStr = new Date(c.date).toLocaleDateString();
            if (c.type === 'audio' && c.name) {
              const dur = c.audioDurationMs ? ` (${Math.round(c.audioDurationMs / 1000)}s)` : '';
              lines.push(`- **${c.author}** (${dateStr}): 🔊 [${c.name}${dur}](audios/${c.name})`);
            } else {
              lines.push(`- **${c.author}** (${dateStr}): ${c.text ?? ''}`);
            }
          }
          lines.push('');
        }
      }
    }
    lines.push('---\n');
  }

  return lines.join('\n');
}

/** Generates a human-readable PDF for the export and returns it as a Blob. */
export const generateTranslogPDF = (data: Language): Blob => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const mX = 14;           // left margin
  const pageW = pdf.internal.pageSize.getWidth();
  const contentW = pageW - mX * 2;
  const pageH = pdf.internal.pageSize.getHeight();
  let y = mX;

  const gap = (mm = 3) => { y += mm; };
  const needY = (mm: number) => {
    if (y + mm > pageH - mX) { pdf.addPage(); y = mX; }
  };

  const txt = (
    text: string,
    fontSize: number,
    rgb: [number, number, number],
    style: 'normal' | 'bold' | 'italic',
    indent = 0,
    maxW = contentW,
  ) => {
    needY(fontSize * 0.5 + 1);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...rgb);
    pdf.setFont('helvetica', style);
    const wrapped = pdf.splitTextToSize(text, maxW - indent);
    pdf.text(wrapped, mX + indent, y);
    y += wrapped.length * (fontSize * 0.42) + 0.5;
  };

  const hRule = (rgb: [number, number, number] = [220, 220, 220], lw = 0.2) => {
    pdf.setDrawColor(...rgb);
    pdf.setLineWidth(lw);
    pdf.line(mX, y, pageW - mX, y);
    gap(2);
  };

  const dateISO = new Date().toISOString().slice(0, 10);

  // ── Cover line ──────────────────────────────────────────────────────────────
  txt('Translog', 20, [44, 62, 80], 'bold');
  txt(`${data.name}  ·  ${dateISO}`, 9, [140, 140, 140], 'normal');
  gap(4);
  hRule([44, 62, 80], 0.5);

  for (const book of data.books) {
    needY(14);
    gap(2);
    // ── Book name ─────────────────────────────────────────────────────────────
    txt(book.name, 15, [22, 160, 133], 'bold');
    gap(1);
    hRule();

    for (const session of book.sessions) {
      needY(12);
      // ── Session: title + compact date range on one line ───────────────────
      const sTitle = session.title ?? '';
      const sStart = new Date(session.startDate).toLocaleDateString();
      const sEnd   = session.endDate ? new Date(session.endDate).toLocaleDateString() : '\u2026';
      txt(sTitle, 11, [41, 128, 185], 'bold');
      txt(`${sStart}  \u2192  ${sEnd}`, 8, [160, 160, 160], 'normal');
      gap(2);

      for (const review of session.reviews) {
        needY(10);
        const ref = review.reference as { chapterStart?: number; verseStart?: number; chapterEnd?: number; verseEnd?: number };
        // ── Verse reference (small, muted) ───────────────────────────────────
        const refStr = `${ref.chapterStart ?? '?'}:${ref.verseStart ?? '?'}\u2013${ref.chapterEnd ?? '?'}:${ref.verseEnd ?? '?'}`;
        txt(refStr, 8, [150, 150, 150], 'normal', 4);
        gap(1);

        // ── Blockquote (left bar + italic) ────────────────────────────────────
        if (review.text) {
          const qIndent = 8;
          const wrapped = pdf.splitTextToSize(review.text, contentW - qIndent - 2);
          const lineH   = 10 * 0.42;
          const blockH  = wrapped.length * lineH + 2;
          needY(blockH + 2);
          pdf.setDrawColor(22, 160, 133);
          pdf.setLineWidth(0.8);
          pdf.line(mX + 4, y - 2.5, mX + 4, y - 2.5 + blockH);
          pdf.setLineWidth(0.2);
          pdf.setDrawColor(0);
          pdf.setFontSize(10);
          pdf.setTextColor(70, 70, 70);
          pdf.setFont('helvetica', 'italic');
          pdf.text(wrapped, mX + qIndent, y);
          y += blockH;
        }
        gap(2);

        // ── Comments (no header — author+date is enough context) ──────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const c of review.comments as any[]) {
          needY(8);
          const dateStr = new Date(c.date).toLocaleDateString();
          // Author · date on its own small line
          txt(`${c.author}  \u00b7  ${dateStr}`, 7.5, [120, 120, 120], 'normal', 6);
          if (c.type === 'audio' && c.name) {
            const dur = c.audioDurationMs ? `  ${Math.round(c.audioDurationMs / 1000)}s` : '';
            // ♪ U+266A is in Helvetica
            txt(`\u266A  audios/${c.name}${dur}`, 8.5, [80, 80, 80], 'normal', 8, contentW - 8);
          } else if (c.text) {
            txt(c.text, 9, [50, 50, 50], 'normal', 8, contentW - 8);
          }
          gap(1.5);
        }
        gap(1);
        hRule([230, 230, 230]);
      }
      gap(2);
    }
    gap(3);
  }

  return pdf.output('blob');
};

/**
 * Builds and downloads a ZIP archive containing:
 *   - data.json               (structured data for re-import)
 *   - report_YYYY-MM-DD.md   (human-readable Markdown)
 *   - report_YYYY-MM-DD.pdf  (human-readable PDF)
 *   - audios/{filename}       (flat folder of all audio files)
 */
export async function downloadProjectAsZip(
  data: ContractData,
  filename: string,
  _audioList?: { name: string; uri: string; path: string }[],
): Promise<void> {
  const zip = new JSZip();
  const audiosFolder = zip.folder('audios');
  const dateTag = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Collect all audio comments across every book/session/review
  for (const book of data.language.books) {
    for (const session of book.sessions) {
      for (const review of session.reviews) {
        for (const comment of review.comments) {
          if (comment.type === 'audio' && comment.path) {
            const audioName = comment.name ?? `audio_${comment.id}`;
            try {
              if (Capacitor.isNativePlatform()) {
                const file = await Filesystem.readFile({ path: comment.path, directory: Directory.Data });
                audiosFolder?.file(audioName, file.data as string, { base64: true });
              } else {
                const blob = getAudioBlob(comment.id);
                if (blob) {
                  const b64 = await blobToBase64(blob);
                  audiosFolder?.file(audioName, b64, { base64: true });
                } else {
                  console.warn('Audio not found in cache, skipping:', comment.path);
                }
              }
            } catch (e) {
              console.warn('Could not include audio in ZIP:', comment.path, e);
            }
          }
        }
      }
    }
  }

  // Strip large USFM content from books — it's not needed for import and
  // would bloat the archive significantly.
  const exportData: ContractData = {
    language: {
      ...data.language,
      books: data.language.books.map(({ content: _content, ...rest }) => rest as typeof data.language.books[0]),
    },
  };
  zip.file('data.json', JSON.stringify(exportData, null, 2));

  try {
    zip.file(`report_${dateTag}.md`, generateTranslogMarkdown(data.language));
  } catch (e) {
    console.error('Error generating Markdown:', e);
  }

  try {
    const pdfBlob = generateTranslogPDF(data.language);
    zip.file(`report_${dateTag}.pdf`, pdfBlob);
  } catch (e) {
    console.error('Error generating PDF:', e);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  await downloadBlobCompatible(blob, `${filename}.zip`);
}

/**
 * Reads a ZIP buffer, restores audio files, and returns the parsed contract
 * JSON alongside a map of filename → Blob for web platforms.
 *
 * - Native: audio files are written to Directory.Data (Filesystem).
 * - Web: audio files are returned as Blobs in `audioByFilename` so the caller
 *   can cache them via audioBlobCache after comment IDs are assigned.
 */
export async function importFromZip(
  buffer: ArrayBuffer,
): Promise<{ contract: unknown; audioByFilename: Record<string, Blob> }> {
  const zip = await JSZip.loadAsync(buffer);
  const audioByFilename: Record<string, Blob> = {};

  // Match audio files in the flat audios/ folder (new format) or any nested
  // audios/ subfolder (legacy format produced by older exports).
  const audioFiles = Object.entries(zip.files).filter(
    ([name, f]) => !f.dir && /(?:^|\/audios\/)([^/]+\.(webm|m4a|aac|ogg|mp3))$/i.test(name),
  );

  for (const [zipPath, file] of audioFiles) {
    const fileName = zipPath.split('/').pop()!;
    const storagePath = `comments/audios/${fileName}`;

    if (Capacitor.isNativePlatform()) {
      const base64 = await file.async('base64');
      try {
        await Filesystem.mkdir({ path: 'comments/audios', directory: Directory.Data, recursive: true });
        await Filesystem.writeFile({ path: storagePath, data: base64, directory: Directory.Data });
      } catch (e) {
        console.warn('Could not restore audio (native):', storagePath, e);
      }
    } else {
      // Web: collect blobs; audioBlobCache stores them after comment IDs are assigned.
      audioByFilename[fileName] = await file.async('blob');
    }
  }

  // Support data.json (current), datos.json, and contract.json (legacy).
  const contractFile = zip.file('data.json') ?? zip.file('datos.json') ?? zip.file('contract.json');
  if (!contractFile) throw new Error('ZIP does not contain data.json');
  const contractText = await contractFile.async('string');
  return { contract: JSON.parse(contractText), audioByFilename };
}

async function downloadBlobCompatible(blob: Blob, fullFilename: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(blob);
      await Filesystem.writeFile({
        path: fullFilename,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });
      return;
    } catch (e) {
      console.error('Error al guardar en carpeta nativa, usando fallback web:', e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('showSaveFilePicker' in window) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handle = await (window as any).showSaveFilePicker({ suggestedName: fullFilename });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return;
      console.warn('showSaveFilePicker falló, usando fallback <a>:', e);
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fullFilename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}
