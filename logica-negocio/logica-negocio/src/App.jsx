import { IndexedDBTest } from "./test/IndexedDBTest";

function App() {
  return (
    <div>
      <h1>App de prueba (Vite + React)</h1>
      <p>Solo para probar que IndexedDB funciona en el navegador.</p>

      {/* Componente de prueba */}
      <IndexedDBTest />
    </div>
  );
}

export default App;