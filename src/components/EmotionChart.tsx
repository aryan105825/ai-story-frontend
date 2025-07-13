import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function EmotionChart({ history }: { history: string[] }) {
  const counts = history.reduce<Record<string, number>>((acc, e) => {
    acc[e] = (acc[e] || 0) + 1; return acc;
  }, {});
  const data = Object.entries(counts).map(([emotion, count]) => ({ emotion, count }));
  return (
    <BarChart width={300} height={150} data={data}>
      <XAxis dataKey="emotion" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Bar dataKey="count" fill="#1976d2" />
    </BarChart>
  );
}
