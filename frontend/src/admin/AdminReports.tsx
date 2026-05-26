import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getAdminDrivers, getDriverPerformance, getDriverReportUrl } from "../services/api";
import { AdminDriverSummary, DriverPerformance } from "../types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#22c55e", "#2563eb", "#f59e0b", "#ef4444"];

const currentYear = new Date().getFullYear();

export default function AdminReports() {
  const [drivers, setDrivers] = useState<AdminDriverSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [perf, setPerf] = useState<DriverPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfLoading, setPerfLoading] = useState(false);

  useEffect(() => {
    getAdminDrivers()
      .then(setDrivers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setPerf(null);
      return;
    }
    setPerfLoading(true);
    getDriverPerformance(Number(selectedId))
      .then(setPerf)
      .catch(console.error)
      .finally(() => setPerfLoading(false));
  }, [selectedId]);

  const downloadReport = () => {
    if (!selectedId) return;
    window.open(getDriverReportUrl(Number(selectedId)), "_blank");
  };

  return (
    <div>
      <div className="admin-card">
        <h3>Generate Annual Performance Report</h3>
        <div className="admin-toolbar">
          <select
            className="admin-search-input"
            style={{ maxWidth: 300 }}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Select a driver...</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama} &middot; {d.jenis_kendaraan} &middot; <Star size={14} className="star-icon" /> {d.rating.toFixed(2)}
              </option>
            ))}
          </select>
          <button
            className="admin-btn admin-btn-primary"
            disabled={!selectedId}
            onClick={downloadReport}
          >
            Download PDF Report
          </button>
        </div>
      </div>

      {perfLoading && <div className="admin-loading">Loading performance data...</div>}

      {perf && !perfLoading && (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-card-label">Rating</div>
              <div className="admin-stat-card-value">{perf.driver.rating.toFixed(2)}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-label">Total Deliveries</div>
              <div className="admin-stat-card-value">{perf.driver.total_pengiriman}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-label">Total Distance</div>
              <div className="admin-stat-card-value">{perf.driver.total_jarak_km.toFixed(1)} km</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-label">Active Time</div>
              <div className="admin-stat-card-value">{perf.driver.total_waktu_menit} min</div>
            </div>
          </div>

          <div className="admin-detail-grid">
            {perf.monthly.length > 0 && (
              <div className="admin-card">
                <h3>Monthly Deliveries (12 months)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={perf.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="deliveries" fill="#2563eb" radius={[4, 4, 0, 0]} name="Deliveries" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {perf.status_distribution.length > 0 && (
              <div className="admin-card">
                <h3>Delivery Status Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={perf.status_distribution}
                      dataKey="count"
                      nameKey="status_pengiriman"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ status_pengiriman, count }) => `${status_pengiriman}: ${count}`}
                    >
                      {perf.status_distribution.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedId && !loading && (
        <div className="admin-loading" style={{ color: "var(--color-gray)" }}>
          Select a driver above to view performance data and generate a PDF report for {currentYear}.
        </div>
      )}
    </div>
  );
}
