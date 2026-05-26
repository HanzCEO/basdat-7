import { useEffect, useState } from "react";
import { getAdminStats } from "../services/api";
import { AdminStats } from "../types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Truck, Package, Star, Clock, DollarSign, ClipboardList,
  XCircle, Store,
} from "lucide-react";

const PIE_COLORS = ["#22c55e", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

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

  const formatRp = (v: number) =>
    "Rp" + Number(v).toLocaleString("id-ID");

  const statCards = [
    { icon: Truck, label: "Total Drivers", value: String(stats.total_drivers), sub: `${stats.available_drivers} available, ${stats.busy_drivers} busy` },
    { icon: Store, label: "Restaurants", value: String(stats.total_restaurants), sub: `${stats.total_customers} customers` },
    { icon: Package, label: "Active Deliveries", value: String(stats.active_deliveries), sub: "Currently in progress" },
    { icon: Star, label: "Avg Rating", value: stats.avg_rating.toFixed(2), sub: "Across all drivers" },
    { icon: Clock, label: "Avg Delivery Time", value: `${stats.avg_delivery_time} min`, sub: "Per completed delivery" },
    { icon: DollarSign, label: "Total Revenue", value: formatRp(stats.total_revenue), sub: `${formatRp(stats.revenue_today)} today` },
    { icon: ClipboardList, label: "Orders Today", value: String(stats.orders_today), sub: `${stats.total_orders} total orders` },
    { icon: XCircle, label: "Cancellation Rate", value: `${stats.cancellation_rate}%`, sub: `${stats.deliveries_today} deliveries today` },
  ];

  return (
    <div>
      <div className="admin-stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="admin-stat-card">
            <div className="admin-stat-card-icon">
              <card.icon />
            </div>
            <div className="admin-stat-card-label">{card.label}</div>
            <div className="admin-stat-card-value">{card.value}</div>
            <div className="admin-stat-card-sub">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="admin-detail-grid">
        {stats.monthly_revenue.length > 0 && (
          <div className="admin-card">
            <h3>Monthly Revenue (12 months)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.monthly_revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats.orders_by_status.length > 0 && (
          <div className="admin-card">
            <h3>Orders by Status</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.orders_by_status}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {stats.orders_by_status.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
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
