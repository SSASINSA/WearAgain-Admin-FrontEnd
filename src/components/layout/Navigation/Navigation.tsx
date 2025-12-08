import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./Navigation.module.css";

const Navigation: React.FC = () => {
  const location = useLocation();
  const { role, isLoading: isRoleLoading } = useAuth();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isAdminFeaturesDropdownOpen, setIsAdminFeaturesDropdownOpen] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === "/admin-users") {
      setIsAdminDropdownOpen(true);
    }
    if (location.pathname === "/approval" || location.pathname === "/events/approval") {
      setIsAdminFeaturesDropdownOpen(true);
    }
    if (location.pathname === "/store" || location.pathname === "/store/orders" || location.pathname.startsWith("/store/")) {
      setIsStoreDropdownOpen(true);
    }
  }, [location.pathname]);

  const allNavItems = [
    {
      path: "/",
      icon: "/admin/img/icon/dashboard.svg",
      label: "대시보드",
    },
    {
      path: "/events",
      icon: "/admin/img/icon/events.svg",
      label: "행사 관리",
    },
    {
      path: "/posts",
      icon: "/admin/img/icon/posts.svg",
      label: "게시글 관리",
    },
  ];

  const getNavItems = () => {
    if (role === "MANAGER") {
      return allNavItems.filter((item) => item.path === "/" || item.path === "/events");
    }
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return [
        ...allNavItems,
        {
          path: "/users",
          icon: "/admin/img/icon/users.svg",
          label: "유저 관리",
        },
      ];
    }
    return allNavItems;
  };

  const navItems = getNavItems();

  return (
    <aside className={styles["sidebar"]}>
      <div className={styles["sidebar-header"]}>
        <h2>관리자 페이지</h2>
      </div>
      <nav className={styles["sidebar-nav"]}>
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className={location.pathname === item.path ? styles["active"] : ""}>
              <Link to={item.path} className={styles["nav-item"]}>
                {item.icon.startsWith("/") ? (
                  <img src={item.icon} alt="" />
                ) : (
                  <span className={styles["emoji-icon"]}>{item.icon}</span>
                )}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          <li className={`${styles["nav-dropdown"]} ${isStoreDropdownOpen ? styles["open"] : ""}`}>
            <button
              className={`${styles["nav-item"]} ${styles["nav-dropdown-toggle"]}`}
              onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
            >
              <img src="/admin/img/icon/store.svg" alt="" />
              <span>상점 관리</span>
              <span className={`${styles["dropdown-arrow"]} ${isStoreDropdownOpen ? styles["open"] : ""}`}>▼</span>
            </button>
            <ul className={styles["nav-dropdown-menu"]}>
              <li className={location.pathname === "/store" || (location.pathname.startsWith("/store/") && location.pathname !== "/store/orders") ? styles["active"] : ""}>
                <Link to="/store" className={styles["nav-dropdown-item"]}>
                  <img src="/admin/img/icon/store.svg" alt="" />
                  <span>상품 관리</span>
                </Link>
              </li>
              <li className={location.pathname === "/store/orders" ? styles["active"] : ""}>
                <Link to="/store/orders" className={styles["nav-dropdown-item"]}>
                  <img src="/admin/img/icon/document.svg" alt="" />
                  <span>상품 주문 관리</span>
                </Link>
              </li>
            </ul>
          </li>
          <li className={`${styles["nav-dropdown"]} ${isAdminFeaturesDropdownOpen ? styles["open"] : ""}`}>
            <button
              className={`${styles["nav-item"]} ${styles["nav-dropdown-toggle"]}`}
              onClick={() => setIsAdminFeaturesDropdownOpen(!isAdminFeaturesDropdownOpen)}
            >
              <img src="/admin/img/icon/check-circle.svg" alt="" />
              <span>관리자 기능</span>
              <span className={`${styles["dropdown-arrow"]} ${isAdminFeaturesDropdownOpen ? styles["open"] : ""}`}>▼</span>
            </button>
            <ul className={styles["nav-dropdown-menu"]}>
              <li className={location.pathname === "/approval" ? styles["active"] : ""}>
                <Link to="/approval" className={styles["nav-dropdown-item"]}>
                  <img src="/admin/img/icon/check-circle.svg" alt="" />
                  <span>관리자 계정 승인</span>
                </Link>
              </li>
              <li className={location.pathname === "/events/approval" ? styles["active"] : ""}>
                <Link to="/events/approval" className={styles["nav-dropdown-item"]}>
                  <img src="/admin/img/icon/check-circle.svg" alt="" />
                  <span>행사등록 승인</span>
                </Link>
              </li>
            </ul>
          </li>
          {!isRoleLoading && role === "SUPER_ADMIN" && (
            <li className={`${styles["nav-dropdown"]} ${isAdminDropdownOpen ? styles["open"] : ""}`}>
              <button
                className={`${styles["nav-item"]} ${styles["nav-dropdown-toggle"]}`}
                onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
              >
                <img src="/admin/img/icon/user-icon.svg" alt="" />
                <span>최고 관리자</span>
                <span className={`${styles["dropdown-arrow"]} ${isAdminDropdownOpen ? styles["open"] : ""}`}>▼</span>
              </button>
              <ul className={styles["nav-dropdown-menu"]}>
                <li className={location.pathname === "/admin-users" ? styles["active"] : ""}>
                  <Link to="/admin-users" className={styles["nav-dropdown-item"]}>
                    <img src="/admin/img/icon/user-icon.svg" alt="" />
                    <span>관리자 계정 목록</span>
                  </Link>
                </li>
              </ul>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Navigation;
