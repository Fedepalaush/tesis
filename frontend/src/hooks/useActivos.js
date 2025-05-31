import { useState, useEffect } from "react";
import { getActivos, deleteActivo, createActivo } from "../api";

const useActivos = () => {
  const [activos, setActivos] = useState([]);
  const [total_inv, setTotalSum] = useState(0);
  const [inversion_actual, setInvActual] = useState(0);
  const [diferencia_total_pct, setDiferencia] = useState(0);
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
      console.log('soy data')
      console.log(data)
      setActivos(data.activos || []);
      setTotalSum(data.total_inv || 0);
      setInvActual(data.inversion_actual || 0);
      setDiferencia(data.diferencia_total_pct || 0);
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
  
  const handleOpenCompra = (open, ticker = "") => {
    setOpenCompra(true);
    setTickerToBuy(ticker)
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
    total_inv: total_inv,
    inversion_actual: inversion_actual,
    diferencia_total_pct: diferencia_total_pct,
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
