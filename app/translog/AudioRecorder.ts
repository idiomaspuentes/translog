import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * Interfaz para el resultado de una grabación exitosa.
 */
export interface RecordingResult {
  uri: string;      // Ruta nativa al archivo
  path: string;     // Ruta relativa usada
  duration: number; // Duración en milisegundos
  format: string;   // Formato (m4a/aac)
}

/**
 * Servicio para gestionar la grabación de audio en formato AAC (m4a)
 * compatible con Android e iOS mediante Capacitor.
 */
export const AudioRecorderService = {
  
  /**
   * Verifica y solicita los permisos necesarios para usar el micrófono.
   */
  async requestPermissions(): Promise<boolean> {
    const status = await VoiceRecorder.requestAudioRecordingPermission();
    return status.value;
  },

  /**
   * Inicia el proceso de grabación.
   * @throws Error si no hay permisos o si ya hay una grabación en curso.
   */
  async startRecording(): Promise<void> {
    const { value: hasPermission } = await VoiceRecorder.hasAudioRecordingPermission();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) throw new Error('Permiso de micrófono denegado');
    }

    const { status } = await VoiceRecorder.getCurrentStatus();
    if (status !== 'NONE') {
      throw new Error('Ya existe una grabación en curso o pausada');
    }

    await VoiceRecorder.startRecording();
  },

  /**
   * Detiene la grabación y guarda el archivo en la ruta específica del app.
   * @param fileName Nombre del archivo (sin extensión).
   * @param folder Carpeta de destino dentro de Directory.Data (ej: 'sessions/audios').
   */
  async stopRecording(fileName: string, folder: string = 'audios'): Promise<RecordingResult> {
    const result = await VoiceRecorder.stopRecording();
    
    // El plugin devuelve la data en Base64
    const base64Data = result.value.recordDataBase64;
    if (!base64Data) throw new Error('No se capturó data de audio');

    const relativePath = `${folder}/${fileName}.m4a`;

    // 1. Asegurar que el directorio existe
    try {
      await Filesystem.mkdir({
        path: folder,
        directory: Directory.Data,
        recursive: true
      });
    } catch (e) {
      // Ignorar si el directorio ya existe
    }

    // 2. Escribir el archivo en el sistema de archivos del dispositivo
    const savedFile = await Filesystem.writeFile({
      path: relativePath,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      uri: savedFile.uri,
      path: relativePath,
      duration: result.value.msDuration,
      format: 'm4a'
    };
  },

  /**
   * Obtiene la lista de grabaciones guardadas en una carpeta específica.
   */
  async getRecordings(folder: string = 'sesiones/audios'): Promise<{ name: string, uri: string, path: string }[]> {
    try {
      const result = await Filesystem.readdir({
        path: folder,
        directory: Directory.Data,
      });

      const recordings = await Promise.all(result.files.map(async (file) => {
        const fileStat = await Filesystem.getUri({
          path: `${folder}/${file.name}`,
          directory: Directory.Data
        });
        return { name: file.name, uri: fileStat.uri, path: `${folder}/${file.name}` };
      }));

      return recordings;
    } catch (e) {
      return [];
    }
  }
};