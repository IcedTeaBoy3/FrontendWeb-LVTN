import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";



export default function PieChart({ data, COLORS, outerRadius = 100 }) {
  if (!data || data.length === 0) return <p>Không có dữ liệu</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RePieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={outerRadius}
          fill="#8884d8"
          label
          dataKey="value"
          nameKey="name"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RePieChart>
    </ResponsiveContainer>
  );
}
