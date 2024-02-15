import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ChartComponent = () => {
    const [chartData, setChartData] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/generate-chart');
                setChartData(response.data.chart_data);
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {chartData && <img src={`data:image/png;base64,${chartData}`} alt="Chart" />}
        </div>
    );
};

export default ChartComponent;
