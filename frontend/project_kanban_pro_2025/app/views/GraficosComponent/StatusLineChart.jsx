import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const StatusLineChart = ({ data, statuses }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500">Sem dados de atividade para exibir.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.values(statuses).map((statusInfo, index) => (
                    <Line key={statusInfo.id} type="monotone" dataKey={statusInfo.title} stroke={`hsl(var(--chart-${index + 1}))`} strokeWidth={2} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default StatusLineChart;
