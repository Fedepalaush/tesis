import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import BaseLayout from '../components/BaseLayout';

const SoportesResistencias = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/get_pivot_points/');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Verificar si data tiene contenido antes de parsear
    if (!data || data.length === 0) {
        return <div>Loading...</div>;  // Muestra un mensaje de carga mientras se obtienen los datos
    }

    // Convertir datos JSON de regreso al formato DataFrame
    const df = JSON.parse(data);

    // Crear datos para gráfico de velas japonesas
    const candlestickData = {
        x: df.map(entry => entry.time),
        open: df.map(entry => entry.open),
        high: df.map(entry => entry.high),
        low: df.map(entry => entry.low),
        close: df.map(entry => entry.close),
        type: 'candlestick',
        increasing: { line: { color: 'green' } },
        decreasing: { line: { color: 'red' } }
    };

    // Filtrar puntos pivote no nulos
    const pivotPoints = df.filter(entry => entry.pointpos !== null);

    // Datos para puntos pivote
    const pivotScatter = {
        x: pivotPoints.map(entry => entry.time),
        y: pivotPoints.map(entry => entry.pointpos),
        mode: 'markers',
        marker: { size: 5, color: 'MediumPurple' },
        name: 'pivot'
    };

    // Datos para líneas de pivote
    const pivotLines = pivotPoints.map(entry => ({
        type: 'line',
        x0: entry.time,
        y0: entry.pointpos,
        x1: df[df.length - 1].time,
        y1: entry.pointpos,
        line: { color: 'MediumPurple', width: 1 }
    }));

    return (
        <BaseLayout>
            
            <Plot
                data={[candlestickData, pivotScatter, ...pivotLines]}
                layout={{
                    xaxis: { rangeslider: { visible: false }, showgrid: false },
                    yaxis: { showgrid: false },
                    paper_bgcolor: 'black',
                    plot_bgcolor: 'black'
                }}
            />
       </BaseLayout>
    );
};

export default SoportesResistencias;
