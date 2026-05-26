import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminOrders } from "../services/api";
import { OrderSummary } from "../types";

const STATUSES = [
  "",
  "menunggu_konfirmasi",
  "dikonfirmasi",
  "driver_ditugaskan",
  "dalam_pengiriman",
  "selesai",
  "dibatalkan",
];

type SortKey = "id" | "pelanggan_nama" | "restoran_nama" | "driver_nama" | "status" | "status_pengiriman" | "total_harga" | "alamat_pengiriman" | "created_at";

function sortData(data: OrderSummary[], key: SortKey, dir: "asc" | "desc"): OrderSummary[] {
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

const SORTABLE_COLS: { key: SortKey; label: string; align?: string }[] = [
  { key: "id", label: "Order ID" },
  { key: "pelanggan_nama", label: "Customer" },
  { key: "restoran_nama", label: "Restaurant" },
  { key: "driver_nama", label: "Driver" },
  { key: "status", label: "Order Status" },
  { key: "status_pengiriman", label: "Delivery Status" },
  { key: "total_harga", label: "Total", align: "text-right" },
  { key: "alamat_pengiriman", label: "Address" },
];

export default function AdminPesanan() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setLoading(true);
    getAdminOrders(search, statusFilter)
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  const sorted = useMemo(() => sortData(orders, sortKey, sortDir), [orders, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const formatPrice = (v: number) =>
    "Rp" + Number(v).toLocaleString("id-ID");

  return (
    <div>
      <div className="admin-toolbar">
        <input
          className="admin-search-input"
          type="text"
          placeholder="Search by ID, customer, restaurant, or driver..."
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
        <div className="admin-loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="admin-loading">No orders found.</div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {SORTABLE_COLS.map((col) => (
                    <th
                      key={col.key}
                      className={`admin-th-sortable${col.align ? " " + col.align : ""}${sortKey === col.key ? " active" : ""}`}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {sortKey === col.key && <span className="sort-arrow">{sortDir === "asc" ? " ▲" : " ▼"}</span>}
                    </th>
                  ))}
                  <th>Notes</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/admin/pesanan/${o.id}`} className="admin-table-link">
                        #{o.id}
                      </Link>
                    </td>
                    <td>{o.pelanggan_nama}</td>
                    <td>{o.restoran_nama}</td>
                    <td>{o.driver_nama || "-"}</td>
                    <td>
                      <span className={`admin-badge status-${o.status}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      {o.status_pengiriman ? (
                        <span className={`admin-badge status-${o.status_pengiriman}`}>
                          {o.status_pengiriman}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="text-right">{formatPrice(o.total_harga)}</td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={o.alamat_pengiriman}>
                      {o.alamat_pengiriman}
                    </td>
                    <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={o.catatan || ""}>
                      {o.catatan || "-"}
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
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
