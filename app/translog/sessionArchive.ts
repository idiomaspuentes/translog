import JSZip from 'jszip';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Language, Book, Session, Review, Comment} from './src/lib/types/types';
import { jsPDF } from "jspdf";
import * as html2canvas from 'html2canvas';



export interface ContractData {
  language: Language;
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


export const generateTranslogPDF = async (data:Language) => {
  const lang = data;
  
  // 1. Crear un contenedor oculto para el HTML
  const container = document.createElement('div');
  container.style.width = '700px';
  container.style.padding = '40px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.color = '#333';
  container.style.lineHeight = '1.6';

  // 2. Construir el contenido HTML (basado en tu lógica de Markdown)
  let htmlContent = `
    <h1 style="color: #2c3e50; border-bottom: 2px solid #34495e;">Reporte de Translog</h1>
    <p><strong>Idioma:</strong> ${lang.name} (${lang.code})</p>
    <hr>
  `;

  lang.books.forEach(book => {
    htmlContent += `
      <div style="margin-top: 30px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <h2 style="margin: 0; color: #16a085;">LIBRO: ${book.name.toUpperCase()} [${book.code}]</h2>
      </div>
    `;

    book.sessions.forEach(session => {
      htmlContent += `
        <div style="margin-left: 20px; border-left: 4px solid #3498db; padding-left: 15px; margin-top: 20px;">
          <h3 style="color: #2980b9;">Sesión ${session.id}: ${session.title}</h3>
          <p style="font-size: 0.9rem;">
            <strong>Inicio:</strong> ${new Date(session.startDate).toLocaleString()} | 
            <strong>Fin:</strong> ${new Date(session.endDate).toLocaleString()}
          </p>
        </div>
      `;

      session.reviews.forEach((review, rIdx) => {
        const ref = review.reference;
        htmlContent += `
          <div style="margin-left: 40px; margin-top: 15px; background: #fff; border: 1px solid #eee; padding: 10px;">
            <h4 style="margin-top: 0;">Revisión ${rIdx + 1}</h4>
            <p style="background: #eee; padding: 5px; font-style: italic;">
              <strong>Referencia:</strong> Cap. ${ref.chapterStart}:${ref.verseStart} - Cap. ${ref.chapterEnd}:${ref.verseEnd}
            </p>
            <p>${review.text}</p>
        `;

        if (review.comments.length > 0) {
          htmlContent += `<p><strong>Comentarios:</strong></p><ul style="font-size: 0.85rem;">`;
          review.comments.forEach(comment => {
            htmlContent += `
              <li>
                <strong>${comment.author}</strong> (${new Date(comment.date).toLocaleDateString()}): 
                ${comment.text}
              </li>`;
          });
          htmlContent += `</ul>`;
        }
        htmlContent += `</div>`; // Cerrar revisión
      });
    });
  });

  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  // 3. Convertir HTML a Canvas y luego a PDF
  try {
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // 4. Descargar o Guardar
    pdf.save(`Reporte_Translog_${lang.code}.pdf`);
    
  } catch (error) {
    console.error("Error generando PDF:", error);
  } finally {
    document.body.removeChild(container); // Limpiar el DOM
  }
};

/**
 * Crea un archivo ZIP con la estructura: idioma/libro/sesion/revisiones/comentarios
 * e incluye un Markdown legible y el JSON original.
 */
export async function downloadProjectAsZip(
  data: ContractData, 
  filename: string, 
  audioList: { name: string, uri: string, path: string }[]
): Promise<void> {
  const zip = new JSZip();
  const langCode = data.language.code;
  
  const langFolder = zip.folder(langCode);

  for (const book of data.language.books) {
    const bookFolder = langFolder?.folder(book.code);
    
    for (const session of book.sessions) {
      const sessionFolder = bookFolder?.folder(`sesion_${session.id}`);
      const reviewsFolder = sessionFolder?.folder("revisiones");

      let rIdx = 1;
      for (const review of session.reviews) {
        const currentReviewFolder = reviewsFolder?.folder(`revisión_${rIdx++}`);
        currentReviewFolder?.file("revision.json", JSON.stringify(review, null, 2));
        
        if (review.comments.length > 0)  {
          let cIdx = 1;
          for (const comment of review.comments) {
            if (comment.type === 'audio') {
              const audioFolder = currentReviewFolder?.folder("audios");
              audioFolder?.file(`audio_${cIdx}.json`, JSON.stringify(comment, null, 2));
              
              try {
                const audioEntry = audioList.find(audio => audio.name === comment.name);
                if (audioEntry) {
                  // Leemos el audio desde el almacenamiento de Capacitor (Directory.Data)
                  const file = await Filesystem.readFile({ 
                    path: audioEntry.path, 
                    directory: Directory.Data 
                  });
                  audioFolder?.file(audioEntry.name, file.data, { base64: true });
                }
              } catch (e: any) {
                console.warn("No se pudo adjuntar el audio al ZIP:", comment.path);
              }
              cIdx++;
            }
          }
        }
      }
    }
  }

  // --- GENERACIÓN DE REPORTES EN MEMORIA ---
  
  // 1. Markdown (Sincrónico)
  //ip.file("LECTURA_HUMANA.md", generateMarkdownContent(data));

  // 2. PDF (Asincrónico - Esperamos el Blob generado por html2canvas + jsPDF)
  try {
    const pdfBlob = await generateTranslogPDF(data.language);
    // Agregamos el binario del PDF directamente a la raíz del ZIP
    zip.file("LECTURA_HUMANA.pdf", pdfBlob);
  } catch (pdfError) {
    console.error("Error al incluir el PDF en el paquete ZIP:", pdfError);
  }

  // 3. Metadata del contrato
  zip.file("contract.json", JSON.stringify(data, null, 2));

  // --- FINALIZACIÓN Y DESCARGA ---
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
