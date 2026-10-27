import { BarChart3, BookOpen, Home, Moon, Sun } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import "./Header.scss";

const navItems = [
  { to: "/#top", hash: "#top", label: "Головна", icon: <Home size={18} /> },
  { to: "/#curriculum", hash: "#curriculum", label: "Програма", icon: <BookOpen size={18} /> },
  { to: "/#progress", hash: "#progress", label: "Прогрес", icon: <BarChart3 size={18} /> },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { hash } = useLocation();

  return (
    <header className="header">
      <NavLink to="/" className="header__logo">
        <span className="header__logo-icon">♞</span>
        <span className="header__logo-text">Шахи для початківців</span>
      </NavLink>

      <nav className="header__nav">
        {navItems.map(({ to, hash: itemHash, label, icon }) => {
          const isSelected = hash === itemHash || (!hash && itemHash === "#top");
          return (
            <Link
              key={to}
              to={to}
              className={`header__link${isSelected ? " header__link--active" : ""}`}
              aria-current={isSelected ? "page" : undefined}
            >
              {icon}
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="header__theme-button"
        onClick={toggleTheme}
        aria-label="Змінити тему"
        aria-pressed={theme === "dark"}
      >
        {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
}
