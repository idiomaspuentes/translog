import React, { useState } from 'react';
import { pickAndReadZip, downloadProjectAsZip } from './sessionArchive';
import type { ContractData } from './sessionArchive';
import dataJson from './src/assets/contract.json'; // Asegúrate de tener un archivo data.json con la estructura adecuada
import { useAudios } from './useAudios';

const handleImport = async (onStatus?: (message: string) => void) => {
    onStatus?.('Iniciando selección de archivo...');
    try {
      const buffer = await pickAndReadZip();
      if (buffer) {
        onStatus?.(`Archivo cargado con éxito. Tamaño: ${buffer.byteLength} bytes.`);
        // Nota: Aquí podrías usar JSZip.loadAsync(buffer) para procesar el contenido.
      } else {
        onStatus?.('Selección cancelada.');
      }
    } catch (error) {
      onStatus?.('Error al leer el archivo.');
      console.error(error);
    }
  };

  const handleExport = async (currentAudioList: any,sesionsData: ContractData,onStatus?: (message: string) => void ) => {
    onStatus?.('Generando archivo de respaldo...');
    // Nos aseguramos de tener la lista de archivos actualizada antes de procesar el ZIP
   // Obtener la lista más reciente directamente
    
   // Asegúrate de que data.json tenga la estructura correcta para ContractData ;

    try {
      await downloadProjectAsZip(sesionsData, 'export_sesiones', currentAudioList); // Pasar la lista más reciente
      onStatus?.('Exportación completada.');
    } catch (error) {
      onStatus?.('Error al exportar el proyecto.');
      console.error(error);
    }
  };
/**
 * Componente para gestionar la importación y exportación de archivos ZIP del proyecto.
 */
const ArchiveManager: React.FC = () => {
  const [status, setStatus] = useState<string>('');
   // Obtener audioList del hook
  const { loadAudios } = useAudios('sesiones/audios');  

const onStatus = (message: string) => {
  setStatus(message);
};

  

  

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px' }}>
      <h2 style={{ marginTop: 0 }}>Gestión de Archivos</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button onClick={handleImport} style={{ cursor: 'pointer', padding: '8px 16px' }}>Importar ZIP</button>
        <button onClick={async () => handleExport (await loadAudios())} style={{ cursor: 'pointer', padding: '8px 16px' }}>Exportar Proyecto (ZIP)</button>
      </div>
      {status && <p style={{ color: '#555', fontSize: '0.9rem' }}>{status}</p>}
    </div>
  );
};

export default ArchiveManager;