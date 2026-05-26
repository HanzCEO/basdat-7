import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAdminDriverDetail, getDriverReportUrl } from "../services/api";
import { AdminDriverDetail as DetailType } from "../types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";

export default function AdminDriverDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAdminDriverDetail(Number(id))
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="admin-loading">Loading driver details...</div>;
  if (!data) return <div className="admin-loading">Driver not found.</div>;

  const d = data.driver;

  const monthlyChartData = data.monthly_performance.map((m) => ({
    bulan: m.bulan,
    deliveries: m.deliveries,
    avgTime: m.avg_time_minutes,
  }));

  return (
    <div>
      <div className="admin-detail-header">
        <div className="admin-detail-avatar">
          {d.nama.charAt(0).toUpperCase()}
        </div>
        <div className="admin-detail-info">
          <h2>{d.nama}</h2>
          <p>{d.jenis_kendaraan} &middot; {d.no_plat}</p>
        </div>
        <div className="admin-detail-actions">
          <a
            href={getDriverReportUrl(d.id)}
            className="admin-btn admin-btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download PDF Report
          </a>
          <Link to="/admin/drivers" className="admin-btn admin-btn-secondary">
            Back
          </Link>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card-label">Rating</div>
          <div className="admin-stat-card-value">{d.rating.toFixed(2)}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card-label">Total Deliveries</div>
          <div className="admin-stat-card-value">{d.total_pengiriman}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card-label">Total Distance</div>
          <div className="admin-stat-card-value">{d.total_jarak_km.toFixed(1)} km</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card-label">Total Active Time</div>
          <div className="admin-stat-card-value">{d.total_waktu_menit} min</div>
        </div>
      </div>

      <div className="admin-detail-grid">
        {monthlyChartData.length > 0 && (
          <div className="admin-card">
            <h3>Monthly Deliveries</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="deliveries" fill="#2563eb" radius={[4, 4, 0, 0]} name="Deliveries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {monthlyChartData.length > 0 && (
          <div className="admin-card">
            <h3>Average Delivery Time (minutes)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avgTime" stroke="#2563eb" strokeWidth={2} name="Avg Time" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {data.deliveries.length > 0 && (
        <div className="admin-card">
          <h3>Delivery History (last 50)</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Restaurant</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Distance</th>
                  <th>Assigned</th>
                </tr>
              </thead>
              <tbody>
                {data.deliveries.map((del) => (
                  <tr key={del.id}>
                    <td>#{del.id}</td>
                    <td>{del.restoran_nama}</td>
                    <td>{del.pelanggan_nama}</td>
                    <td>
                      <span className={`admin-badge status-${del.status_pengiriman}`}>
                        {del.status_pengiriman}
                      </span>
                    </td>
                    <td>{del.jarak_km ? `${del.jarak_km} km` : "-"}</td>
                    <td>{del.waktu_ditugaskan ? new Date(del.waktu_ditugaskan).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
