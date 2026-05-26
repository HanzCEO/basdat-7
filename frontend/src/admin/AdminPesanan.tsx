import { useEffect, useState } from "react";
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

export default function AdminPesanan() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    getAdminOrders(search, statusFilter)
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

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
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Driver</th>
                  <th>Order Status</th>
                  <th>Delivery Status</th>
                  <th className="text-right">Total</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
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
