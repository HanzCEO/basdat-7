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
      </div>

      {loading ? (
        <div className="admin-loading">Loading drivers...</div>
      ) : drivers.length === 0 ? (
        <div className="admin-loading">No drivers found.</div>
      ) : (
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
      )}
    </div>
  );
}
