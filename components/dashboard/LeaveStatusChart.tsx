"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LeaveChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

export const LeaveStatusChart = ({ data }: LeaveChartProps) => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-[400px]">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Leave Requests Status</h3>
            <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
