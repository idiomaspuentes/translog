import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import './App.css';
import ArchiveManager from '.././ArchiveManager'; // Importa el nuevo componente
import { AudioRecorderService } from '../AudioRecorder';
import type { RecordingResult } from '../AudioRecorder';
import { useAudios } from '../useAudios';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [status, setStatus] = useState<string>('');
  const { audioList, loadAudios } = useAudios('sesiones/audios');

  const handleStart = async () => {
    try {
      setStatus('Solicitando permisos e iniciando...');
      await AudioRecorderService.startRecording();
      setIsRecording(true);
      setResult(null);
      setStatus('Grabando audio...');
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      console.error(error);
    }
  };

  const handleStop = async () => {
    try {
      setStatus('Finalizando grabación...');
      const fileName = `session_audio_${Date.now()}`;
      // Guardamos en una ruta específica dentro de Directory.Data
      const recording = await AudioRecorderService.stopRecording(fileName, 'sesiones/audios');
      
      setResult(recording);
      setIsRecording(false);
      setStatus('Grabación guardada correctamente.');
      loadAudios(); // Refrescar la lista tras grabar
    } catch (error: any) {
      setStatus(`Error al detener: ${error.message}`);
      setIsRecording(false);
      console.error(error);
    }
  };

  const playAudio = async (uri: string, path: string) => {
    try {
      setStatus(`Cargando audio...`);
      const audioUrl = Capacitor.convertFileSrc(uri);
      const audio = new Audio(audioUrl);
      
      audio.onplay = () => setStatus('Reproduciendo...');
      audio.onended = () => setStatus('Reproducción finalizada.');

      await audio.play();
    } catch (error) {
      console.warn("Reproducción directa falló, intentando vía Base64...", error);
      try {
        // Fallback: Leer el archivo y reproducir como Data URI (más compatible en algunos Android)
        const file = await Filesystem.readFile({
          path: path,
          directory: Directory.Data
        });
        
        const base64Url = `data:audio/aac;base64,${file.data}`;
        const audio = new Audio(base64Url);
        audio.onended = () => setStatus('Reproducción finalizada.');
        await audio.play();
      } catch (innerError: any) {
        console.error("Error crítico al reproducir:", innerError);
        setStatus(`Error al reproducir: ${innerError.message}`);
      }
    }
  };

  return (
    <>
       <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>Translog</h1>

      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0', backgroundColor: '#fff' }}>
        <h2 style={{ marginTop: 0 }}>Grabadora de Sesión</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          {!isRecording ? (
            <button onClick={handleStart} style={{ cursor: 'pointer', padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
              Iniciar Grabación
            </button>
          ) : (
            <button onClick={handleStop} style={{ cursor: 'pointer', padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>
              Detener Grabación
            </button>
          )}
        </div>
        {status && <p style={{ color: isRecording ? '#d32f2f' : '#555', fontSize: '0.9rem', fontWeight: isRecording ? 'bold' : 'normal' }}>{status}</p>}
        {result && (
          <div style={{ fontSize: '0.85rem', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
            <p><strong>Archivo:</strong> {result.path}</p>
            <p><strong>Duración:</strong> {(result.duration / 1000).toFixed(2)}s</p>
            <p style={{ wordBreak: 'break-all' }}><strong>URI Nativa:</strong> {result.uri}</p>
          </div>
        )}
      </div>

      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0', backgroundColor: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>Historial de Audios</h3>
        {audioList.length === 0 ? (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>No hay audios grabados aún.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {audioList.map((audio) => (
              <li key={audio.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  {audio.name}
                </span>
                <button onClick={() => playAudio(audio.uri, audio.path)} style={{ cursor: 'pointer', padding: '4px 12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}>
                  Reproducir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Aquí se integra el nuevo componente ArchiveManager */}
      <ArchiveManager />

      <p style={{ marginTop: '20px', fontSize: '0.8em', color: '#666' }}>
        Esta es una aplicación de ejemplo para demostrar la integración de ArchiveManager.
      </p>
    </div>
    </>
  )
}

export default App
