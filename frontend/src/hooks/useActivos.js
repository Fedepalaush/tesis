import { useState, useEffect } from "react";
import { getActivos, deleteActivo, createActivo } from "../api";

const useActivos = () => {
  const [activos, setActivos] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const [invActual, setInvActual] = useState(0);
  const [diferencia, setDiferencia] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estado del modal de compra
  const [openCompra, setOpenCompra] = useState(false);
  const [tickerToBuy, setTickerToBuy] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [cantidad, setCantidad] = useState("");

  const fetchActivos = async () => {
    setLoading(true);
    try {
      const data = await getActivos();
      setActivos(data.tickers || []);
      setTotalSum(data.totalSum || 0);
      setInvActual(data.invActual || 0);
      setDiferencia(data.diferencia || 0);
    } catch (error) {
      console.error("Error al cargar los activos:", error);
      setActivos([]);
      setTotalSum(0);
      setInvActual(0);
      setDiferencia(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivo = async (id) => {
    console.log(id)
    try {
      const status = await deleteActivo(id);
      if (status === 204) {
        await fetchActivos();
      } else {
        console.error("Falló la eliminación del activo");
      }
    } catch (error) {
      console.error("Error al eliminar el activo:", error);
    }
  };

  const handleCreateActivo = async () => {
    try {
      const status = await createActivo(tickerToBuy, precioCompra, cantidad);
      if (status === 201) {
        await fetchActivos();
        handleCloseCompra(); // Cierra el modal al crear exitosamente
        return true;
      } else {
        console.error(`Falló la creación del activo. Código de estado: ${status}`);
        return false;
      }
    } catch (error) {
      console.error("Error al crear el activo:", error);
      return false;
    }
  };

  const handleOpenCompra = () => {
    setOpenCompra(true);
  };

  const handleCloseCompra = () => {
    setOpenCompra(false);
    setTickerToBuy("");
    setPrecioCompra("");
    setCantidad("");
  };

  useEffect(() => {
    fetchActivos();
  }, []);

  return {
    activos,
    isLoading: loading,
    totalSum,
    invActual,
    diferencia,
    openCompra,
    tickerToBuy,
    precioCompra,
    cantidad,
    setTickerToBuy,
    setPrecioCompra,
    setCantidad,
    handleOpenCompra,
    handleCloseCompra,
    handleCreateActivo,
    handleDeleteActivo,
  };
};

export default useActivos;
