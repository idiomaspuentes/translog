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
          lines.push('**Comentarios:**\n');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const c of review.comments as any[]) {
            const dateStr = new Date(c.date).toLocaleDateString();
            const body = c.text ? c.text : `*[audio ${c.audioDurationMs ? Math.round(c.audioDurationMs / 1000) + 's' : ''}]*`;
            lines.push(`- **${c.author}** (${dateStr}): ${body}`);
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
  const marginX = 15;
  const pageW = pdf.internal.pageSize.getWidth() - marginX * 2;
  const pageH = pdf.internal.pageSize.getHeight();
  let y = marginX;

  const newline = (extra = 0) => { y += 4 + extra; };
  const checkPage = (needed = 8) => {
    if (y + needed > pageH - marginX) { pdf.addPage(); y = marginX; }
  };

  const line = (
    text: string,
    fontSize: number,
    rgb: [number, number, number] = [51, 51, 51],
    style: 'normal' | 'bold' = 'normal',
    indent = 0,
  ) => {
    checkPage(fontSize * 0.5 + 2);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...rgb);
    pdf.setFont('helvetica', style);
    const lines = pdf.splitTextToSize(text, pageW - indent);
    pdf.text(lines, marginX + indent, y);
    y += lines.length * fontSize * 0.42 + 1;
  };

  // Title
  line('Reporte de Translog', 18, [44, 62, 80], 'bold');
  newline();
  line(`Idioma: ${data.name} (${data.code})`, 11);
  newline(2);

  for (const book of data.books) {
    checkPage(14);
    line(`LIBRO: ${book.name.toUpperCase()} [${book.code}]`, 14, [22, 160, 133], 'bold');
    newline();

    for (const session of book.sessions) {
      checkPage(12);
      line(`Sesión ${session.id}${session.title ? ': ' + session.title : ''}`, 12, [41, 128, 185], 'bold', 5);
      const start = new Date(session.startDate).toLocaleString();
      const end = session.endDate ? new Date(session.endDate).toLocaleString() : 'En progreso';
      line(`Inicio: ${start}   Fin: ${end}`, 9, [100, 100, 100], 'normal', 5);
      newline();

      let rIdx = 1;
      for (const review of session.reviews) {
        checkPage(10);
        const ref = review.reference as { chapterStart?: number; verseStart?: number; chapterEnd?: number; verseEnd?: number };
        line(`Revisión ${rIdx++}`, 11, [80, 80, 80], 'bold', 10);
        line(
          `Referencia: Cap. ${ref.chapterStart ?? '?'}:${ref.verseStart ?? '?'} – Cap. ${ref.chapterEnd ?? '?'}:${ref.verseEnd ?? '?'}`,
          9, [120, 120, 120], 'normal', 10,
        );
        if (review.text) line(review.text, 10, [60, 60, 60], 'normal', 10);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((review.comments as any[]).length > 0) {
          newline();
          line('Comentarios:', 10, [80, 80, 80], 'bold', 12);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const c of review.comments as any[]) {
            const dateStr = new Date(c.date).toLocaleDateString();
            const body = c.text ? c.text : '[audio]';
            line(`• ${c.author} (${dateStr}): ${body}`, 9, [60, 60, 60], 'normal', 14);
          }
        }
        newline();
      }
      newline();
    }
    newline(2);
  }

  return pdf.output('blob');
};

/**
 * Builds and downloads a ZIP archive containing:
 *   - contract.json (full session data)
 *   - LECTURA_HUMANA.pdf (human-readable report)
 *   - Audio files embedded at their original relative paths
 *
 * Audio files are read directly from Filesystem using each comment's stored
 * `path` field (Directory.Data-relative), so no separate `audioList` scan
 * is required.  The optional `audioList` parameter is kept for backward
 * compatibility but is no longer used internally.
 */
export async function downloadProjectAsZip(
  data: ContractData,
  filename: string,
  _audioList?: { name: string; uri: string; path: string }[],
): Promise<void> {
  const zip = new JSZip();
  const langCode = data.language.code;
  const langFolder = zip.folder(langCode);

  for (const book of data.language.books) {
    const bookFolder = langFolder?.folder(book.code);
    for (const session of book.sessions) {
      const sessionFolder = bookFolder?.folder(`sesion_${session.id}`);
      const reviewsFolder = sessionFolder?.folder('revisiones');
      let rIdx = 1;
      for (const review of session.reviews) {
        const reviewFolder = reviewsFolder?.folder(`revision_${rIdx++}`);
        reviewFolder?.file('revision.json', JSON.stringify(review, null, 2));
        for (const comment of review.comments) {
          if (comment.type === 'audio' && comment.path) {
            const audioFolder = reviewFolder?.folder('audios');
            audioFolder?.file(`${comment.name}.json`, JSON.stringify(comment, null, 2));
            try {
              if (Capacitor.isNativePlatform()) {
                // Native: read directly from Filesystem
                const file = await Filesystem.readFile({ path: comment.path, directory: Directory.Data });
                audioFolder?.file(comment.name ?? `audio_${comment.id}`, file.data as string, { base64: true });
              } else {
                // Web: retrieve blob from in-memory / sessionStorage cache
                const blob = getAudioBlob(comment.id);
                if (blob) {
                  const b64 = await blobToBase64(blob);
                  audioFolder?.file(comment.name ?? `audio_${comment.id}`, b64, { base64: true });
                } else {
                  console.warn('No se pudo incluir audio en ZIP (no encontrado en caché):', comment.path);
                }
              }
            } catch (e) {
              console.warn('No se pudo incluir audio en ZIP:', comment.path, e);
            }
          }
        }
      }
    }
  }

  zip.file('contract.json', JSON.stringify(data, null, 2));

  try {
    zip.file('reporte.md', generateTranslogMarkdown(data.language));
  } catch (e) {
    console.error('Error generando Markdown:', e);
  }

  try {
    const pdfBlob = generateTranslogPDF(data.language);
    zip.file('reporte.pdf', pdfBlob);
  } catch (e) {
    console.error('Error generando PDF:', e);
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

  const audioFiles = Object.entries(zip.files).filter(
    ([name, f]) => !f.dir && /\/audios\/[^/]+\.(webm|m4a|aac|ogg|mp3)$/i.test(name),
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
        console.warn('No se pudo restaurar audio (native):', storagePath, e);
      }
    } else {
      // Web: collect blobs; they'll be cached by audioBlobCache after import
      // assigns stable comment IDs.
      audioByFilename[fileName] = await file.async('blob');
    }
  }

  const contractFile = zip.file('contract.json');
  if (!contractFile) throw new Error('El ZIP no contiene contract.json');
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
