"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Users, CreditCard, X } from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  { label: "Tablero", href: "/dashboard", icon: LayoutDashboard },
  { label: "Reservas", href: "/bookings", icon: Calendar },
  { label: "Clientes", href: "/customers", icon: Users },
  { label: "Pagos", href: "/payments", icon: CreditCard },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={`admin-sidebar ${isOpen ? "admin-sidebar--open" : ""}`}>
      <div className="admin-sidebar__brand">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            <h2 className="admin-sidebar__title">BookFlow</h2>
            <p className="admin-sidebar__subtitle">Control Center</p>
          </div>
          <button className="mobile-toggle" onClick={onClose} style={{ marginRight: 0 }}>
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="admin-sidebar__nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
              onClick={() => {
                if (window.innerWidth <= 1024) onClose();
              }}
            >
              <motion.span 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="admin-sidebar__icon"
                style={{ display: "flex", alignItems: "center" }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </motion.span>
              <span>{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="active-indicator"
                  style={{ 
                    marginLeft: "auto", 
                    width: "4px", 
                    height: "18px", 
                    background: "var(--primary)",
                    borderRadius: "4px"
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div style={{ marginTop: "auto", padding: "12px", opacity: 0.4, fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em" }}>
        V1.0.4 PREMIUM EDITION
      </div>
    </aside>
  );
}