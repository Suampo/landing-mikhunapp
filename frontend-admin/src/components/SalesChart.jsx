// src/components/SalesChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "L", ventas: 200 },
  { name: "M", ventas: 500 },
  { name: "X", ventas: 300 },
  { name: "J", ventas: 700 },
  { name: "V", ventas: 600 },
  { name: "S", ventas: 900 },
  { name: "D", ventas: 1200 },
];

export default function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}