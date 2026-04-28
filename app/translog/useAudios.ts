import { useState, useEffect, useCallback } from 'react';
import { AudioRecorderService } from './AudioRecorder';

/**
 * Hook para gestionar la lista de audios grabados en el dispositivo.
 */
export function useAudios(folder: string = 'sesiones/audios') {
  const [audioList, setAudioList] = useState<{ name: string; uri: string; path: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAudios = useCallback(async () => {
    setIsLoading(true);
    try {
      const audios = await AudioRecorderService.getRecordings(folder);
      setAudioList(audios);
      return audios; // Devolver la lista de audios cargada
    } catch (error) {
      console.error("Error al cargar la lista de audios:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    loadAudios();
  }, [loadAudios]);

  return { audioList, loadAudios, isLoading };
}