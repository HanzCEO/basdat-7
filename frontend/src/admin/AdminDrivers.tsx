import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { getAdminDrivers } from "../services/api";
import { AdminDriverSummary } from "../types";

const STATUSES = ["", "available", "busy", "offline"];

type SortKey = "id" | "nama" | "no_hp" | "jenis_kendaraan" | "no_plat" | "rating" | "total_pengiriman" | "total_distance" | "total_waktu_menit" | "status" | "created_at";

function sortData(data: AdminDriverSummary[], key: SortKey, dir: "asc" | "desc"): AdminDriverSummary[] {
  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    if (typeof aVal === "string" && typeof bVal === "string") {
      return dir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return dir === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
  });
}

const SORTABLE_COLS: { key: SortKey; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "nama", label: "Name" },
  { key: "no_hp", label: "Phone" },
  { key: "jenis_kendaraan", label: "Vehicle" },
  { key: "no_plat", label: "Plate" },
  { key: "rating", label: "Rating" },
  { key: "total_pengiriman", label: "Deliveries" },
  { key: "total_distance", label: "Distance" },
  { key: "total_waktu_menit", label: "Active Time" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Registered" },
];

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<AdminDriverSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setLoading(true);
    getAdminDrivers(search, statusFilter)
      .then(setDrivers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  const sorted = useMemo(() => sortData(drivers, sortKey, sortDir), [drivers, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

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
                  <span><Star size={14} className="star-icon" /> {d.rating.toFixed(2)}</span>
                  <span>{d.total_pengiriman} deliveries</span>
                  <span>{d.total_distance.toFixed(1)} km</span>
                  <span>{d.total_waktu_menit} min</span>
                  <span>{d.no_hp}</span>
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
                  {SORTABLE_COLS.map((col) => (
                    <th
                      key={col.key}
                      className={`admin-th-sortable${sortKey === col.key ? " active" : ""}`}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {sortKey === col.key && <span className="sort-arrow">{sortDir === "asc" ? " ▲" : " ▼"}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((d) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>
                      <Link to={`/admin/drivers/${d.id}`} className="admin-table-link">
                        {d.nama}
                      </Link>
                    </td>
                    <td>{d.no_hp}</td>
                    <td>{d.jenis_kendaraan}</td>
                    <td>{d.no_plat}</td>
                    <td><Star size={14} className="star-icon" /> {d.rating.toFixed(2)}</td>
                    <td>{d.total_pengiriman}</td>
                    <td>{d.total_distance.toFixed(1)} km</td>
                    <td>{d.total_waktu_menit} min</td>
                    <td>
                      <span className={`admin-badge status-${d.status}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>{new Date(d.created_at).toLocaleDateString()}</td>
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
