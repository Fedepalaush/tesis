import React from "react";

const StatsTable = ({ stats }) => {
    if (!stats) {
        return <p className="text-white">No hay estadísticas disponibles.</p>;
    }

    const importantStats = [
        { label: "Fecha de Inicio", value: stats['Start'] },
        { label: "Fecha de Fin", value: stats['End'] },
        { label: "Duración", value: stats['Duration'] },
        { label: "Retorno Total [%]", value: `${stats['Return [%]']}%` },
        { label: "Volatilidad Anual [%]", value: `${stats['Volatility (Ann.) [%]']}%` },
        { label: "Sharpe Ratio", value: stats['Sharpe Ratio'] },
        { label: "Máximo Drawdown [%]", value: `${stats['Max. Drawdown [%]']}%` },
        { label: "Retorno Anualizado [%]", value: `${stats['Return (Ann.) [%]']}%` },
    ];

    return (
        <div className="bg-gray-800 text-white p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Estadísticas Principales del Backtest</h2>
            <table className="w-full text-left table-auto border-collapse border border-gray-700">
                <thead>
                    <tr>
                        <th className="border border-gray-700 px-4 py-2">Métrica</th>
                        <th className="border border-gray-700 px-4 py-2">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {importantStats.map((stat, index) => (
                        <tr key={index} className="border-t border-gray-700">
                            <td className="px-4 py-2">{stat.label}</td>
                            <td className="px-4 py-2">{stat.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StatsTable;
