import { useEffect, useState } from "react";
import { getAdminStats } from "../services/api";
import { AdminStats } from "../types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;
  if (!stats) return <div className="admin-loading">Failed to load stats.</div>;

  const statCards = [
    { label: "Total Drivers", value: stats.total_drivers, sub: "Registered drivers" },
    { label: "Active Deliveries", value: stats.active_deliveries, sub: "Currently in progress" },
    { label: "Average Rating", value: stats.avg_rating.toFixed(2), sub: "Across all drivers" },
    { label: "Total Deliveries", value: stats.total_deliveries, sub: `${stats.deliveries_today} today` },
  ];

  return (
    <div>
      <div className="admin-stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="admin-stat-card">
            <div className="admin-stat-card-label">{card.label}</div>
            <div className="admin-stat-card-value">{card.value}</div>
            <div className="admin-stat-card-sub">{card.sub}</div>
          </div>
        ))}
      </div>

      {stats.monthly_trend.length > 0 && (
        <div className="admin-card">
          <h3>Monthly Delivery Trend (12 months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthly_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} name="Deliveries" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
