import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Users, Map, FileText, ArrowLeft,
} from "lucide-react";
import "./Admin.scss";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/pesanan", label: "Pesanan", icon: ClipboardList },
  { to: "/admin/drivers", label: "Drivers", icon: Users },
  { to: "/admin/map", label: "Live Map", icon: Map },
  { to: "/admin/reports", label: "Reports", icon: FileText },
];

export default function AdminLayout() {
  const location = useLocation();
  const currentLabel =
    navItems.find((n) =>
      n.to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(n.to)
    )?.label || "Admin";

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h1>MakanAntar</h1>
          <p>Admin Dashboard</p>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <NavLink to="/" className="admin-nav-link">
            <ArrowLeft size={18} />
            Customer App
          </NavLink>
        </div>
      </aside>
      <div className="admin-content-area">
        <header className="admin-header">
          <h2>{currentLabel}</h2>
        </header>
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
