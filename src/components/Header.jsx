import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextValue";
import styles from "./Header.module.css";

function Header() {
  const { user, logout } = useContext(AuthContext);
  const roleLabel = user.roles.join(", ");
  const isAdmin = user.roles.includes("ADMIN");
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Simple CRM</h1>
      <div className={styles.userArea}>
        <span className={styles.userName}>{user.email}</span>
        <span
          className={`${styles.roleBadge} ${isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeUser}`}
        >
          {roleLabel}
        </span>
        <button className={styles.logoutBtn} onClick={logout}>
          Sign out
        </button>
      </div>
    </header>
  );
}

export default Header;
