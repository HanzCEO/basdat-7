import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDrivers } from "../services/api";
import { AdminDriverSummary } from "../types";

const STATUSES = ["", "available", "busy", "offline"];

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<AdminDriverSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    setLoading(true);
    getAdminDrivers(search, statusFilter)
      .then(setDrivers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  return (
    <div>
      <div className="admin-toolbar">
        <input
          className="admin-search-input"
          type="text"
          placeholder="Search by name, vehicle, or plate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-filter-pills">
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`admin-filter-pill${statusFilter === s ? " active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s || "All"}
            </button>
          ))}
        </div>
        <div className="admin-view-toggle">
          <button
            className={`admin-view-toggle-btn${viewMode === "grid" ? " active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            Grid
          </button>
          <button
            className={`admin-view-toggle-btn${viewMode === "list" ? " active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List view"
          >
            List
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading drivers...</div>
      ) : drivers.length === 0 ? (
        <div className="admin-loading">No drivers found.</div>
      ) : viewMode === "grid" ? (
        <div className="admin-driver-cards">
          {drivers.map((d) => (
            <Link
              key={d.id}
              to={`/admin/drivers/${d.id}`}
              className="admin-driver-card"
            >
              <div className="admin-driver-avatar">
                {d.nama.charAt(0).toUpperCase()}
              </div>
              <div className="admin-driver-info">
                <h4>{d.nama}</h4>
                <p>{d.jenis_kendaraan} &middot; {d.no_plat}</p>
                <div className="admin-driver-meta">
                  <span>&#9733; {d.rating.toFixed(2)}</span>
                  <span>{d.total_pengiriman} deliveries</span>
                  <span>{d.total_jarak_km.toFixed(1)} km</span>
                  <span>
                    <span className={`admin-badge status-${d.status}`}>
                      {d.status}
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Vehicle</th>
                  <th>Plate</th>
                  <th>Rating</th>
                  <th>Deliveries</th>
                  <th>Distance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <Link to={`/admin/drivers/${d.id}`} className="admin-table-link">
                        {d.nama}
                      </Link>
                    </td>
                    <td>{d.jenis_kendaraan}</td>
                    <td>{d.no_plat}</td>
                    <td>&#9733; {d.rating.toFixed(2)}</td>
                    <td>{d.total_pengiriman}</td>
                    <td>{d.total_jarak_km.toFixed(1)} km</td>
                    <td>
                      <span className={`admin-badge status-${d.status}`}>
                        {d.status}
                      </span>
                    </td>
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
