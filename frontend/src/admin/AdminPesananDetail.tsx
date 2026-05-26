import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star } from "lucide-react";
import { getAdminOrderDetail } from "../services/api";
import { OrderDetail } from "../types";

export default function AdminPesananDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAdminOrderDetail(Number(id))
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="admin-loading">Loading order details...</div>;
  if (!data) return <div className="admin-loading">Order not found.</div>;

  const p = data.pesanan;
  const d = data.driver;
  const pg = data.pengiriman;
  const items = data.items;

  const totalItems = items.reduce((sum, i) => sum + i.subtotal, 0);

  const formatPrice = (v: number) =>
    "Rp" + Number(v).toLocaleString("id-ID");

  const fmt = (ts: string | null | undefined) =>
    ts ? new Date(ts).toLocaleString() : "-";

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link to="/admin/pesanan" className="admin-btn admin-btn-secondary">
          &larr; Back to Orders
        </Link>
      </div>

      <div className="admin-detail-grid">
        <div className="admin-card">
          <h3>Order Info</h3>
          <div className="admin-info-grid">
            <div className="admin-info-item">
              <label>Order ID</label>
              <span>#{p.id}</span>
            </div>
            <div className="admin-info-item">
              <label>Status</label>
              <span>
                <span className={`admin-badge status-${p.status}`}>{p.status}</span>
              </span>
            </div>
            <div className="admin-info-item">
              <label>Total</label>
              <span>{formatPrice(p.total_harga)}</span>
            </div>
            <div className="admin-info-item">
              <label>Created</label>
              <span>{fmt(p.created_at)}</span>
            </div>
            <div className="admin-info-item" style={{ gridColumn: "1 / -1" }}>
              <label>Address</label>
              <span>{p.alamat_pengiriman}</span>
            </div>
            {p.catatan && (
              <div className="admin-info-item" style={{ gridColumn: "1 / -1" }}>
                <label>Notes</label>
                <span>{p.catatan}</span>
              </div>
            )}
          </div>
        </div>

        <div className="admin-card">
          <h3>Customer</h3>
          <div className="admin-info-grid">
            <div className="admin-info-item">
              <label>Name</label>
              <span>{p.pelanggan_nama}</span>
            </div>
            <div className="admin-info-item">
              <label>Email</label>
              <span>{p.pelanggan_email}</span>
            </div>
            <div className="admin-info-item">
              <label>Phone</label>
              <span>{p.pelanggan_no_hp}</span>
            </div>
            <div className="admin-info-item">
              <label>Address</label>
              <span>{p.pelanggan_alamat}</span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3>Restaurant</h3>
          <div className="admin-info-grid">
            <div className="admin-info-item">
              <label>Name</label>
              <span>{p.restoran_nama}</span>
            </div>
            <div className="admin-info-item">
              <label>Rating</label>
              <span><Star size={14} className="star-icon" /> {p.restoran_rating}</span>
            </div>
            <div className="admin-info-item">
              <label>Phone</label>
              <span>{p.restoran_no_telp}</span>
            </div>
            <div className="admin-info-item">
              <label>Address</label>
              <span>{p.restoran_alamat}</span>
            </div>
          </div>
        </div>

        {d && (
          <div className="admin-card">
            <h3>Driver</h3>
            <div className="admin-info-grid">
              <div className="admin-info-item">
                <label>Name</label>
                <span>
                  <Link to={`/admin/drivers/${d.id}`} className="admin-table-link">
                    {d.nama}
                  </Link>
                </span>
              </div>
              <div className="admin-info-item">
                <label>Rating</label>
                <span><Star size={14} className="star-icon" /> {d.rating}</span>
              </div>
              <div className="admin-info-item">
                <label>Vehicle</label>
                <span>{d.jenis_kendaraan}</span>
              </div>
              <div className="admin-info-item">
                <label>Plate</label>
                <span>{d.no_plat}</span>
              </div>
            </div>
          </div>
        )}

        {pg && (
          <div className="admin-card">
            <h3>Delivery</h3>
            <div className="admin-info-grid">
              <div className="admin-info-item">
                <label>Status</label>
                <span>
                  <span className={`admin-badge status-${pg.status_pengiriman}`}>
                    {pg.status_pengiriman}
                  </span>
                </span>
              </div>
              <div className="admin-info-item">
                <label>Distance</label>
                <span>{pg.jarak_km ? `${pg.jarak_km} km` : "-"}</span>
              </div>
              <div className="admin-info-item">
                <label>Assigned</label>
                <span>{fmt(pg.waktu_ditugaskan)}</span>
              </div>
              <div className="admin-info-item">
                <label>Pickup</label>
                <span>{fmt(pg.waktu_pickup)}</span>
              </div>
              {pg.waktu_sampai && (
                <div className="admin-info-item">
                  <label>Delivered</label>
                  <span>{fmt(pg.waktu_sampai)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="admin-card">
        <h3>Menu Items ({items.length})</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.nama}</td>
                  <td style={{ color: "var(--color-gray)", fontSize: 13 }}>{i.deskripsi}</td>
                  <td className="text-center">{i.qty}</td>
                  <td className="text-right">{formatPrice(i.harga_saat_pesan)}</td>
                  <td className="text-right">{formatPrice(i.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ fontWeight: 600, textAlign: "right" }}>
                  Total
                </td>
                <td className="text-right" style={{ fontWeight: 700, color: "var(--color-blue)" }}>
                  {formatPrice(totalItems)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
