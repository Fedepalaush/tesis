import React, { useEffect, useState } from "react";
import Toast from "./Toast"; // Asegurate de importar correctamente

const LastExecution = () => {
  const [lastExecution, setLastExecution] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchExecution = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || "http://localhost:8000";
        const execResponse = await fetch(`${apiBase}/last-execution/`);
        const execData = await execResponse.json();
        setLastExecution(execData.last_execution);
        setShowToast(true);

        // Oculta el toast después de 10 segundos automáticamente
        setTimeout(() => setShowToast(false), 10000);
      } catch (error) {
        console.error("Error al obtener la última ejecución:", error);
      }
    };

    fetchExecution();
  }, []);

  return (
    <>
      {showToast && lastExecution && (
        <Toast
          message={`Última actualización de datos: ${lastExecution}`}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default LastExecution;
