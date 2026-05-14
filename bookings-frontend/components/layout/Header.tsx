import { User, Menu, Sun, Moon } from "lucide-react";

export default function Header({
  onToggleSidebar,
  theme,
  onChangeTheme
}: {
  onToggleSidebar: () => void;
  theme: string;
  onChangeTheme: (theme: string) => void;
}) {
  return (
    <header className="admin-header">
      <div style={{ display: "flex", alignItems: "center" }}>
        <button className="mobile-toggle" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        <div>
          <h1 className="admin-header__title">BookFlow Admin</h1>
          <p className="admin-header__subtitle">
            Plataforma de gestión de reservas y cobros
          </p>
        </div>
      </div>

      <div className="admin-header__actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <select
          value={theme}
          onChange={(e) => onChangeTheme(e.target.value)}
          className="select"
          style={{
            width: "auto",
            padding: "8px 12px",
            fontSize: "13px",
            borderRadius: "12px",
            background: "var(--surface)",
            color: "var(--text)",
            cursor: "pointer"
          }}
          title="Cambiar tema"
        >
          <option value="dark">🌙 Oscuro</option>
          <option value="light">☀️ Claro</option>
          <option value="pink">🌸 Rosa</option>
          <option value="green">🌳 Verde</option>
          <option value="orange">🍊 Naranja</option>
        </select>
        <div className="admin-avatar">
          <User size={20} strokeWidth={2} />
        </div>
      </div>
    </header>
  );
}