import JSZip from 'jszip';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

/** 
 * Interfaces basadas en contract.json 
 */
export interface Comment {
  date: string;
  author: string;
  text: string;
  type: string;
  path: string;
  name: string;
}



export interface Review {
  text: string;
  reference: {
    chapterStart: number;
    verseStart: number;
    chapterEnd: number;
    verseEnd: number;
  };
  date: string;
  comments: Comment[];
}

export interface Session {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  reviews: Review[];
}

export interface Book {
  name: string;
  content: string;
  code: string;
  version: string;
  sessions: Session[];
}

export interface ContractData {
  language: {
    code: string;
    name: string;
    books: Book[];
  };
}

/**
 * Error personalizado para propagar estados de interacción con archivos a la presentación.
 */
export class FsUserError extends Error {
  readonly code: 'cancelled' | 'quota' | 'unknown';
  constructor(message: string, code: 'cancelled' | 'quota' | 'unknown') {
    super(message);
    this.code = code;
    this.name = 'FsUserError';
  }
}

/**
 * Abre un diálogo para que el usuario elija un archivo ZIP y devuelve su contenido como ArrayBuffer.
 * @returns ArrayBuffer con los bytes del archivo o null si el usuario canceló la operación.
 */
export async function pickAndReadZip(): Promise<ArrayBuffer | null> {
  // 1. Intentar usar la API moderna (showOpenFilePicker)
  if ('showOpenFilePicker' in window) {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'Archivos ZIP de Acta',
          accept: { 'application/zip': ['.zip'] },
        }],
        multiple: false,
      });
      const file = await handle.getFile();
      return await file.arrayBuffer();
    } catch (e: any) {
      if (e.name === 'AbortError') return null;
      console.warn('FSA API falló o fue cancelada, intentando fallback...', e);
    }
  }

  // 2. Fallback: Uso de <input type="file"> tradicional
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.style.display = 'none';

    input.onchange = async () => {
      if (input.files && input.files.length > 0) {
        const buffer = await input.files[0].arrayBuffer();
        resolve(buffer);
      } else {
        resolve(null);
      }
      document.body.removeChild(input);
    };

    input.oncancel = () => {
      resolve(null);
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  });
}

/**
 * Descarga un Blob (ZIP) al sistema de archivos del usuario.
 * @param blob El contenido del archivo.
 * @param basenameWithoutExt Nombre del archivo sin la extensión .zip.
 */
export async function downloadZipBlob(blob: Blob, basenameWithoutExt: string): Promise<void> {
  const filename = `${basenameWithoutExt}.zip`;

  // Intentar usar showSaveFilePicker (Chromium) para una experiencia más nativa
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Archivo ZIP',
          accept: { 'application/zip': ['.zip'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      console.warn('showSaveFilePicker falló, usando fallback <a>:', e);
    }
  }

  // Fallback: Método tradicional <a> con createObjectURL
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Limpieza diferida
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Genera un Markdown legible basado en el contrato.
 */
export function generateMarkdownContent(data: ContractData): string {
  const lang = data.language;
  let md = `# Reporte de Translog - ${lang.name} (${lang.code})\n\n`;

  lang.books.forEach(book => {
    md += `## LIBRO: ${book.name.toUpperCase()} [${book.code}]\n\n`;
    
    book.sessions.forEach(session => {
      md += `### Sesión ${session.id}: ${session.title}\n`;
      md += `- **Inicio:** ${new Date(session.startDate).toLocaleString()}\n`;
      md += `- **Fin:** ${new Date(session.endDate).toLocaleString()}\n\n`;

      session.reviews.forEach((review, rIdx) => {
        const ref = review.reference;
        md += `#### Revisión ${rIdx + 1}\n`;
        md += `> **Referencia:** Cap. ${ref.chapterStart}:${ref.verseStart} - Cap. ${ref.chapterEnd}:${ref.verseEnd}\n\n`;
        md += `${review.text}\n\n`;

        if (review.comments.length > 0) {
          md += `**Comentarios de esta revisión:**\n`;
          review.comments.forEach(comment => {
            md += `- *${comment.author}* (${new Date(comment.date).toLocaleDateString()}): ${comment.text}\n`;
          });
          md += `\n`;
        }
      });
      md += `---\n\n`;
    });
  });

  return md;
}

/**
 * Crea un archivo ZIP con la estructura: idioma/libro/sesion/revisiones/comentarios
 * e incluye un Markdown legible y el JSON original.
 */
export async function downloadProjectAsZip(data: ContractData, filename: string, audioList: { name: string, uri: string, path: string }[]): Promise<void> {
  const zip = new JSZip();
  const langCode = data.language.code;
  
  // Raíz del idioma
  const langFolder = zip.folder(langCode);

  for (const book of data.language.books) {
    // Capa de Libro
    const bookFolder = langFolder?.folder(book.code);
    
    for (const session of book.sessions) {
      // Capa de Sesión
      const sessionFolder = bookFolder?.folder(`sesion_${session.id}`);
      const reviewsFolder = sessionFolder?.folder("revisiones");

      let rIdx = 1;
      for (const review of session.reviews) {
        // Capa de Revisión
        const currentReviewFolder = reviewsFolder?.folder(`revisión_${rIdx++}`);
        // Guardamos la información de la revisión 
        currentReviewFolder?.file("revision.json", JSON.stringify(review, null, 2));
        
        if (review.comments.length > 0)  {
          let cIdx = 1;
          for (const comment of review.comments) {
            if (comment.type === 'audio') {
              
          const audioFolder = currentReviewFolder?.folder("audios");
              // Guardar JSON del comentario
              audioFolder?.file(`audio_${cIdx}.json`, JSON.stringify(comment, null, 2));
              
              // Si el comentario tiene un path, intentamos meter el binario real .m4a en el ZIP.
              // Buscamos el audio en la lista proporcionada para asegurar que existe y obtener su path.
              
                try {
                  const audioEntry = audioList.find(audio => audio.name === comment.name);
                  if (audioEntry) {
                    const file = await Filesystem.readFile({ path: audioEntry.path, directory: Directory.Data });
                    const binaryName = audioEntry.name; // Usamos el nombre del archivo directamente del audioEntry
                    audioFolder?.file(binaryName, file.data, { base64: true });
                  } else {
                    console.warn(`Audio no encontrado en la lista para el path: ${comment.path}`);
                  }
                } catch (e: any) { // Añadir tipo para el error
                  console.warn("No se pudo adjuntar el audio al ZIP:", comment.path);
                }
              
              cIdx++;
            }
          }
        }
      }
    }
  }

  // Añadir archivos de ayuda en la raíz del ZIP
  zip.file("LECTURA_HUMANA.md", generateMarkdownContent(data));
  zip.file("contract.json", JSON.stringify(data, null, 2));

  // Generar y descargar
  const blob = await zip.generateAsync({ type: "blob" });
  await downloadBlobCompatible(blob, `${filename}.zip`);
}

/**
 * Helper interno para descarga compatible con navegadores/móviles.
 */
async function downloadBlobCompatible(blob: Blob, fullFilename: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(blob);
      
      await Filesystem.writeFile({
        path: fullFilename,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });
      
      return;
    } catch (e) {
      console.error('Error al exportar a carpeta nativa, usando fallback web:', e);
    }
  }

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({ suggestedName: fullFilename });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (e: any) { // Añadir tipo para el error
      if (e.name === 'AbortError') return;
      console.warn('showSaveFilePicker falló, usando fallback <a>:', e);
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fullFilename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Helper para convertir Blob a Base64 string para Filesystem
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
