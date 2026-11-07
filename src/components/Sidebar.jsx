import { NavLink } from "react-router";
import { useContext } from "react";
import { LayoutDashboard, Users, LogOut, Package } from "lucide-react";
import { AuthContext } from "../contexts/AuthContextValue";
import styles from "./Sidebar.module.css";

function initials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function navLinkClass({ isActive }) {
  return styles.navItem + (isActive ? " " + styles.navItemActive : "");
}

function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const displayName = user.email;
  const roleLabel = user.roles.join(", ");
  const isAdmin = user.roles.includes("ADMIN");

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className={styles.logoText}>Simple CRM</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navLabel}>Workspace</div>
        <NavLink to="/app" end className={navLinkClass}>
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </NavLink>
        {/* <NavLink to="/app/customers" className={({isActive})=>{ isActive ? styles.navActive: styles.navItem}}> */}
        {/* <NavLink
          to="/app/customers"
          className={({ isActive }) => {
            isActive ? styles.navActive : styles.navItem;
            }}
            > */}
        {/* <NavLink to="customers" className={navLinkClass}> */}
        <NavLink to="/app/customers" className={navLinkClass}>
          <Users size={17} />
          <span>Customers</span>
        </NavLink>
        <NavLink to="/app/products" className={navLinkClass}>
          <Package size={17} />
          <span>Products</span>
        </NavLink>
        {/* don't use a for internal links */}
        {/* <a href="/app/customers" className={styles.navItem}>
          <Users size={17} />
          <span>Customers (a)</span>
        </a> */}
        {/* <a href="https://www.google.com.sg" target="_blank" rel="noopener noreferrer" className={styles.navItem}>
          <Users size={17} />
          <span>Google</span>
        </a> */}
      </nav>

      <div className={styles.foot}>
        <div className={styles.footAvatar}>{initials(displayName)}</div>
        <div className={styles.footWho}>
          <div className={styles.footName}>{displayName}</div>
          <span
            className={`${styles.roleBadge} ${isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeUser
              }`}
          >
            {roleLabel}
          </span>
          <span
            className={`${styles.roleBadge} ${import.meta.env.DEV ? styles.roleBadgeUser : styles.roleBadgeAdmin
              }`}
          >
            {import.meta.env.MODE}
          </span>
        </div>
        <button className={styles.signOutBtn} onClick={logout} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
