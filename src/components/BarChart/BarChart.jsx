import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function BarChart({ data, xDataKey, barDataKey, barColor }) {
  if (!data || data.length === 0) return <p>Không có dữ liệu</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReBarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xDataKey} />
        <YAxis />
        <Tooltip />
        <Legend verticalAlign="bottom" />
        <Bar dataKey={barDataKey} fill={barColor} />
      </ReBarChart>
    </ResponsiveContainer>
  );
}
