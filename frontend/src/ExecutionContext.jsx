import React, { createContext, useContext, useState, useEffect } from "react";

const ExecutionContext = createContext();

export function useExecution() {
  return useContext(ExecutionContext);
}

export function ExecutionProvider({ children }) {
  const [lastExecution, setLastExecution] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const fetchExecution = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const execResponse = await fetch(`${apiBase}/last-execution/`);
      const execData = await execResponse.json();
      console.log("execData:", execData);
      setLastExecution(execData.data.last_execution);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 10000);
    } catch (error) {
      console.error("Error al obtener la última ejecución:", error);
    }
  };

  useEffect(() => {
    fetchExecution();
  }, []);

  return (
    <ExecutionContext.Provider value={{ lastExecution, showToast, fetchExecution }}>
      {children}
    </ExecutionContext.Provider>
  );
}
